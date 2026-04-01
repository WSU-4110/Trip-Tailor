import pytest
from place_classifier import _normalize_category, _derive_activity_type_from_category


def test_category_alias():
    assert _normalize_category("cinema") == "movie_theater"


def test_category_default():
    assert _normalize_category(None) == "general"


def test_activity_type_derivation():
    assert _derive_activity_type_from_category("museum") == "sightseeing"
