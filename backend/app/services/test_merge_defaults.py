import pytest
from place_classifier import _merge_defaults, DEFAULT_ACTIVITY_FIELDS


def test_merge_defaults():
    base = {"title": "Test", "category": "park"}
    result = _merge_defaults(base)
    assert result["title"] == "Test"
    assert result["category"] == "park"


def test_merge_defaults_keeps_defaults():
    base = {}
    result = _merge_defaults(base)
    assert result["activity_type"] == DEFAULT_ACTIVITY_FIELDS["activity_type"]
