from datetime import date, timedelta

from sqlalchemy import select

from app.models import Bill, Customer, Notification
from tests.conftest import GOOD_CARD, PASSWORD, plan_id

A = "/api/v1/admin"


def test_admin_login_failures(client, admin_headers):
    bad = client.post("/api/v1/auth/admin/login", json={"username": "admin", "password": "nope"})
    assert bad.status_code == 401
    assert client.get(f"{A}/stats").status_code == 401
    assert client.get(f"{A}/me", headers=admin_headers).json()["username"] == "admin"


def test_customer_search_filter_update_and_delete(client, db, register, admin_headers):
    asha, _ = register()
    rohan, _ = register(
        name="Rohan Mehta",
        email="rohan@example.com",
        aadhaar="987654321096",
        connection_type="postpaid",
    )
    listing = client.get(f"{A}/customers", headers=admin_headers).json()
    assert listing["total"] == 2
    assert (
        client.get(f"{A}/customers", params={"q": "rohan"}, headers=admin_headers).json()["total"]
        == 1
    )
    assert (
        client.get(f"{A}/customers", params={"q": asha["mobile_no"]}, headers=admin_headers).json()[
            "items"
        ][0]["name"]
        == "Asha Verma"
    )
    by_type = client.get(
        f"{A}/customers", params={"connection_type": "postpaid"}, headers=admin_headers
    ).json()
    assert [c["name"] for c in by_type["items"]] == ["Rohan Mehta"]

    upd = client.put(
        f"{A}/customers/{asha['id']}",
        json={"name": "Asha V", "connection_type": "broadband", "is_active": False},
        headers=admin_headers,
    )
    assert upd.status_code == 200 and upd.json()["connection_type"] == "broadband"
    # Deactivated customers can't log in.
    login = client.post(
        "/api/v1/auth/login", json={"mobile_no": asha["mobile_no"], "password": PASSWORD}
    )
    assert login.status_code == 401

    assert client.delete(f"{A}/customers/{rohan['id']}", headers=admin_headers).status_code == 204
    assert client.get(f"{A}/customers/{rohan['id']}", headers=admin_headers).status_code == 404
    assert db.scalar(select(Customer).where(Customer.id == rohan["id"])) is None


def test_admin_sends_password_reset_link(client, db, register, admin_headers):
    asha, _ = register()
    res = client.post(f"{A}/customers/{asha['id']}/password-reset", headers=admin_headers)
    assert res.status_code == 202
    last = db.scalars(select(Notification).order_by(Notification.id.desc())).first()
    assert "reset-password?token=" in last.body


def test_ticket_response_resolves_and_notifies(client, db, register, admin_headers):
    _, headers = register()
    ticket = client.post(
        "/api/v1/me/tickets",
        json={"description": "No signal at home since Monday"},
        headers=headers,
    ).json()
    open_list = client.get(f"{A}/tickets", params={"status": "open"}, headers=admin_headers).json()
    assert open_list["items"][0]["customer_email"] == "asha@example.com"

    res = client.post(
        f"{A}/tickets/{ticket['id']}/respond",
        json={"message": "A technician has fixed the tower near you."},
        headers=admin_headers,
    )
    assert res.status_code == 200 and res.json()["status"] == "resolved"
    mine = client.get("/api/v1/me/tickets", headers=headers).json()[0]
    assert mine["response"] == "A technician has fixed the tower near you."
    assert (
        client.get(f"{A}/tickets", params={"status": "open"}, headers=admin_headers).json()["total"]
        == 0
    )
    last = db.scalars(select(Notification).order_by(Notification.id.desc())).first()
    assert ticket["ticket_no"] in last.subject and "admin" in last.body
    assert client.get(f"{A}/tickets/999", headers=admin_headers).status_code == 404


def test_billing_report_and_csv(client, db, register, admin_headers):
    _, headers = register()
    for price in (149, 298):
        client.post(
            "/api/v1/me/recharges",
            json={"plan_id": plan_id(client, "prepaid", price), "card": GOOD_CARD},
            headers=headers,
        )
    old = db.scalars(select(Bill)).first()
    old.start_date = date.today() - timedelta(days=60)
    db.commit()

    today = date.today().isoformat()
    report = client.get(
        f"{A}/billing-report", params={"start": today, "end": today}, headers=admin_headers
    ).json()
    assert report["count"] == 1 and report["total_amount"] == 298
    wide = client.get(
        f"{A}/billing-report",
        params={"start": "2000-01-01", "end": today, "category": "prepaid"},
        headers=admin_headers,
    ).json()
    assert wide["count"] == 2 and wide["total_amount"] == 447
    none = client.get(
        f"{A}/billing-report",
        params={"start": "2000-01-01", "end": today, "category": "broadband"},
        headers=admin_headers,
    ).json()
    assert none["count"] == 0

    csv = client.get(
        f"{A}/billing-report.csv",
        params={"start": "2000-01-01", "end": today},
        headers=admin_headers,
    )
    assert csv.headers["content-type"].startswith("text/csv")
    assert csv.text.splitlines()[0].startswith("Invoice,Mobile")
    assert len(csv.text.strip().splitlines()) == 3

    backwards = client.get(
        f"{A}/billing-report", params={"start": today, "end": "2000-01-01"}, headers=admin_headers
    )
    assert backwards.status_code == 422


def test_stats_feedback_and_outbox(client, register, admin_headers):
    _, headers = register()
    client.post(
        "/api/v1/me/recharges",
        json={"plan_id": plan_id(client, "prepaid", 149), "card": GOOD_CARD},
        headers=headers,
    )
    client.post(
        "/api/v1/me/tickets", json={"description": "Calls drop frequently"}, headers=headers
    )
    client.post(
        "/api/v1/feedback",
        json={"name": "Al", "email": "a@example.com", "satisfaction": "bad"},
    )
    stats = client.get(f"{A}/stats", headers=admin_headers).json()
    assert stats["customers_by_type"] == {"prepaid": 1, "postpaid": 0, "broadband": 0}
    assert stats["open_tickets"] == 1
    assert stats["revenue_this_month"] == 149
    assert stats["feedback_breakdown"] == {"bad": 1}
    assert client.get(f"{A}/feedback", headers=admin_headers).json()["total"] == 1
    outbox = client.get(f"{A}/notifications", headers=admin_headers).json()
    assert outbox["total"] >= 4  # welcome, recharge email + sms, ticket


def test_admin_profile_update(client, db, admin_headers):
    from app.services.admin import create_admin

    create_admin(db, "other", "other-pass1")
    wrong = client.put(
        f"{A}/me", json={"username": "admin", "current_password": "x"}, headers=admin_headers
    )
    assert wrong.status_code == 400
    taken = client.put(
        f"{A}/me",
        json={"username": "other", "current_password": "admin-pass1"},
        headers=admin_headers,
    )
    assert taken.status_code == 409
    ok = client.put(
        f"{A}/me",
        json={
            "username": "chief",
            "current_password": "admin-pass1",
            "new_password": "chief-pass1",
        },
        headers=admin_headers,
    )
    assert ok.status_code == 200 and ok.json()["username"] == "chief"
    login = client.post(
        "/api/v1/auth/admin/login", json={"username": "chief", "password": "chief-pass1"}
    )
    assert login.status_code == 200
