"""Plans, recharges (bills) and the account summary."""

import secrets
from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models import Bill, Customer, Plan, PlanCategory, Ticket, TicketStatus
from app.schemas import CardDetails
from app.services import payments
from app.services.notifications import notify


class PlanNotAvailableError(Exception):
    pass


class WrongConnectionTypeError(Exception):
    def __init__(self, connection: PlanCategory, plan: PlanCategory) -> None:
        super().__init__(f"{connection.value} customers cannot buy {plan.value} plans")
        self.connection = connection
        self.plan = plan


def list_plans(db: Session, category: PlanCategory | None = None) -> list[Plan]:
    stmt = select(Plan).where(Plan.is_active.is_(True))
    if category:
        stmt = stmt.where(Plan.category == category)
    return list(db.scalars(stmt.order_by(Plan.category, Plan.price)).all())


def get_plan(db: Session, plan_id: int) -> Plan | None:
    plan = db.get(Plan, plan_id)
    return plan if plan and plan.is_active else None


def describe_benefits(plan: Plan) -> str:
    if plan.category is PlanCategory.BROADBAND:
        return f"{plan.speed} speed, {plan.data} data, {plan.post_fup_speed} after FUP"
    parts = [f"{plan.data} data"]
    if plan.calls:
        parts.append(f"{plan.calls} calls")
    if plan.sms:
        parts.append(f"{plan.sms} SMS")
    return ", ".join(parts)


def recharge(db: Session, customer: Customer, plan_id: int, card: CardDetails) -> Bill:
    plan = get_plan(db, plan_id)
    if plan is None:
        raise PlanNotAvailableError
    if plan.category != customer.connection_type:
        raise WrongConnectionTypeError(customer.connection_type, plan.category)

    payment = payments.charge(db, customer, plan.price, card)  # may raise PaymentError
    today = date.today()
    bill = Bill(
        invoice_no="INV" + today.strftime("%y%m") + secrets.token_hex(4).upper(),
        customer_id=customer.id,
        plan_id=plan.id,
        payment=payment,
        category=plan.category,
        plan_name=plan.name,
        benefits=describe_benefits(plan),
        amount=plan.price,
        start_date=today,
        end_date=today + timedelta(days=plan.validity_days),
    )
    db.add(bill)
    db.commit()
    db.refresh(bill)
    notify(
        db,
        customer=customer,
        sms=True,
        subject=f"Recharge successful: ₹{plan.price} on {customer.mobile_no}",
        body=(
            f"Hi {customer.name}, your recharge of ₹{plan.price} ({plan.name}) on "
            f"{customer.mobile_no} is successful. Benefits: {bill.benefits}. "
            f"Valid till {bill.end_date:%d %b %Y}. Invoice {bill.invoice_no}."
        ),
    )
    return bill


def bills_for(db: Session, customer: Customer) -> list[Bill]:
    stmt = (
        select(Bill)
        .where(Bill.customer_id == customer.id)
        .options(selectinload(Bill.payment))
        .order_by(Bill.created_at.desc(), Bill.id.desc())
    )
    return list(db.scalars(stmt).all())


def get_bill_for(db: Session, customer: Customer, bill_id: int) -> Bill | None:
    bill = db.get(Bill, bill_id)
    return bill if bill and bill.customer_id == customer.id else None


def active_bill(db: Session, customer: Customer) -> Bill | None:
    stmt = (
        select(Bill)
        .where(Bill.customer_id == customer.id, Bill.end_date >= date.today())
        .order_by(Bill.end_date.desc())
        .limit(1)
    )
    return db.scalar(stmt)


def account_summary(db: Session, customer: Customer) -> dict:
    current = active_bill(db, customer)
    spent, count = db.execute(
        select(func.coalesce(func.sum(Bill.amount), 0), func.count(Bill.id)).where(
            Bill.customer_id == customer.id
        )
    ).one()
    open_tickets = db.scalar(
        select(func.count(Ticket.id)).where(
            Ticket.customer_id == customer.id, Ticket.status == TicketStatus.OPEN
        )
    )
    return {
        "customer": customer,
        "active_bill": current,
        "days_left": (current.end_date - date.today()).days if current else None,
        "total_spent": int(spent),
        "recharge_count": int(count),
        "open_tickets": int(open_tickets or 0),
    }
