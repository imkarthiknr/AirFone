"""Admin console endpoints (require an admin token)."""

import csv
import io
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Query, status
from fastapi.responses import StreamingResponse

from app.api.deps import CurrentAdmin, DbSession
from app.api.errors import ApiError
from app.models import Customer, PlanCategory, TicketStatus
from app.schemas import (
    AdminCustomerUpdate,
    AdminProfileUpdate,
    AdminRead,
    AdminStats,
    AdminTicketRead,
    BillingReport,
    BillingReportRow,
    BillRead,
    CustomerRead,
    FeedbackRead,
    NotificationRead,
    Page,
    TicketRespond,
)
from app.services import admin as svc
from app.services import billing, customers, support

router = APIRouter(prefix="/admin", tags=["admin"])

PageNo = Annotated[int, Query(ge=1)]
PageSize = Annotated[int, Query(ge=1, le=100)]


def _ticket_read(t) -> AdminTicketRead:
    return AdminTicketRead.model_validate(
        {
            **{k: getattr(t, k) for k in AdminTicketRead.model_fields if hasattr(t, k)},
            "customer_name": t.customer.name,
            "customer_email": t.customer.email,
            "customer_mobile": t.customer.mobile_no,
        }
    )


def _customer_or_404(db: DbSession, customer_id: int) -> Customer:
    customer = db.get(Customer, customer_id)
    if customer is None:
        raise ApiError(404, "Customer not found.")
    return customer


# ---------- profile & stats ----------


@router.get("/me", response_model=AdminRead)
def me(admin: CurrentAdmin) -> AdminRead:
    return AdminRead.model_validate(admin)


@router.put("/me", response_model=AdminRead)
def update_me(data: AdminProfileUpdate, admin: CurrentAdmin, db: DbSession) -> AdminRead:
    try:
        return AdminRead.model_validate(svc.update_profile(db, admin, data))
    except svc.WrongPasswordError as exc:
        raise ApiError(
            400, "Current password is incorrect.", {"current_password": "Incorrect."}
        ) from exc
    except svc.UsernameTakenError as exc:
        raise ApiError(409, "That username is taken.", {"username": "Already taken."}) from exc


@router.get("/stats", response_model=AdminStats)
def stats(_: CurrentAdmin, db: DbSession) -> AdminStats:
    return AdminStats.model_validate(svc.stats(db))


# ---------- customers ----------


@router.get("/customers", response_model=Page[CustomerRead])
def customers_list(
    _: CurrentAdmin,
    db: DbSession,
    q: Annotated[str, Query(max_length=80)] = "",
    connection_type: PlanCategory | None = None,
    page: PageNo = 1,
    size: PageSize = 20,
) -> Page[CustomerRead]:
    items, total, pages = svc.search_customers(db, q, connection_type, page, size)
    return Page[CustomerRead](
        items=[CustomerRead.model_validate(c) for c in items],
        total=total,
        page=page,
        size=size,
        pages=pages,
    )


@router.get("/customers/{customer_id}", response_model=CustomerRead)
def customer_detail(customer_id: int, _: CurrentAdmin, db: DbSession) -> CustomerRead:
    return CustomerRead.model_validate(_customer_or_404(db, customer_id))


@router.get("/customers/{customer_id}/bills", response_model=list[BillRead])
def customer_bills(customer_id: int, _: CurrentAdmin, db: DbSession) -> list[BillRead]:
    customer = _customer_or_404(db, customer_id)
    return [BillRead.model_validate(b) for b in billing.bills_for(db, customer)]


@router.put("/customers/{customer_id}", response_model=CustomerRead)
def customer_update(
    customer_id: int, data: AdminCustomerUpdate, _: CurrentAdmin, db: DbSession
) -> CustomerRead:
    customer = _customer_or_404(db, customer_id)
    return CustomerRead.model_validate(svc.update_customer(db, customer, data))


@router.post("/customers/{customer_id}/password-reset", status_code=status.HTTP_202_ACCEPTED)
def customer_password_reset(customer_id: int, _: CurrentAdmin, db: DbSession) -> dict[str, str]:
    """E-mail the customer a reset link (admins never see or set passwords)."""
    customer = _customer_or_404(db, customer_id)
    customers.request_password_reset(db, customer.email)
    return {"detail": f"Reset link sent to {customer.email}."}


