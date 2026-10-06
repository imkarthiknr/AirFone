import pytest

from app.core.validators import card_brand, luhn_valid, normalise_aadhaar, verhoeff_valid


def test_verhoeff():
    assert verhoeff_valid("234567890124")
    assert not verhoeff_valid("234567890125")


@pytest.mark.parametrize("value", ["2345 6789 0124", "2345-6789-0124", "234567890124"])
def test_aadhaar_accepts_common_formats(value):
    assert normalise_aadhaar(value) == "234567890124"


@pytest.mark.parametrize("value", ["134567890124", "23456789012", "234567890125", "abcd efgh ijkl"])
def test_aadhaar_rejects_invalid(value):
    with pytest.raises(ValueError):
        normalise_aadhaar(value)


def test_luhn_and_brand():
    assert luhn_valid("4242424242424242")
    assert not luhn_valid("4242424242424241")
    assert card_brand("4242424242424242") == "Visa"
    assert card_brand("5555555555554444") == "Mastercard"
    assert card_brand("378282246310005") == "American Express"
    assert card_brand("6522000000000000") == "RuPay"
