"""The signed-in customer's account."""

from fastapi import APIRouter, status
from sqlalchemy import select

from app.api.deps import CurrentCustomer, DbSession
from app.api.errors import ApiError
from app.models import Notification
from app.schemas import (
    AccountSummary,
    BillRead,
    ChangePassword,
    CustomerProfileUpdate,
    CustomerRead,
    NotificationRead,
    RechargeRequest,
    TicketCreate,
    TicketRead,
)
from app.services import billing, customers, payments, support

router = APIRouter(prefix="/me", tags=["my account"])


@router.get("", response_model=AccountSummary)
def summary(customer: CurrentCustomer, db: DbSession) -> AccountSummary:
    return AccountSummary.model_validate(
        billing.account_summary(db, customer), from_attributes=True
    )


@router.put("/profile", response_model=CustomerRead)
def update_profile(data: CustomerProfileUpdate, customer: CurrentCustomer, db: DbSession):
    return CustomerRead.model_validate(customers.update_profile(db, customer, data))


@router.post("/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(data: ChangePassword, customer: CurrentCustomer, db: DbSession) -> None:
    if not customers.change_password(db, customer, data.current_password, data.new_password):
        raise ApiError(400, "Current password is incorrect.", {"current_password": "Incorrect."})


@router.get("/bills", response_model=list[BillRead])
def my_bills(customer: CurrentCustomer, db: DbSession) -> list[BillRead]:
    return [BillRead.model_validate(b) for b in billing.bills_for(db, customer)]


@router.get("/bills/{bill_id}", response_model=BillRead)
def my_bill(bill_id: int, customer: CurrentCustomer, db: DbSession) -> BillRead:
    bill = billing.get_bill_for(db, customer, bill_id)
    if bill is None:
        raise ApiError(404, "Bill not found.")
    return BillRead.model_validate(bill)


@router.post("/recharges", response_model=BillRead, status_code=status.HTTP_201_CREATED)
def recharge(data: RechargeRequest, customer: CurrentCustomer, db: DbSession) -> BillRead:
    """Buy a plan: validates the plan type, takes a (mock) card payment and issues a bill."""
    try:
        bill = billing.recharge(db, customer, data.plan_id, data.card)
    except billing.PlanNotAvailableError as exc:
        raise ApiError(404, "Plan not found.") from exc
    except billing.WrongConnectionTypeError as exc:
        raise ApiError(
            409,
            f"Your connection is {exc.connection.value}; choose a {exc.connection.value} plan.",
        ) from exc
    except payments.PaymentError as exc:
        db.rollback()
        fields = {exc.field: exc.message} if exc.field else None
        raise ApiError(402, exc.message, fields) from exc
    return BillRead.model_validate(bill)


@router.get("/tickets", response_model=list[TicketRead])
def my_tickets(customer: CurrentCustomer, db: DbSession) -> list[TicketRead]:
    return [TicketRead.model_validate(t) for t in support.tickets_for(db, customer)]


@router.post("/tickets", response_model=TicketRead, status_code=status.HTTP_201_CREATED)
def raise_ticket(data: TicketCreate, customer: CurrentCustomer, db: DbSession) -> TicketRead:
    return TicketRead.model_validate(support.create_ticket(db, customer, data.description))


@router.get("/notifications", response_model=list[NotificationRead])
def my_notifications(customer: CurrentCustomer, db: DbSession) -> list[NotificationRead]:
    """E-mails and SMS sent to this customer (newest first)."""
    rows = db.scalars(
        select(Notification)
        .where(Notification.customer_id == customer.id)
        .order_by(Notification.id.desc())
        .limit(50)
    ).all()
    return [NotificationRead.model_validate(n) for n in rows]
