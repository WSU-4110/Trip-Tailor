from copy import deepcopy
from typing import Any, Optional

from app.services.google_type_rules import GOOGLE_TYPE_RULES, TYPE_PRIORITY, get_default_activity_rule

DEFAULT_ACTIVITY_FIELDS = {
    "title": None,
    "description": None,
    "activity_type": "general",
    "category": "general",
    "tags": [],
    "estimated_cost_cents": None,
    "duration_minutes": None,
    "effort_level": None,
    "accessibility_notes": None,
    "wheelchair_accessible": None,
    "family_friendly": None,
    "good_for_groups": None,
    "good_for_kids": None,
    "pet_friendly": None,
    "indoor_outdoor": None,
    "noise_level": None,
    "activity_level": None,
    "reservations_required": None,
    "ticket_required": None,
    "source": None,
    "source_url": None,
    "provider_source": None,
    "provider_category_types": [],
    "matched_primary_type": None,
    "rating": None,
    "review_count": None,
    "price_level": None,
    "business_status": None,
    "quality_score": None,
}

YELP_CATEGORY_RULES: dict[str, dict[str, Any]] = {
    "museums": {
        "activity_type": "sightseeing",
        "category": "museum",
        "tags": ["culture", "indoors"],
        "duration_minutes": 120,
        "effort_level": 2,
        "family_friendly": True,
        "good_for_groups": True,
        "good_for_kids": True,
        "indoor_outdoor": "indoor",
        "noise_level": "low",
        "activity_level": "low",
        "ticket_required": True,
    },
    "aquariums": {
        "activity_type": "sightseeing",
        "category": "aquarium",
        "tags": ["family", "indoors"],
        "duration_minutes": 120,
        "effort_level": 2,
        "family_friendly": True,
        "good_for_groups": True,
        "good_for_kids": True,
        "indoor_outdoor": "indoor",
        "noise_level": "medium",
        "activity_level": "low",
        "ticket_required": True,
    },
    "zoos": {
        "activity_type": "sightseeing",
        "category": "zoo",
        "tags": ["family", "outdoors"],
        "duration_minutes": 180,
        "effort_level": 3,
        "family_friendly": True,
        "good_for_groups": True,
        "good_for_kids": True,
        "indoor_outdoor": "outdoor",
        "noise_level": "medium",
        "activity_level": "medium",
        "ticket_required": True,
    },
    "parks": {
        "activity_type": "outdoor",
        "category": "park",
        "tags": ["nature", "outdoors"],
        "duration_minutes": 90,
        "effort_level": 2,
        "family_friendly": True,
        "good_for_groups": True,
        "good_for_kids": True,
        "pet_friendly": True,
        "indoor_outdoor": "outdoor",
        "noise_level": "low",
        "activity_level": "medium",
    },
    "hiking": {
        "activity_type": "outdoor",
        "category": "hiking",
        "tags": ["nature", "exercise", "outdoors"],
        "duration_minutes": 180,
        "effort_level": 4,
        "family_friendly": False,
        "good_for_groups": True,
        "good_for_kids": False,
        "pet_friendly": True,
        "indoor_outdoor": "outdoor",
        "noise_level": "low",
        "activity_level": "high",
    },
    "bowling": {
        "activity_type": "entertainment",
        "category": "bowling",
        "tags": ["group", "family", "indoors"],
        "duration_minutes": 120,
        "effort_level": 2,
        "family_friendly": True,
        "good_for_groups": True,
        "good_for_kids": True,
        "indoor_outdoor": "indoor",
        "noise_level": "medium",
        "activity_level": "medium",
    },
    "arcades": {
        "activity_type": "entertainment",
        "category": "arcade",
        "tags": ["games", "family", "indoors"],
        "duration_minutes": 90,
        "effort_level": 2,
        "family_friendly": True,
        "good_for_groups": True,
        "good_for_kids": True,
        "indoor_outdoor": "indoor",
        "noise_level": "medium",
        "activity_level": "medium",
    },
    "movietheaters": {
        "activity_type": "entertainment",
        "category": "movie_theater",
        "tags": ["indoors", "date_night"],
        "duration_minutes": 150,
        "effort_level": 1,
        "family_friendly": True,
        "good_for_groups": True,
        "good_for_kids": True,
        "indoor_outdoor": "indoor",
        "noise_level": "low",
        "activity_level": "low",
        "ticket_required": True,
    },
    "bars": {
        "activity_type": "nightlife",
        "category": "bar",
        "tags": ["nightlife", "drinks"],
        "duration_minutes": 120,
        "effort_level": 1,
        "family_friendly": False,
        "good_for_groups": True,
        "good_for_kids": False,
        "indoor_outdoor": "indoor",
        "noise_level": "high",
        "activity_level": "low",
    },
    "coffee": {
        "activity_type": "food_drink",
        "category": "cafe",
        "tags": ["coffee", "relaxed", "indoors"],
        "duration_minutes": 45,
        "effort_level": 1,
        "family_friendly": True,
        "good_for_groups": True,
        "good_for_kids": True,
        "indoor_outdoor": "indoor",
        "noise_level": "low",
        "activity_level": "low",
    },
    "restaurants": {
        "activity_type": "food_drink",
        "category": "restaurant",
        "tags": ["food", "dining"],
        "duration_minutes": 90,
        "effort_level": 1,
        "family_friendly": True,
        "good_for_groups": True,
        "good_for_kids": True,
        "indoor_outdoor": "indoor",
        "noise_level": "medium",
        "activity_level": "low",
        "reservations_required": False,
    },
}


