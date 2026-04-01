import pytest
from place_classifier import _price_level_to_cost_cents

# simple cost mapping tests using preset const values
def test_price_to_cost():
    assert _price_level_to_cost_cents(2) == 3000


def test_price_to_cost_none():
    assert _price_level_to_cost_cents(None) is None
    