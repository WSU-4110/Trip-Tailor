# This file contains the core itinerary generation/recommendation engine
from __future__ import annotations

from collections import Counter
from datetime import date, timedelta
from typing import Any

from app.repositories.recommendations_repo import get_candidate_activities_for_city
from app.repositories.trips_repo import create_trip, get_full_trip, update_trip_status
from app.repositories.trip_preferences_repo import upsert_trip_preferences
from app.repositories.trip_itinerary_repo import insert_trip_itinerary_item, delete_trip_itinerary_items


# Converts the payload to a JSON-safe version before saving it so start and end_date objects can be saved in the JSON format
def _make_json_safe(value: Any) -> Any:
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: _make_json_safe(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_make_json_safe(v) for v in value]
    return value

# Calculates the trip length in days to limit data returned
def _calculate_trip_days(start_date: date, end_date: date) -> int:
    return (end_date - start_date).days + 1

# Gets the prefered categories from the questionnaire
def _normalize_preferred_categories(payload: dict[str, Any]) -> list[str]:
    categories = payload.get("preferred_categories") or []
    return [str(c).strip().lower() for c in categories if str(c).strip()]


# Gets which categories should be excluded from a query (like bars if you have children...)
def _normalize_excluded_categories(payload: dict[str, Any]) -> list[str]:
    categories = payload.get("excluded_categories") or []
    return [str(c).strip().lower() for c in categories if str(c).strip()]

def _is_movie_like(candidate: dict[str, Any]) -> bool:
    category = (candidate.get("category") or "").lower()
    place_name = (candidate.get("place_name") or "").lower()
    title = (candidate.get("title") or "").lower()

    if category == "movie_theater":
        return True

    movie_words = ["cinema", "movie", "theatre", "theater"]
    return any(word in place_name or word in title for word in movie_words)


# Tracks "hard" filters for categories/attributes that must be met for accurate results
def _matches_hard_filters(candidate: dict[str, Any], payload: dict[str, Any]) -> bool:
    excluded_categories = _normalize_excluded_categories(payload)
    preferred_city = str(payload["destination_city"]).strip().lower()

    if str(candidate.get("city", "")).strip().lower() != preferred_city:
        return False

    category = (candidate.get("category") or "").lower()
    if category in excluded_categories:
        return False

    max_effort_level = payload.get("max_effort_level")
    effort_level = candidate.get("effort_level")
    if max_effort_level is not None and effort_level is not None and effort_level > max_effort_level:
        return False

    has_kids = payload.get("has_kids")
    if has_kids is True and candidate.get("good_for_kids") is False:
        return False

    family_friendly_required = payload.get("family_friendly_required")
    if family_friendly_required is True and candidate.get("family_friendly") is False:
        return False

    good_for_groups_required = payload.get("good_for_groups_required")
    if good_for_groups_required is True and candidate.get("good_for_groups") is False:
        return False

    indoor_outdoor_preference = payload.get("indoor_outdoor_preference")
    indoor_outdoor = candidate.get("indoor_outdoor")
    if indoor_outdoor_preference in {"indoor", "outdoor"}:
        if indoor_outdoor is not None and indoor_outdoor != indoor_outdoor_preference:
            return False
    
    preferred_categories = _normalize_preferred_categories(payload)

    # If this is primarily a nightlife/bar trip, do not allow movie-style places
    if any(cat in preferred_categories for cat in {"bar", "nightlife"}):
        if _is_movie_like(candidate):
            return False

    return True


