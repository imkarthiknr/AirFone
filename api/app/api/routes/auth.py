from fastapi import APIRouter, status

from app.api.deps import DbSession
from app.api.errors import ApiError
from app.core.security import create_access_token
from app.schemas import (
    AdminLogin,
    CustomerLogin,
    CustomerRead,
    CustomerRegister,
    ForgotPassword,
    RegisterResult,
    ResetPassword,
    Token,
)
from app.services import admin as admin_service
from app.services import customers

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=RegisterResult, status_code=status.HTTP_201_CREATED)
def register(data: CustomerRegister, db: DbSession) -> RegisterResult:
    """Open a new connection. A unique mobile number is allocated and e-mailed."""
    try:
        customer = customers.register(db, data)
    except customers.EmailTakenError as exc:
        raise ApiError(
            409, "This e-mail is already registered.", {"email": "Already registered."}
        ) from exc
    return RegisterResult(
        customer=CustomerRead.model_validate(customer),
        message=f"Your new AirFone number is {customer.mobile_no}.",
    )


@router.post("/login", response_model=Token)
def login(data: CustomerLogin, db: DbSession) -> Token:
    customer = customers.authenticate(db, data.mobile_no, data.password)
    if customer is None:
        raise ApiError(401, "Incorrect mobile number or password.")
    return Token(access_token=create_access_token(str(customer.id), "customer"), role="customer")


@router.post("/admin/login", response_model=Token)
def admin_login(data: AdminLogin, db: DbSession) -> Token:
    admin = admin_service.authenticate(db, data.username, data.password)
    if admin is None:
        raise ApiError(401, "Incorrect username or password.")
    return Token(access_token=create_access_token(str(admin.id), "admin"), role="admin")


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
def forgot_password(data: ForgotPassword, db: DbSession) -> dict[str, str]:
    """Always 202, whether or not the e-mail exists, so accounts can't be discovered."""
    customers.request_password_reset(db, data.email)
    return {"detail": "If that e-mail is registered, a reset link is on its way."}


@router.post("/reset-password")
def reset_password(data: ResetPassword, db: DbSession) -> dict[str, str]:
    try:
        customers.reset_password(db, data.token, data.new_password)
    except customers.InvalidResetTokenError as exc:
        raise ApiError(400, "This reset link is invalid, expired or already used.") from exc
    return {"detail": "Password updated. You can log in now."}
