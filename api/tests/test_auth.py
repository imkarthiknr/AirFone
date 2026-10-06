import re
from datetime import date

import pytest
from sqlalchemy import select

from app.models import Customer, Notification
from tests.conftest import OTHER_AADHAAR, PASSWORD, registration

REGISTER = "/api/v1/auth/register"


def test_register_allocates_a_mobile_number_and_stores_only_aadhaar_last4(client, db):
    res = client.post(REGISTER, json=registration())
    assert res.status_code == 201
    customer = res.json()["customer"]
    assert re.fullmatch(r"[6-9]\d{9}", customer["mobile_no"])
    assert customer["aadhaar_masked"] == "XXXX XXXX 0124"
    assert customer["email"] == "asha@example.com"
    assert "password" not in str(res.json()).lower().replace("password_hash", "")
    stored = db.scalar(select(Customer))
    assert stored.aadhaar_last4 == "0124"
    assert stored.password_hash.startswith("$2b$")
    welcome = db.scalar(select(Notification))
    assert customer["mobile_no"] in welcome.body
    assert welcome.recipient == "asha@example.com"


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("aadhaar", "2345 6789 0125"),  # checksum
        ("aadhaar", "1234 5678 9012"),  # starts with 1
        ("dob", str(date.today().replace(year=date.today().year - 10))),  # under 18
        ("password", "lettersonly"),
        ("pincode", "012345"),
        ("connection_type", "satellite"),
        ("email", "nope"),
    ],
)
def test_register_validation(client, field, value):
    res = client.post(REGISTER, json=registration(**{field: value}))
    assert res.status_code == 422
    assert res.json()["detail"][0]["loc"][-1] == field


def test_duplicate_email(client):
    assert client.post(REGISTER, json=registration()).status_code == 201
    res = client.post(REGISTER, json=registration(email="ASHA@example.com", aadhaar=OTHER_AADHAAR))
    assert res.status_code == 409
    assert res.json()["fields"] == {"email": "Already registered."}


def test_login(client, register):
    customer, _ = register()
    bad = client.post(
        "/api/v1/auth/login", json={"mobile_no": customer["mobile_no"], "password": "wrong-pass1"}
    )
    assert bad.status_code == 401
    unknown = client.post("/api/v1/auth/login", json={"mobile_no": "9999999999", "password": "x"})
    assert unknown.status_code == 401


def test_roles_are_separated(client, register, admin_headers):
    _, customer_headers = register()
    assert client.get("/api/v1/admin/stats", headers=customer_headers).status_code == 403
    assert client.get("/api/v1/me", headers=admin_headers).status_code == 401
    assert client.get("/api/v1/me").status_code == 401


def test_password_reset_flow(client, db, register):
    customer, _ = register()
    for email in ["asha@example.com", "nobody@example.com"]:  # same answer either way
        res = client.post("/api/v1/auth/forgot-password", json={"email": email})
        assert res.status_code == 202

    mail = db.scalars(select(Notification).order_by(Notification.id.desc())).first()
    assert mail.subject == "Reset your AirFone password"
    token = re.search(r"token=(\S+)", mail.body).group(1)

    ok = client.post(
        "/api/v1/auth/reset-password", json={"token": token, "new_password": "brand-new-1"}
    )
    assert ok.status_code == 200
    login = client.post(
        "/api/v1/auth/login", json={"mobile_no": customer["mobile_no"], "password": "brand-new-1"}
    )
    assert login.status_code == 200

    reused = client.post(
        "/api/v1/auth/reset-password", json={"token": token, "new_password": "again-new-2"}
    )
    assert reused.status_code == 400  # one-time link
    junk = client.post(
        "/api/v1/auth/reset-password", json={"token": "x", "new_password": "abc12345"}
    )
    assert junk.status_code == 400


def test_change_password_and_profile(client, register):
    _, headers = register()
    wrong = client.post(
        "/api/v1/me/password",
        json={"current_password": "nope", "new_password": "fresh-pass1"},
        headers=headers,
    )
    assert wrong.status_code == 400
    ok = client.post(
        "/api/v1/me/password",
        json={"current_password": PASSWORD, "new_password": "fresh-pass1"},
        headers=headers,
    )
    assert ok.status_code == 204

    profile = {
        "name": "Asha V",
        "occupation": "Lead Designer",
        "house_no": "7A",
        "street": "Anna Salai",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "pincode": "600002",
    }
    res = client.put("/api/v1/me/profile", json=profile, headers=headers)
    assert res.status_code == 200
    assert res.json()["occupation"] == "Lead Designer"