def _merge_defaults(base_rule: dict[str, Any]) -> dict[str, Any]:
    merged = deepcopy(DEFAULT_ACTIVITY_FIELDS)
    if base_rule:
        merged.update(base_rule)
    return merged

def _normalize_google_price_level(raw: dict) -> int | None:
    """
    Google Places Text Search may return price_level as an integer (typically 0-4).
    Return it as-is if present and valid.
    """
    price_level = raw.get("price_level")
    if isinstance(price_level, int) and 0 <= price_level <= 4:
        return price_level
    return None

def _normalize_yelp_price_level(raw: dict) -> int | None:
    price = raw.get("price")
    if isinstance(price, str) and price:
        return min(len(price), 4)
    return None

def _price_level_to_cost_cents(price_level: Optional[int]) -> Optional[int]:
    if price_level is None:
        return None

    mapping = {
        0: 0,
        1: 1500,
        2: 3000,
        3: 6000,
        4: 10000,
    }
    return mapping.get(price_level)


def _fallback_cost_from_category(category: Optional[str]) -> Optional[int]:
    if not category:
        return None

    fallback_costs = {
        "park": 0,
        "museum": 2000,
        "aquarium": 3000,
        "zoo": 3000,
        "restaurant": 3000,
        "cafe": 1500,
        "bar": 2500,
        "arcade": 2500,
        "bowling": 3000,
        "movie_theater": 2500,
        "hiking": 0,
    }
    return fallback_costs.get(category, 2000)


def _fallback_duration_from_category_or_type(
    category: Optional[str],
    activity_type: Optional[str],
) -> Optional[int]:
    if category in {"museum", "aquarium"}:
        return 120
    if category == "zoo":
        return 180
    if category == "park":
        return 90
    if category == "hiking":
        return 180
    if category == "restaurant":
        return 90
    if category == "cafe":
        return 45
    if category == "bar":
        return 120
    if category == "arcade":
        return 90
    if category == "bowling":
        return 120
    if category == "movie_theater":
        return 150

    if activity_type == "outdoor":
        return 90
    if activity_type == "entertainment":
        return 90
    if activity_type == "food_drink":
        return 60
    if activity_type == "sightseeing":
        return 120

    return 90


def _apply_fallbacks(result: dict[str, Any]) -> dict[str, Any]:
    category = result.get("category")
    activity_type = result.get("activity_type")

    if result.get("duration_minutes") is None:
        result["duration_minutes"] = _fallback_duration_from_category_or_type(
            category,
            activity_type,
        )

    if result.get("estimated_cost_cents") is None:
        result["estimated_cost_cents"] = _fallback_cost_from_category(category)

    return result

def _normalize_category(category: Optional[str]) -> str:
    if not category:
        return "general"

    c = category.lower().strip()

    category_aliases = {
        "movie": "movie_theater",
        "cinema": "movie_theater",
        "theater": "entertainment",
        "theatre": "entertainment",
        "coffee": "cafe",
        "food": "restaurant",
        "nightlife": "bar",
        "family": "family_activity",
        "culture": "museum",
        "outdoors": "park",
        "attraction": "landmark",
    }

    return category_aliases.get(c, c)


