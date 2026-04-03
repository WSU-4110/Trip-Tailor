# was in /trip-tailor/backend/test_trip_generator_nathaniel.py
import pytest
from datetime import date

from app.services.trip_generator import (
    _make_json_safe,
    _calculate_trip_days,
    _normalize_preferred_categories,
    _normalize_excluded_categories,
    _is_movie_like,
    _get_category_cap,
)

def test_make_json_safe_converts_dates():
    data = {
        "start": date(2025, 3, 10),
        "nested": {"end": date(2025, 3, 15)},
        "list": [date(2025, 3, 20)]
    }

    result = _make_json_safe(data)

    assert result["start"] == "2025-03-10"
    assert result["nested"]["end"] == "2025-03-15"
    assert result["list"][0] == "2025-03-20"


def test_calculate_trip_days():
    start = date(2025, 3, 10)
    end = date(2025, 3, 15)

    result = _calculate_trip_days(start, end)

    assert result == 6


def test_normalize_preferred_categories():
    payload = {
        "preferred_categories": ["  Bar ", "Museum", "", None]
    }

    result = _normalize_preferred_categories(payload)

    assert result == ["bar", "museum", "none"]


def test_normalize_excluded_categories():
    payload = {
        "excluded_categories": ["  Cafe ", "Park", "   "]
    }

    result = _normalize_excluded_categories(payload)

    assert result == ["cafe", "park"]


def test_is_movie_like():
    candidate1 = {"category": "movie_theater"}
    candidate2 = {"place_name": "AMC Cinema"}
    candidate3 = {"title": "Downtown Movie Experience"}
    candidate4 = {"place_name": "Regular Park"}

    assert _is_movie_like(candidate1) is True
    assert _is_movie_like(candidate2) is True
    assert _is_movie_like(candidate3) is True
    assert _is_movie_like(candidate4) is False


def test_get_category_cap():
    assert _get_category_cap("movie_theater") == 1
    assert _get_category_cap("bar") == 2
    assert _get_category_cap("restaurant") == 1
    assert _get_category_cap("random") == 2