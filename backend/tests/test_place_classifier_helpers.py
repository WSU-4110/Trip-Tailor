# test folder path: Trip-Tailor/backend/tests
# path of haydens test files: Trip-Tailor/backend/app/services

import pytest
from app.services.place_classifier import (
    DEFAULT_ACTIVITY_FIELDS,
    _build_quality_score,
    _derive_activity_type_from_category,
    _fallback_cost_from_category,
    _fallback_duration_from_category_or_type,
    _merge_defaults,
    _normalize_category,
    _normalize_google_price_level,
    _normalize_yelp_price_level,
    _price_level_to_cost_cents,
    classify_google_place,
    classify_yelp_business,
)


# _price_level_to_cost_cents

def test_price_to_cost():
    assert _price_level_to_cost_cents(2) == 3000


def test_price_to_cost_none():
    assert _price_level_to_cost_cents(None) is None



# _fallback_cost_from_category / _fallback_duration_from_category_or_type

def test_fallback_cost_known():
    assert _fallback_cost_from_category("park") == 0


def test_fallback_cost_unknown():
    assert _fallback_cost_from_category("unknown") == 2000


def test_fallback_duration_category():
    assert _fallback_duration_from_category_or_type("museum", None) == 120


def test_fallback_duration_type():
    assert _fallback_duration_from_category_or_type(None, "outdoor") == 90


# classify_google_place

def test_google_classification():
    raw = {
        "name": "Test Place",
        "types": [],
        "rating": 4.5,
        "user_ratings_total": 10,
    }
    result = classify_google_place(raw)
    assert result["title"] == "Test Place"
    assert result["source"] == "google"
    assert result["rating"] == 4.5
    assert result["review_count"] == 10
    assert result["price_level"] is None



# _merge_defaults

def test_merge_defaults():
    base = {"title": "Test", "category": "park"}
    result = _merge_defaults(base)
    assert result["title"] == "Test"
    assert result["category"] == "park"


def test_merge_defaults_keeps_defaults():
    base = {}
    result = _merge_defaults(base)
    assert result["activity_type"] == DEFAULT_ACTIVITY_FIELDS["activity_type"]


# _normalize_category / _derive_activity_type_from_category

def test_category_alias():
    assert _normalize_category("cinema") == "movie_theater"


def test_category_default():
    assert _normalize_category(None) == "general"


def test_activity_type_derivation():
    assert _derive_activity_type_from_category("museum") == "sightseeing"


# _normalize_google_price_level / _normalize_yelp_price_level

def test_google_price_valid():
    assert _normalize_google_price_level({"price_level": 3}) == 3


def test_google_price_invalid():
    assert _normalize_google_price_level({"price_level": 10}) is None


def test_yelp_price_valid():
    assert _normalize_yelp_price_level({"price": "$$$"}) == 3


def test_yelp_price_invalid():
    assert _normalize_yelp_price_level({"price": ""}) is None

# _build_quality_score

def test_quality_score():
    assert _build_quality_score(4.0, 50) is not None


def test_quality_score_none():
    assert _build_quality_score(None, 100) is None

# classify_yelp_business

def test_yelp_classification():
    raw = {
        "name": "Test Buisness",
        "categories": [{"alias": "parks"}],
        "rating": 4.0,
        "review_count": 20,
        "is_closed": False,
    }
    result = classify_yelp_business(raw)
    assert result["title"] == "Test Buisness"
    assert result["source"] == "yelp"