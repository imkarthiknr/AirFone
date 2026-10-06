"""Admin console: authentication, customers, tickets, billing report, stats and outbox."""

import math
from datetime import date

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.core.security import hash_password, verify_password
from app.models import (
    Admin,
    Bill,
    Customer,
    Feedback,
    Notification,
    PlanCategory,
    Ticket,
    TicketStatus,
)
from app.schemas import AdminCustomerUpdate, AdminProfileUpdate

_DUMMY_HASH = hash_password("timing-equaliser-not-a-real-password-2")


class UsernameTakenError(Exception):
    pass


class WrongPasswordError(Exception):
    pass


def get_by_username(db: Session, username: str) -> Admin | None:
    return db.scalar(select(Admin).where(func.lower(Admin.username) == username.lower()))


def authenticate(db: Session, username: str, password: str) -> Admin | None:
    admin = get_by_username(db, username)
    if admin is None:
        verify_password(password, _DUMMY_HASH)
        return None
    return admin if verify_password(password, admin.password_hash) else None


def create_admin(db: Session, username: str, password: str) -> Admin:
    admin = Admin(username=username, password_hash=hash_password(password))
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


def update_profile(db: Session, admin: Admin, data: AdminProfileUpdate) -> Admin:
    if not verify_password(data.current_password, admin.password_hash):
        raise WrongPasswordError
    other = get_by_username(db, data.username)
    if other and other.id != admin.id:
        raise UsernameTakenError
    admin.username = data.username
    if data.new_password:
        admin.password_hash = hash_password(data.new_password)
    db.commit()
    db.refresh(admin)
    return admin


def _escape(term: str) -> str:
    return term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def _paginate(db: Session, stmt: Select, page: int, size: int) -> tuple[list, int, int]:
    total = db.scalar(select(func.count()).select_from(stmt.order_by(None).subquery())) or 0
    items = list(db.scalars(stmt.offset((page - 1) * size).limit(size)).unique().all())
    return items, total, max(1, math.ceil(total / size))


def search_customers(
    db: Session, q: str, connection_type: PlanCategory | None, page: int, size: int
) -> tuple[list[Customer], int, int]:
    stmt = select(Customer)
    if q:
        pattern = f"%{_escape(q.strip())}%"
        stmt = stmt.where(
            or_(
                Customer.name.ilike(pattern, escape="\\"),
                Customer.email.ilike(pattern, escape="\\"),
                Customer.mobile_no.ilike(pattern, escape="\\"),
            )
        )
    if connection_type:
        stmt = stmt.where(Customer.connection_type == connection_type)
    return _paginate(db, stmt.order_by(Customer.id.desc()), page, size)


def update_customer(db: Session, customer: Customer, data: AdminCustomerUpdate) -> Customer:
    customer.name = data.name.strip()
    customer.connection_type = data.connection_type
    customer.is_active = data.is_active
    db.commit()
    db.refresh(customer)
    return customer


def delete_customer(db: Session, customer: Customer) -> None:
    db.delete(customer)
    db.commit()


def search_tickets(
    db: Session, status: TicketStatus | None, page: int, size: int
) -> tuple[list[Ticket], int, int]:
    stmt = select(Ticket).options(joinedload(Ticket.customer))
    if status:
        stmt = stmt.where(Ticket.status == status)
    return _paginate(db, stmt.order_by(Ticket.id.desc()), page, size)


def get_ticket(db: Session, ticket_id: int) -> Ticket | None:
    return db.scalar(
        select(Ticket).options(joinedload(Ticket.customer)).where(Ticket.id == ticket_id)
    )


def billing_report(
    db: Session, start: date, end: date, category: PlanCategory | None
) -> list[tuple[Bill, Customer]]:
    """Bills whose start date falls in [start, end] (the original's 'bill generation')."""
    stmt = (
        select(Bill, Customer)
        .join(Customer, Bill.customer_id == Customer.id)
        .where(Bill.start_date >= start, Bill.start_date <= end)
        .order_by(Bill.start_date, Bill.id)
    )
    if category:
        stmt = stmt.where(Bill.category == category)
    return [(b, c) for b, c in db.execute(stmt).all()]


def stats(db: Session) -> dict:
    by_type = dict(
        db.execute(
            select(Customer.connection_type, func.count(Customer.id)).group_by(
                Customer.connection_type
            )
        ).all()
    )
    month_start = date.today().replace(day=1)
    revenue, recharges = db.execute(
        select(func.coalesce(func.sum(Bill.amount), 0), func.count(Bill.id)).where(
            Bill.start_date >= month_start
        )
    ).one()
    feedback = dict(
        db.execute(
            select(Feedback.satisfaction, func.count(Feedback.id)).group_by(Feedback.satisfaction)
        ).all()
    )
    return {
        "customers_by_type": {c.value: int(by_type.get(c, 0)) for c in PlanCategory},
        "open_tickets": int(
            db.scalar(select(func.count(Ticket.id)).where(Ticket.status == TicketStatus.OPEN)) or 0
        ),
        "revenue_this_month": int(revenue),
        "recharges_this_month": int(recharges),
        "feedback_breakdown": {k.value: int(v) for k, v in feedback.items()},
    }


def list_feedback(db: Session, page: int, size: int) -> tuple[list[Feedback], int, int]:
    return _paginate(db, select(Feedback).order_by(Feedback.id.desc()), page, size)


def list_notifications(db: Session, page: int, size: int) -> tuple[list[Notification], int, int]:
    return _paginate(db, select(Notification).order_by(Notification.id.desc()), page, size)
