"""Seed data: `python -m app.seed [--demo]`. Idempotent.

* Plans: the original AirFone 2020 catalogue (prepaid, postpaid, broadband).
* Admin: created from ADMIN_USERNAME / ADMIN_PASSWORD if no admin exists yet.
* --demo (or SEED_DEMO_DATA=true): fictional customers, bills, tickets and feedback.
  All demo people are made up; no real personal data is used.
"""

import os
import sys
from datetime import date, timedelta

from sqlalchemy import func, select

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models import (
    Admin,
    Bill,
    Customer,
    Feedback,
    Plan,
    PlanCategory,
    Satisfaction,
    Ticket,
    TicketStatus,
)
from app.services.billing import describe_benefits

P, Q, B = PlanCategory.PREPAID, PlanCategory.POSTPAID, PlanCategory.BROADBAND

# (category, name, price, validity_days, data, calls, sms, speed, post_fup, popular)
PLANS = [
    (P, "Starter", 19, 2, "200MB", "Unlimited", None, None, None, False),
    (P, "Smart 99", 99, 18, "1GB/day", "Unlimited", "100/day", None, None, False),
    (P, "Smart 129", 129, 24, "1GB/day", "Unlimited", "300 total", None, None, False),
    (P, "Smart 149", 149, 28, "2GB/day", "Unlimited", "300 total", None, None, False),
    (P, "Smart 169", 169, 28, "2.5GB/day", "Unlimited", "500 total", None, None, False),
    (P, "Value 199", 199, 24, "1GB/day", "Unlimited", "100/day", None, None, False),
    (P, "Value 249", 249, 28, "1GB/day", "Unlimited", "100/day", None, None, False),
    (P, "Value 279", 279, 28, "1.5GB/day", "Unlimited", "100/day", None, None, False),
    (P, "Value 298", 298, 28, "2GB/day", "Unlimited", "100/day", None, None, True),
    (P, "Max 349", 349, 28, "2GB/day", "Unlimited", "100/day", None, None, False),
    (P, "Quarterly 379", 379, 84, "6GB total", "Unlimited", "900 total", None, None, False),
    (P, "Max 398", 398, 28, "3GB/day", "Unlimited", "100/day", None, None, False),
    (P, "Long 399", 399, 56, "1.5GB/day", "Unlimited", "100/day", None, None, True),
    (P, "Long 449", 449, 56, "2GB/day", "Unlimited", "100/day", None, None, False),
    (P, "Long 558", 558, 56, "3GB/day", "Unlimited", "100/day", None, None, False),
    (Q, "Postpaid 210", 210, 30, "50GB", "100 min", "Unlimited", None, None, False),
    (Q, "Postpaid 300", 300, 30, "75GB", "100 min", "Unlimited", None, None, False),
    (Q, "Postpaid 400", 400, 30, "120GB", "1000 min", "Unlimited", None, None, True),
    (Q, "Annual 749", 749, 365, "125GB", "Unlimited", "Unlimited", None, None, False),
    (Q, "Annual 999", 999, 365, "150GB", "Unlimited", "Unlimited", None, None, True),
    (Q, "Annual 1099", 1099, 365, "200GB", "Unlimited", "Unlimited", None, None, False),
    (B, "Fiber Basic", 777, 30, "500GB/month", None, None, "150 Mbps", "1 Mbps", False),
    (B, "Fiber Plus", 1055, 30, "1000GB/month", None, None, "350 Mbps", "2 Mbps", False),
    (B, "Fiber 150", 1075, 30, "1000GB/month", None, None, "150 Mbps", "1 Mbps", False),
    (B, "Fiber 350", 1999, 30, "2000GB/month", None, None, "350 Mbps", "2 Mbps", True),
    (B, "Fiber Giga", 2999, 30, "3000GB/month", None, None, "1 Gbps", "2 Mbps", False),
    (B, "Fiber Ultra", 3999, 30, "5000GB/month", None, None, "2 Gbps", "2 Mbps", False),
]

DEMO_PASSWORD = "airfone123"
# Fictional customers: (mobile, name, email, type, city, occupation)
DEMO_CUSTOMERS = [
    ("9000000001", "Asha Verma", "asha@example.com", P, "Chennai", "Product Designer"),
    ("9000000002", "Rohan Mehta", "rohan@example.com", Q, "Bengaluru", "Data Analyst"),
    ("9000000003", "Leela Nair", "leela@example.com", B, "Kochi", "Architect"),
    ("9000000004", "Imran Shaikh", "imran@example.com", P, "Pune", "Teacher"),
    ("9000000005", "Kavya Iyer", "kavya@example.com", Q, "Hyderabad", "Doctor"),
]


