import pytest
from place_classifier import classify_yelp_business


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
