"""bcrypt password hashing and JWT tokens (access tokens + password-reset tokens)."""

import hashlib
from datetime import UTC, datetime, timedelta
from typing import Literal

import bcrypt
import jwt

from app.core.config import get_settings

MAX_PASSWORD_BYTES = 72
Role = Literal["customer", "admin"]


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except ValueError:
        return False


def _encode(payload: dict, minutes: int) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    payload = {**payload, "iat": now, "exp": now + timedelta(minutes=minutes)}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def _decode(token: str) -> dict | None:
    settings = get_settings()
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError:
        return None


def create_access_token(subject: str, role: Role) -> str:
    return _encode({"sub": subject, "role": role}, get_settings().access_token_expire_minutes)


def decode_access_token(token: str) -> tuple[str, Role] | None:
    payload = _decode(token)
    if not payload or payload.get("role") not in ("customer", "admin") or "sub" not in payload:
        return None
    return str(payload["sub"]), payload["role"]


def _fingerprint(password_hash: str) -> str:
    # Changing the password changes the fingerprint, which invalidates outstanding reset links.
    return hashlib.sha256(password_hash.encode()).hexdigest()[:16]


def create_reset_token(customer_id: int, password_hash: str) -> str:
    return _encode(
        {"sub": str(customer_id), "purpose": "reset", "fp": _fingerprint(password_hash)},
        get_settings().password_reset_expire_minutes,
    )


def read_reset_token(token: str) -> tuple[int, str] | None:
    """Return (customer_id, fingerprint) for a valid reset token."""
    payload = _decode(token)
    if not payload or payload.get("purpose") != "reset":
        return None
    try:
        return int(payload["sub"]), str(payload["fp"])
    except (KeyError, ValueError):
        return None


def reset_fingerprint_matches(password_hash: str, fingerprint: str) -> bool:
    return _fingerprint(password_hash) == fingerprint
