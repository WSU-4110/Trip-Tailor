import pytest

# combined fallback methods for more efficient testing, reducing redundant code
from place_classifier import _fallback_cost_from_category, _fallback_duration_from_category_or_type

# simple tests using preset fallback cost and duration values
def test_fallback_cost_known():
    assert _fallback_cost_from_category("park") == 0


def test_fallback_cost_unknown():
    assert _fallback_cost_from_category("unknown") == 2000


def test_fallback_duration_category():
    assert _fallback_duration_from_category_or_type("museum", None) == 120


def test_fallback_duration_type():
    assert _fallback_duration_from_category_or_type(None, "outdoor") == 90
