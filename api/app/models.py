"""ORM models (SQLAlchemy 2, typed). Portable across SQLite and MySQL."""

from __future__ import annotations

import enum
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PlanCategory(enum.StrEnum):
    PREPAID = "prepaid"
    POSTPAID = "postpaid"
    BROADBAND = "broadband"


class TicketStatus(enum.StrEnum):
    OPEN = "open"
    RESOLVED = "resolved"


class Satisfaction(enum.StrEnum):
    EXCELLENT = "excellent"
    GOOD = "good"
    AVERAGE = "average"
    BAD = "bad"


def _enum(e: type[enum.Enum], name: str) -> Enum:
    # Store the lowercase values (not member names) as VARCHAR for portability.
    return Enum(
        e, name=name, native_enum=False, length=20, values_callable=lambda x: [m.value for m in x]
    )


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True)
    mobile_no: Mapped[str] = mapped_column(String(10), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(80))
    dob: Mapped[date] = mapped_column(Date)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    occupation: Mapped[str] = mapped_column(String(80))
    # Only the last four digits are kept; the full number is validated and discarded.
    aadhaar_last4: Mapped[str] = mapped_column(String(4))
    house_no: Mapped[str] = mapped_column(String(20))
    street: Mapped[str] = mapped_column(String(80))
    city: Mapped[str] = mapped_column(String(60))
    state: Mapped[str] = mapped_column(String(60))
    pincode: Mapped[str] = mapped_column(String(6))
    connection_type: Mapped[PlanCategory] = mapped_column(_enum(PlanCategory, "plan_category"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    bills: Mapped[list[Bill]] = relationship(
        back_populates="customer", cascade="all, delete-orphan"
    )
    tickets: Mapped[list[Ticket]] = relationship(
        back_populates="customer", cascade="all, delete-orphan"
    )


class Admin(Base):
    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    category: Mapped[PlanCategory] = mapped_column(_enum(PlanCategory, "plan_category"), index=True)
    name: Mapped[str] = mapped_column(String(60))
    price: Mapped[int] = mapped_column(Integer)  # whole rupees
    validity_days: Mapped[int] = mapped_column(Integer)
    data: Mapped[str] = mapped_column(String(40))  # "2GB/day", "125GB", "1000GB/month"
    calls: Mapped[str | None] = mapped_column(String(40))
    sms: Mapped[str | None] = mapped_column(String(40))
    speed: Mapped[str | None] = mapped_column(String(20))  # broadband only
    post_fup_speed: Mapped[str | None] = mapped_column(String(20))  # broadband only
    is_popular: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Payment(Base):
    """A mock card payment. Card numbers and CVVs are never stored."""

    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    reference: Mapped[str] = mapped_column(String(24), unique=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id", ondelete="CASCADE"))
    amount: Mapped[int] = mapped_column(Integer)
    card_brand: Mapped[str] = mapped_column(String(20))
    card_last4: Mapped[str] = mapped_column(String(4))
    cardholder_name: Mapped[str] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Bill(Base):
    """A recharge/bill. Plan details are snapshotted so later plan edits don't rewrite history."""

    __tablename__ = "bills"

    id: Mapped[int] = mapped_column(primary_key=True)
    invoice_no: Mapped[str] = mapped_column(String(24), unique=True)
    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id", ondelete="CASCADE"), index=True
    )
    plan_id: Mapped[int | None] = mapped_column(ForeignKey("plans.id", ondelete="SET NULL"))
    payment_id: Mapped[int | None] = mapped_column(ForeignKey("payments.id", ondelete="SET NULL"))
    category: Mapped[PlanCategory] = mapped_column(_enum(PlanCategory, "plan_category"), index=True)
    plan_name: Mapped[str] = mapped_column(String(60))
    benefits: Mapped[str] = mapped_column(String(255))
    amount: Mapped[int] = mapped_column(Integer)
    start_date: Mapped[date] = mapped_column(Date, index=True)
    end_date: Mapped[date] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    customer: Mapped[Customer] = relationship(back_populates="bills")
    payment: Mapped[Payment | None] = relationship()


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(primary_key=True)
    ticket_no: Mapped[str] = mapped_column(String(12), unique=True)
    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id", ondelete="CASCADE"), index=True
    )
    description: Mapped[str] = mapped_column(Text)
    assigned_to: Mapped[str] = mapped_column(String(50))
    status: Mapped[TicketStatus] = mapped_column(
        _enum(TicketStatus, "ticket_status"), default=TicketStatus.OPEN, index=True
    )
    response: Mapped[str | None] = mapped_column(Text)
    responded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    customer: Mapped[Customer] = relationship(back_populates="tickets")


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int | None] = mapped_column(ForeignKey("customers.id", ondelete="SET NULL"))
    name: Mapped[str] = mapped_column(String(80))
    email: Mapped[str] = mapped_column(String(255))
    satisfaction: Mapped[Satisfaction] = mapped_column(_enum(Satisfaction, "satisfaction"))
    comments: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Notification(Base):
    """Outbox for every e-mail/SMS the system sends (delivered via SMTP when configured)."""

    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int | None] = mapped_column(
        ForeignKey("customers.id", ondelete="CASCADE"), index=True
    )
    channel: Mapped[str] = mapped_column(String(10))  # "email" | "sms"
    recipient: Mapped[str] = mapped_column(String(255))
    subject: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)
    delivered: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
