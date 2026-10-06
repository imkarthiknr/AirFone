"""Support tickets and feedback."""

import secrets
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Customer, Feedback, Ticket, TicketStatus
from app.schemas import FeedbackCreate
from app.services.notifications import notify

# Support agents tickets are assigned to (the original picked one at random; we balance load).
AGENTS = ["Asha", "Ravi", "Meera", "Arjun", "Divya"]


def _next_agent(db: Session) -> str:
    counts = dict(
        db.execute(
            select(Ticket.assigned_to, func.count(Ticket.id))
            .where(Ticket.status == TicketStatus.OPEN)
            .group_by(Ticket.assigned_to)
        ).all()
    )
    return min(AGENTS, key=lambda a: (counts.get(a, 0), AGENTS.index(a)))


def _ticket_no(db: Session) -> str:
    while True:
        candidate = "TKT" + "".join(secrets.choice("0123456789") for _ in range(6))
        if not db.scalar(select(Ticket.id).where(Ticket.ticket_no == candidate)):
            return candidate


def create_ticket(db: Session, customer: Customer, description: str) -> Ticket:
    ticket = Ticket(
        ticket_no=_ticket_no(db),
        customer_id=customer.id,
        description=description.strip(),
        assigned_to=_next_agent(db),
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    notify(
        db,
        customer=customer,
        subject=f"Complaint registered: ticket {ticket.ticket_no}",
        body=(
            f"Hi {customer.name},\n\nSorry for the inconvenience. Your complaint from "
            f"{customer.mobile_no} is registered as ticket {ticket.ticket_no} and assigned to "
            f"{ticket.assigned_to}. We'll get back to you soon.\n\nTeam AirFone"
        ),
    )
    return ticket


def tickets_for(db: Session, customer: Customer) -> list[Ticket]:
    stmt = select(Ticket).where(Ticket.customer_id == customer.id).order_by(Ticket.id.desc())
    return list(db.scalars(stmt).all())


def respond(db: Session, ticket: Ticket, message: str, admin_name: str) -> Ticket:
    ticket.response = message.strip()
    ticket.status = TicketStatus.RESOLVED
    ticket.responded_at = datetime.now(UTC)
    db.commit()
    db.refresh(ticket)
    notify(
        db,
        customer=ticket.customer,
        subject=f"Response to your complaint {ticket.ticket_no}",
        body=(
            f"Hi {ticket.customer.name},\n\nRegarding your complaint:\n“{ticket.description}”\n\n"
            f"{ticket.response}\n\nRegards,\n{admin_name}, AirFone Support"
        ),
    )
    return ticket


def create_feedback(db: Session, data: FeedbackCreate, customer: Customer | None) -> Feedback:
    feedback = Feedback(
        customer_id=customer.id if customer else None,
        name=data.name.strip(),
        email=data.email.lower(),
        satisfaction=data.satisfaction,
        comments=(data.comments or "").strip() or None,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback
