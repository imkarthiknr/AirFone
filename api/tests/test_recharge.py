from datetime import date, timedelta

from sqlalchemy import select, text

from app.models import Bill, Notification, Payment
from tests.conftest import GOOD_CARD, plan_id

RECHARGE = "/api/v1/me/recharges"


def test_plans_catalogue(client):
    plans = client.get("/api/v1/plans").json()
    assert {p["category"] for p in plans} == {"prepaid", "postpaid", "broadband"}
    broadband = client.get("/api/v1/plans", params={"category": "broadband"}).json()
    assert all(p["speed"] for p in broadband)
    assert [p["price"] for p in broadband] == sorted(p["price"] for p in broadband)
    assert client.get("/api/v1/plans/9999").status_code == 404


def test_successful_recharge(client, db, register):
    customer, headers = register()
    pid = plan_id(client, "prepaid", 298)
    res = client.post(RECHARGE, json={"plan_id": pid, "card": GOOD_CARD}, headers=headers)
    assert res.status_code == 201, res.text
    bill = res.json()
    assert bill["amount"] == 298
    assert bill["start_date"] == date.today().isoformat()
    assert bill["end_date"] == (date.today() + timedelta(days=28)).isoformat()
    assert bill["payment"]["card_brand"] == "Visa"
    assert bill["payment"]["card_last4"] == "4242"
    assert "2GB/day" in bill["benefits"]

    # The full card number and CVV are never persisted anywhere.
    payment = db.scalar(select(Payment))
    assert payment.card_last4 == "4242"
    for table in ("payments", "bills", "notifications"):
        dump = " ".join(str(r) for r in db.execute(text(f"SELECT * FROM {table}")).all())
        assert "4242424242424242" not in dump
        assert "123" not in dump.split("4242")[0][-5:]  # crude CVV guard on the card row

    channels = sorted(
        n.channel for n in db.scalars(select(Notification)).all() if "Recharge" in n.subject
    )
    assert channels == ["email", "sms"]

    summary = client.get("/api/v1/me", headers=headers).json()
    assert summary["active_bill"]["invoice_no"] == bill["invoice_no"]
    assert summary["days_left"] == 28
    assert summary["total_spent"] == 298
    assert summary["recharge_count"] == 1
    assert client.get("/api/v1/me/bills", headers=headers).json()[0]["id"] == bill["id"]
    assert customer["connection_type"] == "prepaid"


def test_plan_must_match_connection_type(client, register):
    _, headers = register()
    pid = plan_id(client, "broadband", 1999)
    res = client.post(RECHARGE, json={"plan_id": pid, "card": GOOD_CARD}, headers=headers)
    assert res.status_code == 409
    assert "prepaid" in res.json()["detail"]


def test_card_validation_errors(client, db, register):
    _, headers = register()
    pid = plan_id(client, "prepaid", 149)
    cases = [
        ({"number": "4242 4242 4242 4241"}, 402, "number"),
        ({"exp_year": date.today().year - 1}, 402, "exp_year"),
        ({"number": "378282246310005", "cvv": "123"}, 402, "cvv"),  # Amex needs 4
        ({"cvv": "12"}, 422, None),
        ({"number": "1234"}, 422, None),
    ]
    for override, status, field in cases:
        res = client.post(
            RECHARGE, json={"plan_id": pid, "card": GOOD_CARD | override}, headers=headers
        )
        assert res.status_code == status, (override, res.text)
        if field:
            assert field in res.json()["fields"]
    assert db.scalar(select(Bill)) is None


def test_declined_card_creates_no_bill_or_payment(client, db, register):
    _, headers = register()
    pid = plan_id(client, "prepaid", 149)
    card = GOOD_CARD | {"number": "4000 0000 0000 0002"}
    res = client.post(RECHARGE, json={"plan_id": pid, "card": card}, headers=headers)
    assert res.status_code == 402
    assert "declined" in res.json()["detail"]
    assert db.scalar(select(Bill)) is None
    assert db.scalar(select(Payment)) is None


def test_bills_are_private(client, register):
    _, alice = register()
    _, bob = register(email="bob@example.com", aadhaar="987654321096", connection_type="postpaid")
    pid = plan_id(client, "prepaid", 149)
    bill = client.post(RECHARGE, json={"plan_id": pid, "card": GOOD_CARD}, headers=alice).json()
    assert client.get(f"/api/v1/me/bills/{bill['id']}", headers=alice).status_code == 200
    assert client.get(f"/api/v1/me/bills/{bill['id']}", headers=bob).status_code == 404
    assert client.get("/api/v1/me/bills", headers=bob).json() == []


def test_unknown_plan(client, register):
    _, headers = register()
    res = client.post(RECHARGE, json={"plan_id": 999, "card": GOOD_CARD}, headers=headers)
    assert res.status_code == 404
