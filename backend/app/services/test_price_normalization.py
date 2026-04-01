import pytest
from place_classifier import _normalize_google_price_level, _normalize_yelp_price_level

# combination of google and yelp price normalization methods
def test_google_price_valid():
    assert _normalize_google_price_level({"price_level": 3}) == 3


def test_google_price_invalid():
    assert _normalize_google_price_level({"price_level": 10}) is None


def test_yelp_price_valid():
    assert _normalize_yelp_price_level({"price": "$$$"}) == 3


def test_yelp_price_invalid():
    assert _normalize_yelp_price_level({"price": ""}) is None