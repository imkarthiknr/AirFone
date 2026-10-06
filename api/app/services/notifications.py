"""Outbox for e-mail and SMS.

Every message is stored in the `notifications` table, so it can be inspected in the admin
console. When SMTP is configured, e-mails are also delivered for real; SMS messages are only
recorded (plug a provider into `_deliver_sms` to send them). Credentials come from settings,
never from code.
"""

import logging
import smtplib
from email.message import EmailMessage

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import Customer, Notification

log = logging.getLogger("airfone.notifications")


def _deliver_email(to: str, subject: str, body: str) -> bool:
    settings = get_settings()
    if not settings.smtp_host:
        return False
    msg = EmailMessage()
    msg["From"] = settings.smtp_from
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
            smtp.starttls()
            if settings.smtp_username:
                smtp.login(settings.smtp_username, settings.smtp_password)
            smtp.send_message(msg)
        return True
    except (OSError, smtplib.SMTPException):
        log.exception("E-mail delivery to %s failed", to)
        return False


def _deliver_sms(to: str, body: str) -> bool:
    return False  # No SMS provider configured; message stays in the outbox.


def notify(
    db: Session,
    *,
    subject: str,
    body: str,
    customer: Customer | None = None,
    email: str | None = None,
    sms: bool = False,
) -> None:
    """Record (and, if configured, send) an e-mail and optionally an SMS. Commits."""
    to_email = email or (customer.email if customer else None)
    if to_email:
        delivered = _deliver_email(to_email, subject, body)
        db.add(
            Notification(
                customer_id=customer.id if customer else None,
                channel="email",
                recipient=to_email,
                subject=subject,
                body=body,
                delivered=delivered,
            )
        )
        log.info("email → %s | %s", to_email, subject)
    if sms and customer:
        delivered = _deliver_sms(customer.mobile_no, body)
        db.add(
            Notification(
                customer_id=customer.id,
                channel="sms",
                recipient=customer.mobile_no,
                subject=subject,
                body=body,
                delivered=delivered,
            )
        )
        log.info("sms → %s | %s", customer.mobile_no, subject)
    db.commit()
