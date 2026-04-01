import pytest
from place_classifier import classify_google_place

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
    # price_level should be none, since the category "Test Place" does not exist as a preset dictionary
    assert result["price_level"] == None