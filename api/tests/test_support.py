from sqlalchemy import select

from app.models import Feedback, Notification
from app.services.support import AGENTS


def test_tickets_are_created_assigned_and_listed(client, db, register):
    _, headers = register()
    short = client.post("/api/v1/me/tickets", json={"description": "bad"}, headers=headers)
    assert short.status_code == 422

    created = [
        client.post(
            "/api/v1/me/tickets", json={"description": f"Network issue number {i}"}, headers=headers
        ).json()
        for i in range(len(AGENTS) + 1)
    ]
    assert all(t["ticket_no"].startswith("TKT") for t in created)
    assert all(t["status"] == "open" for t in created)
    # Load-balanced: each agent gets one before anyone gets a second.
    assert sorted(t["assigned_to"] for t in created[: len(AGENTS)]) == sorted(AGENTS)

    mine = client.get("/api/v1/me/tickets", headers=headers).json()
    assert len(mine) == len(AGENTS) + 1
    mail = db.scalars(select(Notification).where(Notification.subject.like("Complaint%"))).all()
    assert len(mail) == len(AGENTS) + 1


def test_feedback_anonymous_and_signed_in(client, db, register):
    anon = client.post(
        "/api/v1/feedback",
        json={"name": "Visitor", "email": "v@example.com", "satisfaction": "good"},
    )
    assert anon.status_code == 201
    _, headers = register()
    signed = client.post(
        "/api/v1/feedback",
        json={
            "name": "Asha",
            "email": "asha@example.com",
            "satisfaction": "excellent",
            "comments": "  Fast!  ",
        },
        headers=headers,
    )
    assert signed.status_code == 201
    assert signed.json()["comments"] == "Fast!"
    rows = db.scalars(select(Feedback).order_by(Feedback.id)).all()
    assert rows[0].customer_id is None and rows[1].customer_id is not None
    bad = client.post(
        "/api/v1/feedback", json={"name": "X", "email": "x@example.com", "satisfaction": "meh"}
    )
    assert bad.status_code == 422


def test_my_notifications(client, register):
    _, headers = register()
    inbox = client.get("/api/v1/me/notifications", headers=headers).json()
    assert inbox[0]["subject"].startswith("Welcome to AirFone")
