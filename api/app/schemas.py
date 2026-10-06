"""Pydantic request/response models."""

import re
from datetime import date, datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.core.security import MAX_PASSWORD_BYTES
from app.core.validators import normalise_aadhaar
from app.models import PlanCategory, Satisfaction, TicketStatus

MOBILE_PATTERN = r"^[6-9]\d{9}$"


def _password_rules(value: str) -> str:
    if len(value.encode()) > MAX_PASSWORD_BYTES:
        raise ValueError(f"must be at most {MAX_PASSWORD_BYTES} bytes")
    if not re.search(r"[A-Za-z]", value) or not re.search(r"\d", value):
        raise ValueError("must contain at least one letter and one number")
    return value


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------- auth ----------


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class CustomerLogin(BaseModel):
    mobile_no: str = Field(pattern=MOBILE_PATTERN)
    password: str = Field(min_length=1, max_length=200)


class AdminLogin(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1, max_length=200)


class ForgotPassword(BaseModel):
    email: EmailStr


class ResetPassword(BaseModel):
    token: str
    new_password: str = Field(min_length=8)

    @field_validator("new_password")
    @classmethod
    def _password(cls, v: str) -> str:
        return _password_rules(v)


class ChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)

    @field_validator("new_password")
    @classmethod
    def _password(cls, v: str) -> str:
        return _password_rules(v)


# ---------- customers ----------


class Address(BaseModel):
    house_no: str = Field(min_length=1, max_length=20)
    street: str = Field(min_length=2, max_length=80)
    city: str = Field(min_length=2, max_length=60)
    state: str = Field(min_length=2, max_length=60)
    pincode: str = Field(pattern=r"^[1-9]\d{5}$")


class CustomerRegister(Address):
    name: str = Field(min_length=2, max_length=80)
    dob: date
    email: EmailStr
    password: str = Field(min_length=8)
    occupation: str = Field(min_length=2, max_length=80)
    aadhaar: str
    connection_type: PlanCategory

    @field_validator("name", "occupation", "house_no", "street", "city", "state", mode="before")
    @classmethod
    def _strip(cls, v: object) -> object:
        return v.strip() if isinstance(v, str) else v

    @field_validator("password")
    @classmethod
    def _password(cls, v: str) -> str:
        return _password_rules(v)

    @field_validator("aadhaar")
    @classmethod
    def _aadhaar(cls, v: str) -> str:
        return normalise_aadhaar(v)

    @field_validator("dob")
    @classmethod
    def _adult(cls, v: date) -> date:
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 18:
            raise ValueError("you must be at least 18 years old")
        if age > 120:
            raise ValueError("please enter a valid date of birth")
        return v


class CustomerProfileUpdate(Address):
    name: str = Field(min_length=2, max_length=80)
    occupation: str = Field(min_length=2, max_length=80)


class CustomerRead(ORM):
    id: int
    mobile_no: str
    name: str
    dob: date
    email: str
    occupation: str
    aadhaar_masked: str
    house_no: str
    street: str
    city: str
    state: str
    pincode: str
    connection_type: PlanCategory
    is_active: bool
    created_at: datetime

    @model_validator(mode="before")
    @classmethod
    def _mask(cls, data: object) -> object:
        last4 = getattr(data, "aadhaar_last4", None)
        if last4 is not None:
            # Build a plain dict so the ORM object isn't mutated.
            fields = {k: getattr(data, k) for k in cls.model_fields if hasattr(data, k)}
            fields["aadhaar_masked"] = f"XXXX XXXX {last4}"
            return fields
        return data


class RegisterResult(BaseModel):
    customer: CustomerRead
    message: str


class AdminCustomerUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    connection_type: PlanCategory
    is_active: bool


# ---------- plans ----------


class PlanRead(ORM):
    id: int
    category: PlanCategory
    name: str
    price: int
    validity_days: int
    data: str
    calls: str | None
    sms: str | None
    speed: str | None
    post_fup_speed: str | None
    is_popular: bool


# ---------- recharge / bills ----------


class CardDetails(BaseModel):
    cardholder_name: str = Field(min_length=2, max_length=80)
    number: str
    exp_month: int = Field(ge=1, le=12)
    exp_year: int = Field(ge=2000, le=2100)
    cvv: str = Field(pattern=r"^\d{3,4}$")

    @field_validator("number")
    @classmethod
    def _digits(cls, v: str) -> str:
        digits = re.sub(r"[\s-]", "", v)
        if not re.fullmatch(r"\d{13,19}", digits):
            raise ValueError("must be 13 to 19 digits")
        return digits


class RechargeRequest(BaseModel):
    plan_id: int
    card: CardDetails


class PaymentRead(ORM):
    reference: str
    amount: int
    card_brand: str
    card_last4: str
    created_at: datetime


class BillRead(ORM):
    id: int
    invoice_no: str
    category: PlanCategory
    plan_name: str
    benefits: str
    amount: int
    start_date: date
    end_date: date
    created_at: datetime
    payment: PaymentRead | None = None


class AccountSummary(BaseModel):
    customer: CustomerRead
    active_bill: BillRead | None
    days_left: int | None
    total_spent: int
    recharge_count: int
    open_tickets: int


# ---------- support / feedback ----------


class TicketCreate(BaseModel):
    description: str = Field(min_length=10, max_length=2000)


class TicketRead(ORM):
    id: int
    ticket_no: str
    description: str
    assigned_to: str
    status: TicketStatus
    response: str | None
    responded_at: datetime | None
    created_at: datetime


class AdminTicketRead(TicketRead):
    customer_name: str
    customer_email: str
    customer_mobile: str


class TicketRespond(BaseModel):
    message: str = Field(min_length=5, max_length=2000)


class FeedbackCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    satisfaction: Satisfaction
    comments: str | None = Field(default=None, max_length=2000)


class FeedbackRead(ORM):
    id: int
    name: str
    email: str
    satisfaction: Satisfaction
    comments: str | None
    created_at: datetime


class NotificationRead(ORM):
    id: int
    channel: str
    recipient: str
    subject: str
    body: str
    delivered: bool
    created_at: datetime


# ---------- admin ----------


class AdminRead(ORM):
    id: int
    username: str


class AdminProfileUpdate(BaseModel):
    username: str = Field(min_length=3, max_length=50, pattern=r"^[A-Za-z0-9_.-]+$")
    current_password: str
    new_password: str | None = Field(default=None, min_length=8)

    @field_validator("new_password")
    @classmethod
    def _password(cls, v: str | None) -> str | None:
        return _password_rules(v) if v else v


T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    size: int
    pages: int


class BillingReportRow(BaseModel):
    invoice_no: str
    mobile_no: str
    customer_name: str
    email: str
    category: PlanCategory
    plan_name: str
    amount: int
    start_date: date


class BillingReport(BaseModel):
    start: date
    end: date
    category: PlanCategory | None
    rows: list[BillingReportRow]
    total_amount: int
    count: int


class AdminStats(BaseModel):
    customers_by_type: dict[str, int]
    open_tickets: int
    revenue_this_month: int
    recharges_this_month: int
    feedback_breakdown: dict[str, int]
