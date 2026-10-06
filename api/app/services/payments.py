"""A mock card payment gateway.

It validates like a real one (Luhn, expiry, CVV length) but never stores the card number or
CVV. Only the brand and last four digits are kept. Test cards:

    4242 4242 4242 4242  → approved (any future expiry, any CVV)
    4000 0000 0000 0002  → declined
"""

import secrets
from datetime import date

from sqlalchemy.orm import Session

from app.core.validators import card_brand, luhn_valid
from app.models import Customer, Payment
from app.schemas import CardDetails

DECLINED_TEST_CARD = "4000000000000002"


class PaymentError(Exception):
    def __init__(self, message: str, *, field: str | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.field = field


def charge(db: Session, customer: Customer, amount: int, card: CardDetails) -> Payment:
    """Validate and 'charge' the card. Adds the Payment to the session (caller commits)."""
    if not luhn_valid(card.number):
        raise PaymentError("Card number is not valid.", field="number")
    today = date.today()
    if (card.exp_year, card.exp_month) < (today.year, today.month):
        raise PaymentError("This card has expired.", field="exp_year")
    brand = card_brand(card.number)
    expected_cvv = 4 if brand == "American Express" else 3
    if len(card.cvv) != expected_cvv:
        raise PaymentError(f"CVV must be {expected_cvv} digits for {brand}.", field="cvv")
    if card.number == DECLINED_TEST_CARD:
        raise PaymentError("Payment declined by the bank. Try another card.")

    payment = Payment(
        reference="PAY" + secrets.token_hex(6).upper(),
        customer_id=customer.id,
        amount=amount,
        card_brand=brand,
        card_last4=card.number[-4:],
        cardholder_name=card.cardholder_name.strip(),
    )
    db.add(payment)
    return payment
