"""Fixtures. SQLite in-memory by default; set TEST_DATABASE_URL to run on MySQL."""

import os
from collections.abc import Iterator
from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401
from app.db.base import Base
from app.db.session import get_db, make_engine
from app.main import create_app
from app.seed import seed_plans
from app.services import admin as admin_service

VALID_AADHAAR = "2345 6789 0124"
OTHER_AADHAAR = "987654321096"
PASSWORD = "s3cret-pass"
GOOD_CARD = {
    "cardholder_name": "Asha Verma",
    "number": "4242 4242 4242 4242",
    "exp_month": 12,
    "exp_year": date.today().year + 2,
    "cvv": "123",
}


def _make_engine() -> Engine:
    url = os.environ.get("TEST_DATABASE_URL")
    if url:
        return make_engine(url)
    engine = make_engine("sqlite://")
    engine.pool = StaticPool(engine.pool._creator)

    @event.listens_for(engine, "connect")
    def _fk(dbapi_conn, _):
        dbapi_conn.execute("PRAGMA foreign_keys=ON")

    return engine


@pytest.fixture(scope="session")
def engine() -> Engine:
    return _make_engine()


@pytest.fixture
def db(engine: Engine) -> Iterator[Session]:
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)()
    seed_plans(session)
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)


@pytest.fixture
def client(db: Session) -> Iterator[TestClient]:
    app = create_app()
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as c:
        yield c


def registration(**overrides) -> dict:
    body = {
        "name": "Asha Verma",
        "dob": "1995-04-18",
        "email": "asha@example.com",
        "password": PASSWORD,
        "occupation": "Designer",
        "aadhaar": VALID_AADHAAR,
        "house_no": "12",
        "street": "MG Road",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "pincode": "600041",
        "connection_type": "prepaid",
    }
    return body | overrides


@pytest.fixture
def register(client):
    """Register a customer and return (customer_json, auth_headers)."""

    def _register(**overrides):
        res = client.post("/api/v1/auth/register", json=registration(**overrides))
        assert res.status_code == 201, res.text
        customer = res.json()["customer"]
        login = client.post(
            "/api/v1/auth/login",
            json={
                "mobile_no": customer["mobile_no"],
                "password": overrides.get("password", PASSWORD),
            },
        )
        assert login.status_code == 200, login.text
        return customer, {"Authorization": f"Bearer {login.json()['access_token']}"}

    return _register


@pytest.fixture
def admin_headers(client, db) -> dict[str, str]:
    admin_service.create_admin(db, "admin", "admin-pass1")
    res = client.post(
        "/api/v1/auth/admin/login", json={"username": "admin", "password": "admin-pass1"}
    )
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


def plan_id(client, category: str, price: int) -> int:
    plans = client.get("/api/v1/plans", params={"category": category}).json()
    return next(p["id"] for p in plans if p["price"] == price)