# Calculates accuracy score for each place in the candidates list given the questionnaire info
def _score_candidate(candidate: dict[str, Any], payload: dict[str, Any]) -> float:
    score = 0.0

    preferred_categories = _normalize_preferred_categories(payload)
    category = (candidate.get("category") or "").lower()
    activity_type = (candidate.get("activity_type") or "").lower()
    tags = [str(t).lower() for t in (candidate.get("tags") or [])]
    place_name = (candidate.get("place_name") or "").lower()
    title = (candidate.get("title") or "").lower()

    if preferred_categories:
        if category in preferred_categories:
            score += 35
        elif activity_type in preferred_categories:
            score += 18
        elif any(tag in preferred_categories for tag in tags):
            score += 12
        else:
            score -= 18

    quality_score = candidate.get("quality_score")
    rating = candidate.get("rating")
    review_count = candidate.get("review_count") or 0

    if quality_score is not None:
        score += float(quality_score) * 5
    elif rating is not None:
        score += float(rating) * 4

    score += min(review_count / 50.0, 10)

    has_kids = payload.get("has_kids")
    if has_kids is True:
        if candidate.get("good_for_kids") is True:
            score += 10
        if candidate.get("family_friendly") is True:
            score += 8

    group_size = payload.get("group_size")
    if group_size is not None and group_size >= 3 and candidate.get("good_for_groups") is True:
        score += 8

    indoor_outdoor_preference = payload.get("indoor_outdoor_preference")
    if indoor_outdoor_preference and indoor_outdoor_preference == candidate.get("indoor_outdoor"):
        score += 6

    max_effort_level = payload.get("max_effort_level")
    effort_level = candidate.get("effort_level")
    if max_effort_level is not None and effort_level is not None:
        if effort_level <= max_effort_level:
            score += 5

    budget_level = payload.get("budget_level")
    estimated_cost_cents = candidate.get("estimated_cost_cents")

    if budget_level == "low":
        if estimated_cost_cents is None or estimated_cost_cents <= 2000:
            score += 8
    elif budget_level == "medium":
        if estimated_cost_cents is None or estimated_cost_cents <= 5000:
            score += 6
    elif budget_level == "high":
        score += 3

    # Prefer more specific classification over generic fallback values
    if category in {"general", "", None}:
        score -= 8
    if activity_type in {"general", "activity", "", None}:
        score -= 5

    # Small reward for richer metadata
    if candidate.get("duration_minutes") is not None:
        score += 2
    if candidate.get("estimated_cost_cents") is not None:
        score += 2

    if category == "cafe":
        score -= 8

    # Strongly deprioritize movie/cinema style places even if they are classified broadly
    if (
        category == "movie_theater"
        or "cinema" in place_name
        or "cinema" in title
        or "movie" in place_name
        or "movie" in title
        or "theatre" in place_name
        or "theater" in place_name
    ):
        score -= 60

    return round(score, 2)