def seed_plans(db) -> int:
    if db.scalar(select(func.count(Plan.id))):
        return 0
    for cat, name, price, days, data, calls, sms, speed, fup, popular in PLANS:
        db.add(
            Plan(
                category=cat,
                name=name,
                price=price,
                validity_days=days,
                data=data,
                calls=calls,
                sms=sms,
                speed=speed,
                post_fup_speed=fup,
                is_popular=popular,
            )
        )
    db.commit()
    return len(PLANS)


def seed_admin(db) -> str | None:
    if db.scalar(select(func.count(Admin.id))):
        return None
    username = os.environ.get("ADMIN_USERNAME", "admin")
    password = os.environ.get("ADMIN_PASSWORD", "admin12345")
    db.add(Admin(username=username, password_hash=hash_password(password)))
    db.commit()
    return username


def seed_demo(db) -> int:
    if db.scalar(select(func.count(Customer.id))):
        return 0
    plans = {(p.category, p.price): p for p in db.scalars(select(Plan)).all()}
    today = date.today()
    pw = hash_password(DEMO_PASSWORD)
    for i, (mobile, name, email, cat, city, job) in enumerate(DEMO_CUSTOMERS):
        c = Customer(
            mobile_no=mobile,
            name=name,
            dob=date(1990 + i, 1 + i, 10 + i),
            email=email,
            password_hash=pw,
            occupation=job,
            aadhaar_last4=f"{1000 + i * 1111}"[-4:],
            house_no=f"{12 + i}",
            street="MG Road",
            city=city,
            state="Tamil Nadu" if city == "Chennai" else "Karnataka",
            pincode=f"6000{10 + i}",
            connection_type=cat,
        )
        db.add(c)
        db.flush()
        price = {P: [298, 149], Q: [400], B: [1999]}[cat]
        for j, amount in enumerate(price):
            plan = plans[(cat, amount)]
            start = today - timedelta(days=5 + j * 40)
            db.add(
                Bill(
                    invoice_no=f"INV{start:%y%m}{c.id:03d}{j}",
                    customer_id=c.id,
                    plan_id=plan.id,
                    category=cat,
                    plan_name=plan.name,
                    benefits=describe_benefits(plan),
                    amount=plan.price,
                    start_date=start,
                    end_date=start + timedelta(days=plan.validity_days),
                )
            )
    db.flush()
    customers = db.scalars(select(Customer).order_by(Customer.id)).all()
    db.add_all(
        [
            Ticket(
                ticket_no="TKT100201",
                customer_id=customers[0].id,
                assigned_to="Asha",
                description="Mobile data stops working every evening around 8 pm.",
            ),
            Ticket(
                ticket_no="TKT100202",
                customer_id=customers[2].id,
                assigned_to="Ravi",
                description="Fiber speed is far below 350 Mbps since the last outage.",
            ),
            Ticket(
                ticket_no="TKT100203",
                customer_id=customers[1].id,
                assigned_to="Meera",
                status=TicketStatus.RESOLVED,
                description="I was charged twice for my last postpaid bill.",
                response="We've refunded the duplicate charge; it reaches you in 3-5 days.",
            ),
            Feedback(
                customer_id=customers[0].id,
                name="Asha Verma",
                email="asha@example.com",
                satisfaction=Satisfaction.EXCELLENT,
                comments="Recharge took seconds!",
            ),
            Feedback(
                name="Visitor",
                email="visitor@example.com",
                satisfaction=Satisfaction.GOOD,
                comments="Clear plan comparison.",
            ),
            Feedback(
                customer_id=customers[3].id,
                name="Imran Shaikh",
                email="imran@example.com",
                satisfaction=Satisfaction.AVERAGE,
                comments="Network drops in my area.",
            ),
        ]
    )
    db.commit()
    return len(DEMO_CUSTOMERS)


def main(argv: list[str]) -> None:
    demo = "--demo" in argv or get_settings().seed_demo_data
    with SessionLocal() as db:
        print(f"plans added: {seed_plans(db)}")
        admin = seed_admin(db)
        if admin:
            print(f"admin created: {admin} (password from ADMIN_PASSWORD, default admin12345)")
        if demo:
            n = seed_demo(db)
            print(
                f"demo customers added: {n} (password {DEMO_PASSWORD})"
                if n
                else "demo data present"
            )


if __name__ == "__main__":
    main(sys.argv[1:])
