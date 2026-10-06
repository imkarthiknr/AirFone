"""Shared dependencies: DB session, current customer, current admin."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import Admin, Customer

bearer = HTTPBearer(auto_error=False)
DbSession = Annotated[Session, Depends(get_db)]
Credentials = Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)]


def _unauthorized() -> HTTPException:
    return HTTPException(
        status.HTTP_401_UNAUTHORIZED, "Not authenticated", headers={"WWW-Authenticate": "Bearer"}
    )


def _claims(creds: HTTPAuthorizationCredentials | None) -> tuple[str, str] | None:
    return decode_access_token(creds.credentials) if creds else None


def optional_customer(db: DbSession, creds: Credentials) -> Customer | None:
    claims = _claims(creds)
    if not claims or claims[1] != "customer":
        return None
    customer = db.get(Customer, int(claims[0]))
    return customer if customer and customer.is_active else None


def current_customer(customer: Annotated[Customer | None, Depends(optional_customer)]) -> Customer:
    if customer is None:
        raise _unauthorized()
    return customer


def current_admin(db: DbSession, creds: Credentials) -> Admin:
    claims = _claims(creds)
    if not claims:
        raise _unauthorized()
    if claims[1] != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin access required")
    admin = db.get(Admin, int(claims[0]))
    if admin is None:
        raise _unauthorized()
    return admin


OptionalCustomer = Annotated[Customer | None, Depends(optional_customer)]
CurrentCustomer = Annotated[Customer, Depends(current_customer)]
CurrentAdmin = Annotated[Admin, Depends(current_admin)]
