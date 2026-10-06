"""Customer accounts: registration, login, profile and password reset."""

import secrets

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import (
    create_reset_token,
    hash_password,
    read_reset_token,
    reset_fingerprint_matches,
    verify_password,
)
from app.models import Customer
from app.schemas import CustomerProfileUpdate, CustomerRegister
from app.services.notifications import notify

_DUMMY_HASH = hash_password("timing-equaliser-not-a-real-password-1")


class EmailTakenError(Exception):
    pass


class InvalidResetTokenError(Exception):
    pass


def get_by_mobile(db: Session, mobile_no: str) -> Customer | None:
    return db.scalar(select(Customer).where(Customer.mobile_no == mobile_no))


def get_by_email(db: Session, email: str) -> Customer | None:
    return db.scalar(select(Customer).where(func.lower(Customer.email) == email.lower()))


def allocate_mobile_number(db: Session) -> str:
    """A random, unused 10-digit mobile number starting with 6-9 (as the original did)."""
    while True:
        candidate = str(secrets.choice("6789")) + "".join(
            secrets.choice("0123456789") for _ in range(9)
        )
        if get_by_mobile(db, candidate) is None:
            return candidate


def register(db: Session, data: CustomerRegister) -> Customer:
    if get_by_email(db, data.email):
        raise EmailTakenError
    customer = Customer(
        mobile_no=allocate_mobile_number(db),
        name=data.name,
        dob=data.dob,
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        occupation=data.occupation,
        aadhaar_last4=data.aadhaar[-4:],
        house_no=data.house_no,
        street=data.street,
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        connection_type=data.connection_type,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    notify(
        db,
        customer=customer,
        subject="Welcome to AirFone: your new mobile number",
        body=(
            f"Hi {customer.name},\n\nYour AirFone {customer.connection_type.value} connection is "
            f"ready. Your mobile number is {customer.mobile_no}.\n"
            "Log in with this number and your password to recharge.\n\nTeam AirFone"
        ),
    )
    return customer


def authenticate(db: Session, mobile_no: str, password: str) -> Customer | None:
    customer = get_by_mobile(db, mobile_no)
    if customer is None:
        verify_password(password, _DUMMY_HASH)
        return None
    if not customer.is_active or not verify_password(password, customer.password_hash):
        return None
    return customer


def update_profile(db: Session, customer: Customer, data: CustomerProfileUpdate) -> Customer:
    for field, value in data.model_dump().items():
        setattr(customer, field, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(customer)
    return customer


def change_password(db: Session, customer: Customer, current: str, new: str) -> bool:
    if not verify_password(current, customer.password_hash):
        return False
    customer.password_hash = hash_password(new)
    db.commit()
    return True


def request_password_reset(db: Session, email: str) -> None:
    """Send a reset link if the e-mail is registered. Silent otherwise (no account probing)."""
    customer = get_by_email(db, email)
    if customer is None or not customer.is_active:
        return
    token = create_reset_token(customer.id, customer.password_hash)
    link = f"{get_settings().web_base_url}/reset-password?token={token}"
    minutes = get_settings().password_reset_expire_minutes
    notify(
        db,
        customer=customer,
        subject="Reset your AirFone password",
        body=(
            f"Hi {customer.name},\n\nWe received a request to reset the password for "
            f"{customer.mobile_no}. Open this link within {minutes} minutes:\n\n{link}\n\n"
            "If you didn't ask for this, you can ignore this e-mail."
        ),
    )


def reset_password(db: Session, token: str, new_password: str) -> Customer:
    parsed = read_reset_token(token)
    if parsed is None:
        raise InvalidResetTokenError
    customer_id, fingerprint = parsed
    customer = db.get(Customer, customer_id)
    if customer is None or not reset_fingerprint_matches(customer.password_hash, fingerprint):
        raise InvalidResetTokenError  # unknown user, or the link was already used
    customer.password_hash = hash_password(new_password)
    db.commit()
    return customer