def _derive_activity_type_from_category(category: Optional[str]) -> str:
    c = _normalize_category(category)

    if c in {"museum", "aquarium", "zoo", "landmark", "historic_site"}:
        return "sightseeing"
    if c in {"park", "hiking", "trail", "outdoor"}:
        return "outdoor"
    if c in {"restaurant", "cafe"}:
        return "food_drink"
    if c in {"bar"}:
        return "nightlife"
    if c in {"arcade", "bowling", "entertainment", "family_activity"}:
        return "entertainment"
    if c == "movie_theatre":
        return "activity"


    return "activity"


def _normalize_labels(result: dict[str, Any]) -> dict[str, Any]:
    category = _normalize_category(result.get("category"))
    result["category"] = category

    activity_type = (result.get("activity_type") or "").lower().strip()
    if activity_type in {"", "general", "activity"}:
        result["activity_type"] = _derive_activity_type_from_category(category)

    tags = list(result.get("tags") or [])
    if category == "movie_theater" and "movies" not in tags:
        tags.append("movies")
    if category == "museum" and "culture" not in tags:
        tags.append("culture")
    if category == "park" and "outdoors" not in tags:
        tags.append("outdoors")
    if category == "bar" and "nightlife" not in tags:
        tags.append("nightlife")

    result["tags"] = tags
    return result



def _build_quality_score(rating: float | None, review_count: int | None) -> float | None:
    """
    Simple placeholder quality score.
    For now, return rating if present.
    Later, this can incorporate review_count weighting.
    """
    if rating is None:
        return None
    
    count = review_count or 0
    weight = min(count / 100.0, 1.0)
    return round((rating * 0.7) + (rating * weight * 0.3), 2)


def classify_google_place(raw: dict) -> dict[str, Any]:
    """
    Convert a raw Google Places result into normalized TripTailor activity metadata.
    This does not save anything to the DB. It only classifies the place.
    """
    place_types = raw.get("types") or []

    base_rule = get_default_activity_rule() or {}
    result = _merge_defaults(base_rule)

    matched_type = None
    for place_type in TYPE_PRIORITY:
        if place_type in place_types and place_type in GOOGLE_TYPE_RULES:
            result.update(GOOGLE_TYPE_RULES[place_type])
            matched_type = place_type
            break

    rating = raw.get("rating")
    review_count = raw.get("user_ratings_total")
    price_level = _normalize_google_price_level(raw)

    result.update({
        "title": raw.get("name"),
        "description": None,
        "source": "google",
        "source_url": None,

        # Variables derived from Google's API
        "provider_source": "google",
        "provider_category_types": place_types,
        "matched_primary_type": matched_type,
        "rating": float(rating) if rating is not None else None,
        "review_count": int(review_count) if review_count is not None else None,
        "price_level": price_level,
        "business_status": raw.get("business_status"),
        "estimated_cost_cents": result.get("estimated_cost_cents") or _price_level_to_cost_cents(price_level),
        "quality_score": _build_quality_score(
            float(rating) if rating is not None else None,
            int(review_count) if review_count is not None else None,
        ),
    })

    result = _apply_fallbacks(result)
    result = _normalize_labels(result)
    return result
    

def _get_yelp_aliases(raw: dict) -> list[str]:
    categories = raw.get("categories") or []
    aliases: list[str] = []

    for cat in categories:
        alias = cat.get("alias")
        if alias:
            aliases.append(alias)

    return aliases


def classify_yelp_business(raw: dict) -> dict[str, Any]:
    result = _merge_defaults({})

    aliases = _get_yelp_aliases(raw)
    matched_alias = None

    for alias in aliases:
        if alias in YELP_CATEGORY_RULES:
            result.update(YELP_CATEGORY_RULES[alias])
            matched_alias = alias
            break

    rating = raw.get("rating")
    review_count = raw.get("review_count")
    price_level = _normalize_yelp_price_level(raw)

    result.update({
        "title": raw.get("name"),
        "description": None,
        "source": "yelp",
        "source_url": raw.get("url"),

        # variables derived from Yelp's API
        "provider_source": "yelp",
        "provider_category_types": aliases,
        "matched_primary_type": matched_alias,
        "rating": float(rating) if rating is not None else None,
        "review_count": int(review_count) if review_count is not None else None,
        "price_level": price_level,
        "business_status": "OPEN" if not raw.get("is_closed", False) else "CLOSED",
        "estimated_cost_cents": result.get("estimated_cost_cents") or _price_level_to_cost_cents(price_level),
        "quality_score": _build_quality_score(
            float(rating) if rating is not None else None,
            int(review_count) if review_count is not None else None,
        ),
    })

    result = _apply_fallbacks(result)
    result = _normalize_labels(result)
    return result