@router.delete("/customers/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def customer_delete(customer_id: int, _: CurrentAdmin, db: DbSession) -> None:
    svc.delete_customer(db, _customer_or_404(db, customer_id))


# ---------- tickets ----------


@router.get("/tickets", response_model=Page[AdminTicketRead])
def tickets(
    _: CurrentAdmin,
    db: DbSession,
    status_filter: Annotated[TicketStatus | None, Query(alias="status")] = None,
    page: PageNo = 1,
    size: PageSize = 20,
) -> Page[AdminTicketRead]:
    items, total, pages = svc.search_tickets(db, status_filter, page, size)
    return Page[AdminTicketRead](
        items=[_ticket_read(t) for t in items], total=total, page=page, size=size, pages=pages
    )


@router.get("/tickets/{ticket_id}", response_model=AdminTicketRead)
def ticket(ticket_id: int, _: CurrentAdmin, db: DbSession) -> AdminTicketRead:
    t = svc.get_ticket(db, ticket_id)
    if t is None:
        raise ApiError(404, "Ticket not found.")
    return _ticket_read(t)


@router.post("/tickets/{ticket_id}/respond", response_model=AdminTicketRead)
def respond(
    ticket_id: int, data: TicketRespond, admin: CurrentAdmin, db: DbSession
) -> AdminTicketRead:
    """Reply to the customer (e-mailed) and mark the ticket resolved."""
    t = svc.get_ticket(db, ticket_id)
    if t is None:
        raise ApiError(404, "Ticket not found.")
    return _ticket_read(support.respond(db, t, data.message, admin.username))


# ---------- billing report ----------


def _report(db: DbSession, start: date, end: date, category: PlanCategory | None):
    if end < start:
        raise ApiError(422, "End date must be on or after start date.", {"end": "Before start."})
    rows = svc.billing_report(db, start, end, category)
    return [
        BillingReportRow(
            invoice_no=b.invoice_no,
            mobile_no=c.mobile_no,
            customer_name=c.name,
            email=c.email,
            category=b.category,
            plan_name=b.plan_name,
            amount=b.amount,
            start_date=b.start_date,
        )
        for b, c in rows
    ]


@router.get("/billing-report", response_model=BillingReport)
def billing_report(
    _: CurrentAdmin, db: DbSession, start: date, end: date, category: PlanCategory | None = None
) -> BillingReport:
    rows = _report(db, start, end, category)
    return BillingReport(
        start=start,
        end=end,
        category=category,
        rows=rows,
        total_amount=sum(r.amount for r in rows),
        count=len(rows),
    )


@router.get("/billing-report.csv", response_class=StreamingResponse)
def billing_report_csv(
    _: CurrentAdmin, db: DbSession, start: date, end: date, category: PlanCategory | None = None
):
    rows = _report(db, start, end, category)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Invoice", "Mobile", "Customer", "Email", "Type", "Plan", "Amount", "Date"])
    for r in rows:
        writer.writerow(
            [
                r.invoice_no,
                r.mobile_no,
                r.customer_name,
                r.email,
                r.category.value,
                r.plan_name,
                r.amount,
                r.start_date.isoformat(),
            ]
        )
    filename = f"airfone-bills-{start}-{end}.csv"
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ---------- feedback & outbox ----------


@router.get("/feedback", response_model=Page[FeedbackRead])
def feedback(_: CurrentAdmin, db: DbSession, page: PageNo = 1, size: PageSize = 20):
    items, total, pages = svc.list_feedback(db, page, size)
    return Page[FeedbackRead](
        items=[FeedbackRead.model_validate(f) for f in items],
        total=total,
        page=page,
        size=size,
        pages=pages,
    )


@router.get("/notifications", response_model=Page[NotificationRead])
def notifications(_: CurrentAdmin, db: DbSession, page: PageNo = 1, size: PageSize = 20):
    """The outbox: every e-mail/SMS the system has sent."""
    items, total, pages = svc.list_notifications(db, page, size)
    return Page[NotificationRead](
        items=[NotificationRead.model_validate(n) for n in items],
        total=total,
        page=page,
        size=size,
        pages=pages,
    )