# Removes duplicate candidates by checking both the place_id and the activity_id
def _dedupe_candidates(candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    deduped: list[dict[str, Any]] = []

    for candidate in candidates:
        key = f"{candidate['place_id']}::{candidate['activity_id']}"
        if key in seen:
            continue
        seen.add(key)
        deduped.append(candidate)

    return deduped


def _get_category_cap(category: str) -> int:
    caps = {
        "movie_theater": 1,
        "cafe": 1,
        "bar": 2,
        "museum": 2,
        "park": 2,
        "restaurant": 1,
        "entertainment": 2,
        "family_activity": 2,
        "arcade": 1,
        "bowling": 1,
    }
    return caps.get(category, 2)

# Testing revealed that certain categories were suggested more since the scores in those categories would be highest
# In test_trip_generator.py, the first test showed that 9/10 of top results were museums, this makes recommendations less diverse
def _select_diverse_candidates_for_trip(
    ranked_candidates: list[dict[str, Any]],
    trip_days: int,
    activities_per_day: int,
) -> list[dict[str, Any]]:
    """
    "hard" diversity pass enforces the following, no duplicate places, max 1 of same category per day,
    max 2 of same category across whole trip, fallback fill if not enough diverse options
    """
    total_needed = trip_days * activities_per_day

    selected: list[dict[str, Any]] = []
    used_place_ids: set[str] = set()
    trip_category_counts: Counter[str] = Counter()

    # First pass: enforce strong diversity
    for day in range(1, trip_days + 1):
        day_selected: list[dict[str, Any]] = []
        day_category_counts: Counter[str] = Counter()

        for candidate in ranked_candidates:
            if len(day_selected) >= activities_per_day:
                break

            place_id = candidate["place_id"]
            category = (candidate.get("category") or "general").lower()
            if category == "general":
                continue

            if place_id in used_place_ids:
                continue

            if day_category_counts[category] >= 1:
                continue

            if trip_category_counts[category] >= _get_category_cap(category):
                continue

            day_selected.append(candidate)
            used_place_ids.add(place_id)
            day_category_counts[category] += 1
            trip_category_counts[category] += 1

        selected.extend(day_selected)

    # Second pass: fill remaining slots with best leftovers
    if len(selected) < total_needed:
        for candidate in ranked_candidates:
            if len(selected) >= total_needed:
                break

            place_id = candidate["place_id"]
            if place_id in used_place_ids:
                continue

            selected.append(candidate)
            used_place_ids.add(place_id)

    return selected[:total_needed]


# Simple way to build an itinerary, 3 activites per day, calculates the day, ranked order, and date scheduled
# Returns a list of itinterary items, each item will have the day number, ranked order, reason for selection, and other metadata
def _build_itinerary_structure(
    ranked_candidates: list[dict[str, Any]],
    start_date: date,
    trip_days: int,
    activities_per_day: int = 3,
) -> list[dict[str, Any]]:
    itinerary_items: list[dict[str, Any]] = []

    selected = _select_diverse_candidates_for_trip(
        ranked_candidates=ranked_candidates,
        trip_days=trip_days,
        activities_per_day=activities_per_day,
    )

    def is_bar_or_nightlife(candidate: dict[str, Any]) -> bool:
        category = (candidate.get("category") or "").lower()
        activity_type = (candidate.get("activity_type") or "").lower()
        return category == "bar" or activity_type == "nightlife"

    def is_daytime_anchor(candidate: dict[str, Any]) -> bool:
        category = (candidate.get("category") or "").lower()
        activity_type = (candidate.get("activity_type") or "").lower()
        return category in {"museum", "park", "landmark", "aquarium", "zoo"} or activity_type in {
            "sightseeing",
            "outdoor",
        }

    total_selected = len(selected)

    for day_idx in range(trip_days):
        start = day_idx * activities_per_day
        end = min(start + activities_per_day, total_selected)
        day_candidates = selected[start:end]

        daytime = []
        middle = []
        nightlife = []

        for candidate in day_candidates:
            if is_bar_or_nightlife(candidate):
                nightlife.append(candidate)
            elif is_daytime_anchor(candidate):
                daytime.append(candidate)
            else:
                middle.append(candidate)

        # keep stronger scored items first within each bucket
        daytime.sort(key=lambda c: -(c.get("recommendation_score") or 0))
        middle.sort(key=lambda c: -(c.get("recommendation_score") or 0))
        nightlife.sort(key=lambda c: -(c.get("recommendation_score") or 0))

        ordered_day = daytime + middle + nightlife

        for item_idx, candidate in enumerate(ordered_day):
            day_number = day_idx + 1
            item_order = item_idx + 1
            scheduled_date = start_date + timedelta(days=day_number - 1)

            itinerary_items.append({
                "day_number": day_number,
                "item_order": item_order,
                "scheduled_date": scheduled_date,
                "place_id": candidate["place_id"],
                "activity_id": candidate["activity_id"],
                "source_type": "generated",
                "selection_reason": (
                    f"score={candidate['recommendation_score']}; "
                    f"category={candidate.get('category')}; "
                    f"activity_type={candidate.get('activity_type')}"
                ),
            })

    return itinerary_items

# builds the trip
def generate_trip_from_preferences(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Full trip generation flow:
    - create trip
    - save preferences
    - fetch candidate activities
    - filter and score candidates
    - save itinerary items
    - return full saved trip
    """
    start_date = payload["start_date"]
    end_date = payload["end_date"]
    trip_days = _calculate_trip_days(start_date, end_date)

    trip = create_trip({ # Metadata about each trip that is stored in planner.trips
        "user_id": payload.get("user_id"),
        "title": payload["title"],
        "destination_city": payload["destination_city"],
        "destination_region": payload.get("destination_region"),
        "destination_country": payload.get("destination_country", "US"),
        "start_date": start_date,
        "end_date": end_date,
        "trip_days": trip_days,
        "status": "draft",
    }) 

    upsert_trip_preferences({ # Metadata about the users preferences stored in planner.trip_itinerary_items for editing trip
        "trip_id": trip["id"],
        "budget_level": payload.get("budget_level"),
        "group_size": payload.get("group_size"),
        "has_kids": payload.get("has_kids"),
        "family_friendly_required": payload.get("family_friendly_required"),
        "good_for_groups_required": payload.get("good_for_groups_required"),
        "good_for_kids_required": payload.get("good_for_kids_required"),
        "indoor_outdoor_preference": payload.get("indoor_outdoor_preference"),
        "max_effort_level": payload.get("max_effort_level"),
        "preferred_categories": payload.get("preferred_categories"),
        "excluded_categories": payload.get("excluded_categories"),
        "raw_questionnaire": _make_json_safe(payload),
    })

    candidates = get_candidate_activities_for_city(
        city=payload["destination_city"],
        region=payload.get("destination_region"),
    )

    filtered = [c for c in candidates if _matches_hard_filters(c, payload)]
    filtered = _dedupe_candidates(filtered)

    ranked: list[dict[str, Any]] = []
    for candidate in filtered:
        scored = dict(candidate)
        scored["recommendation_score"] = _score_candidate(candidate, payload)
        ranked.append(scored)

    ranked.sort(
        key=lambda x: ( # Simple lambda function to rank first by recommendation score at the top, then fallback to other metrics if needed
            x["recommendation_score"],
            x.get("quality_score") or 0,
            x.get("rating") or 0,
        ),
        reverse=True,
    )

    itinerary_items = _build_itinerary_structure( 
        ranked_candidates=ranked,
        start_date=start_date,
        trip_days=trip_days,
        activities_per_day=int(payload.get("activities_per_day", 3)),
    )

    delete_trip_itinerary_items(trip["id"])

    seen_slots: set[tuple[int, int]] = set()

    for item in itinerary_items: # The function that actually inserts each item into the itinerary
        slot = (item["day_number"], item["item_order"])
        if slot in seen_slots:
            continue
        seen_slots.add(slot)
        insert_trip_itinerary_item({
            "trip_id": trip["id"],
            **item,
        })

    update_trip_status(trip["id"], "generated")

    full_trip = get_full_trip(trip["id"])
    return {
        **full_trip,
        "ranked_results": ranked,
    }