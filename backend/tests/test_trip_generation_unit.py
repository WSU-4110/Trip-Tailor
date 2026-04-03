# was in trip-tailor/backend/tests/test_trip_generation_unit.py
from datetime import date

from app.services.place_classifier import _apply_fallbacks
from app.services.trip_generator import (
    _build_itinerary_structure,
    _dedupe_candidates,
    _matches_hard_filters,
    _score_candidate,
    _select_diverse_candidates_for_trip,
)


def test_matches_hard_filters_respects_selected_rules():
    payload = {
        "destination_city": "Detroit",
        "excluded_categories": ["museum"],
        "max_effort_level": 2,
        "has_kids": True,
        "family_friendly_required": True,
        "good_for_groups_required": True,
        "indoor_outdoor_preference": "indoor",
        "preferred_categories": ["bar", "nightlife"],
    }

    valid_bar = {
        "city": "Detroit",
        "category": "bar",
        "effort_level": 1,
        "good_for_kids": True,
        "family_friendly": True,
        "good_for_groups": True,
        "indoor_outdoor": "indoor",
        "place_name": "The Velvet Lounge",
        "title": "Craft Cocktails",
    }

    movie_like = {
        **valid_bar,
        "category": "movie_theater",
        "place_name": "Downtown Cinema Lounge",
        "title": "Late Night Movie",
    }

    wrong_city = {**valid_bar, "city": "Chicago"}

    assert _matches_hard_filters(valid_bar, payload) is True
    assert _matches_hard_filters(movie_like, payload) is False
    assert _matches_hard_filters(wrong_city, payload) is False


def test_score_candidate_prefers_well_matched_places_and_penalizes_movies():
    payload = {
        "preferred_categories": ["museum"],
        "has_kids": True,
        "group_size": 4,
        "indoor_outdoor_preference": "indoor",
        "max_effort_level": 3,
        "budget_level": "medium",
    }

    strong_match = {
        "category": "museum",
        "activity_type": "sightseeing",
        "tags": ["culture"],
        "place_name": "Detroit Institute of Arts",
        "title": "Detroit Institute of Arts",
        "quality_score": 4.5,
        "rating": 4.5,
        "review_count": 500,
        "good_for_kids": True,
        "family_friendly": True,
        "good_for_groups": True,
        "indoor_outdoor": "indoor",
        "effort_level": 2,
        "estimated_cost_cents": 3000,
        "duration_minutes": 120,
    }

    movie_place = {
        "category": "movie_theater",
        "activity_type": "entertainment",
        "tags": ["indoors"],
        "place_name": "Campus Cinema",
        "title": "Movie Night",
        "quality_score": 4.5,
        "rating": 4.5,
        "review_count": 500,
        "good_for_kids": True,
        "family_friendly": True,
        "good_for_groups": True,
        "indoor_outdoor": "indoor",
        "effort_level": 1,
        "estimated_cost_cents": 2500,
        "duration_minutes": 150,
    }

    strong_score = _score_candidate(strong_match, payload)
    movie_score = _score_candidate(movie_place, payload)

    assert strong_score > movie_score
    assert strong_score > 80
    assert movie_score < 20


def test_dedupe_candidates_removes_only_exact_place_activity_duplicates():
    candidates = [
        {"place_id": 1, "activity_id": 10, "title": "Original"},
        {"place_id": 1, "activity_id": 10, "title": "Duplicate copy"},
        {"place_id": 1, "activity_id": 11, "title": "Different activity"},
        {"place_id": 2, "activity_id": 10, "title": "Different place"},
    ]

    deduped = _dedupe_candidates(candidates)

    assert len(deduped) == 3
    assert deduped[0]["title"] == "Original"
    assert { (c["place_id"], c["activity_id"]) for c in deduped } == {(1, 10), (1, 11), (2, 10)}


def test_select_diverse_candidates_for_trip_spreads_categories_before_fallback():
    ranked_candidates = [
        {"place_id": 1, "activity_id": 101, "category": "museum", "recommendation_score": 99},
        {"place_id": 2, "activity_id": 102, "category": "museum", "recommendation_score": 97},
        {"place_id": 3, "activity_id": 103, "category": "park", "recommendation_score": 96},
        {"place_id": 4, "activity_id": 104, "category": "bar", "recommendation_score": 95},
        {"place_id": 5, "activity_id": 105, "category": "arcade", "recommendation_score": 94},
        {"place_id": 6, "activity_id": 106, "category": "museum", "recommendation_score": 93},
    ]

    selected = _select_diverse_candidates_for_trip(
        ranked_candidates=ranked_candidates,
        trip_days=2,
        activities_per_day=2,
    )

    selected_categories = [c["category"] for c in selected]

    assert len(selected) == 4
    assert selected_categories.count("museum") == 2
    assert selected_categories == ["museum", "park", "museum", "bar"]


def test_build_itinerary_structure_places_nightlife_after_daytime_when_preferred():
    ranked_candidates = [
        {
            "place_id": 10,
            "activity_id": 201,
            "category": "museum",
            "activity_type": "sightseeing",
            "place_name": "Science Museum",
            "title": "Science Museum",
            "recommendation_score": 97,
        },
        {
            "place_id": 11,
            "activity_id": 202,
            "category": "park",
            "activity_type": "outdoor",
            "place_name": "Riverwalk Park",
            "title": "Riverwalk Park",
            "recommendation_score": 94,
        },
        {
            "place_id": 12,
            "activity_id": 203,
            "category": "bar",
            "activity_type": "nightlife",
            "place_name": "Midnight Lounge",
            "title": "Midnight Lounge",
            "recommendation_score": 99,
        },
    ]

    itinerary = _build_itinerary_structure(
        ranked_candidates=ranked_candidates,
        start_date=date(2026, 4, 10),
        trip_days=1,
        activities_per_day=3,
        nightlife_preferred=True,
    )

    assert len(itinerary) == 3
    assert [item["item_order"] for item in itinerary] == [1, 2, 3]
    assert itinerary[0]["place_id"] == 10
    assert itinerary[1]["place_id"] == 11
    assert itinerary[2]["place_id"] == 12
    assert all(item["scheduled_date"] == date(2026, 4, 10) for item in itinerary)


def test_apply_fallbacks_populates_missing_duration_and_cost():
    result = {
        "category": "park",
        "activity_type": "outdoor",
        "duration_minutes": None,
        "estimated_cost_cents": None,
    }

    updated = _apply_fallbacks(result)

    assert updated["duration_minutes"] == 90
    assert updated["estimated_cost_cents"] == 0