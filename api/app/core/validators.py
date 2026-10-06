"""Domain validators: Aadhaar (Verhoeff checksum), card numbers (Luhn), Indian PIN codes."""

import re

# Verhoeff tables (used by UIDAI for the Aadhaar check digit).
_D = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
]
_P = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
]


def verhoeff_valid(number: str) -> bool:
    check = 0
    for i, ch in enumerate(reversed(number)):
        check = _D[check][_P[i % 8][int(ch)]]
    return check == 0


def normalise_aadhaar(value: str) -> str:
    """Return the 12-digit Aadhaar number or raise ValueError."""
    digits = re.sub(r"[\s-]", "", value)
    if not re.fullmatch(r"[2-9]\d{11}", digits):
        raise ValueError("must be 12 digits and cannot start with 0 or 1")
    if not verhoeff_valid(digits):
        raise ValueError("is not a valid Aadhaar number (checksum failed)")
    return digits


def luhn_valid(number: str) -> bool:
    total = 0
    for i, ch in enumerate(reversed(number)):
        d = int(ch)
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        total += d
    return total % 10 == 0


def card_brand(number: str) -> str:
    if number.startswith("4"):
        return "Visa"
    if re.match(r"5[1-5]|2[2-7]", number):
        return "Mastercard"
    if re.match(r"3[47]", number):
        return "American Express"
    if re.match(r"60|65|81|82|508", number):
        return "RuPay"
    return "Card"
