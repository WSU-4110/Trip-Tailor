"""
Unit tests for app.services.place_classifier.

Covers _normalize_category, _derive_activity_type_from_category, _merge_defaults,
_normalize_labels, classify_google_place, and classify_yelp_business.
"""

# was in backend/tests/test_place_classifier.py
from unittest.mock import patch

import pytest

from app.services.place_classifier import (
    DEFAULT_ACTIVITY_FIELDS,
    YELP_CATEGORY_RULES,
    _derive_activity_type_from_category,
    _merge_defaults,
    _normalize_category,
    _normalize_labels,
    classify_google_place,
    classify_yelp_business,
)


# _normalize_category

class TestNormalizeCategory:
    """Happy paths and edge cases for _normalize_category."""

    def test_none_returns_general(self):
        assert _normalize_category(None) == "general"

    def test_empty_string_returns_general(self):
        assert _normalize_category("") == "general"

    def test_whitespace_only_strips_to_empty_alias_behavior(self):
        # "" is not caught by `if not category` only when string is all spaces;
        # after strip, c becomes "" and aliases miss, returns ""
        assert _normalize_category("   ") == ""

    def test_known_alias_coffee_to_cafe(self):
        assert _normalize_category("coffee") == "cafe"
        assert _normalize_category("COFFEE") == "cafe"

    def test_known_alias_movie_to_movie_theater(self):
        assert _normalize_category("movie") == "movie_theater"
        assert _normalize_category("cinema") == "movie_theater"

    def test_unknown_category_passthrough_lower(self):
        assert _normalize_category("Bowling") == "bowling"
        assert _normalize_category("  Hiking  ") == "hiking"

    def test_category_not_in_mapping_unchanged_normalized(self):
        assert _normalize_category("quantum_buffet") == "quantum_buffet"


# _derive_activity_type_from_category

class TestDeriveActivityTypeFromCategory:
    def test_museum_sightseeing(self):
        assert _derive_activity_type_from_category("museum") == "sightseeing"

    def test_zoo_sightseeing(self):
        assert _derive_activity_type_from_category("zoo") == "sightseeing"

    def test_park_outdoor(self):
        assert _derive_activity_type_from_category("park") == "outdoor"

    def test_hiking_outdoor(self):
        assert _derive_activity_type_from_category("hiking") == "outdoor"

    def test_restaurant_food_drink(self):
        assert _derive_activity_type_from_category("restaurant") == "food_drink"

    def test_cafe_food_drink(self):
        assert _derive_activity_type_from_category("cafe") == "food_drink"

    def test_bar_nightlife(self):
        assert _derive_activity_type_from_category("bar") == "nightlife"

    def test_arcade_entertainment(self):
        assert _derive_activity_type_from_category("arcade") == "entertainment"

    def test_none_normalizes_to_general_then_activity(self):
        assert _derive_activity_type_from_category(None) == "activity"

    def test_unknown_category_returns_activity(self):
        assert _derive_activity_type_from_category("alien_golf") == "activity"

    def test_bowling_entertainment(self):
        assert _derive_activity_type_from_category("bowling") == "entertainment"


# _merge_defaults

class TestMergeDefaults:
    def test_empty_rule_returns_full_default_structure(self):
        merged = _merge_defaults({})
        assert merged == DEFAULT_ACTIVITY_FIELDS

    def test_none_rule_behaves_like_empty_for_update(self):
        merged_none = _merge_defaults(None)  # type: ignore[arg-type]
        merged_empty = _merge_defaults({})
        assert merged_none == merged_empty == DEFAULT_ACTIVITY_FIELDS

    def test_partial_rule_overrides_and_preserves_other_defaults(self):
        rule = {"activity_type": "sightseeing", "category": "museum", "duration_minutes": 90}
        merged = _merge_defaults(rule)
        assert merged["activity_type"] == "sightseeing"
        assert merged["category"] == "museum"
        assert merged["duration_minutes"] == 90
        # Unset keys remain from DEFAULT_ACTIVITY_FIELDS
        assert merged["title"] is None
        assert merged["tags"] == []
        assert merged["wheelchair_accessible"] is None

    def test_rule_tags_replace_default_empty_list(self):
        merged = _merge_defaults({"tags": ["test"]})
        assert merged["tags"] == ["test"]

    def test_deepcopy_defaults_not_mutated(self):
        base = _merge_defaults({})
        base["tags"].append("mutate")
        fresh = _merge_defaults({})
        assert fresh["tags"] == []


# _normalize_labels

class TestNormalizeLabels:
    def test_happy_path_derives_activity_from_category_when_general(self):
        result = {"category": "museum", "activity_type": "general", "tags": []}
        out = _normalize_labels(result)
        assert out["category"] == "museum"
        assert out["activity_type"] == "sightseeing"
        assert "culture" in out["tags"]

    def test_empty_activity_type_gets_derived(self):
        result = {"category": "park", "activity_type": "", "tags": []}
        out = _normalize_labels(result)
        assert out["activity_type"] == "outdoor"
        assert "outdoors" in out["tags"]

    def test_preserves_explicit_activity_type_when_not_blank(self):
        result = {"category": "museum", "activity_type": "custom", "tags": []}
        out = _normalize_labels(result)
        assert out["activity_type"] == "custom"

    def test_movie_theater_adds_movies_tag(self):
        result = {"category": "movie_theater", "activity_type": "entertainment", "tags": ["indoor"]}
        out = _normalize_labels(result)
        assert "movies" in out["tags"]

    def test_bar_adds_nightlife_tag(self):
        result = {"category": "bar", "activity_type": "nightlife", "tags": []}
        out = _normalize_labels(result)
        assert "nightlife" in out["tags"]

    def test_none_tags_treated_as_empty_list(self):
        result = {"category": "cafe", "activity_type": "food_drink", "tags": None}
        out = _normalize_labels(result)
        assert isinstance(out["tags"], list)

    def test_category_alias_applied_before_derive(self):
        result = {"category": "coffee", "activity_type": "general", "tags": []}
        out = _normalize_labels(result)
        assert out["category"] == "cafe"
        assert out["activity_type"] == "food_drink"


# classify_google_place

class TestClassifyGooglePlace:
    def test_happy_path_museum_matches_rule_and_sets_metadata(self):
        raw = {
            "name": "City Museum",
            "types": ["museum", "point_of_interest"],
            "rating": 4.2,
            "user_ratings_total": 50,
            "price_level": 2,
            "business_status": "OPERATIONAL",
        }
        out = classify_google_place(raw)
        assert out["title"] == "City Museum"
        assert out["source"] == "google"
        assert out["provider_source"] == "google"
        assert out["matched_primary_type"] == "museum"
        assert out["matched_primary_type"] in (raw["types"])
        assert out["rating"] == 4.2
        assert out["review_count"] == 50
        assert out["price_level"] == 2
        assert out["business_status"] == "OPERATIONAL"
        assert out["category"] == "museum"
        assert out["activity_type"] == "sightseeing"
        assert "culture" in out["tags"]

    def test_no_matching_google_type_uses_default_rule_only(self):
        raw = {
            "name": "Mystery Spot",
            "types": ["not_a_real_google_type_xyz"],
        }
        out = classify_google_place(raw)
        assert out["title"] == "Mystery Spot"
        assert out["matched_primary_type"] is None
        assert out["provider_category_types"] == ["not_a_real_google_type_xyz"]
        # Default rule from google_type_rules still seeds some fields
        assert out["source"] == "google"

    @patch("app.services.place_classifier.TYPE_PRIORITY", ["bakery", "restaurant"])
    @patch(
        "app.services.place_classifier.GOOGLE_TYPE_RULES",
        {
            "bakery": {"category": "bakery", "tags": ["bread"], "estimated_cost_cents": 500},
            "restaurant": {"category": "food", "tags": ["dining"]},
        },
    )
    def test_mocked_priority_first_match_wins(self):
        raw = {
            "name": "Combo Place",
            "types": ["restaurant", "bakery"],
        }
        out = classify_google_place(raw)
        assert out["matched_primary_type"] == "bakery"
        assert out["category"] == "bakery"
        assert "bread" in out["tags"]

    def test_mocked_isolated_merge_defaults_in_output(self):
        """With no rule match, output still contains every DEFAULT_ACTIVITY_FIELDS key."""
        raw = {"name": "Only Defaults", "types": ["custom"]}
        with (
            patch("app.services.place_classifier.TYPE_PRIORITY", ["custom"]),
            patch("app.services.place_classifier.GOOGLE_TYPE_RULES", {}),
            patch("app.services.place_classifier.get_default_activity_rule", return_value={}),
        ):
            out = classify_google_place(raw)
        assert out["title"] == "Only Defaults"
        for key in DEFAULT_ACTIVITY_FIELDS:
            assert key in out
        assert out.get("matched_primary_type") is None

    def test_types_none_treated_as_empty(self):
        raw = {"name": "No Types", "types": None}
        out = classify_google_place(raw)
        assert out["provider_category_types"] == []
        assert out["matched_primary_type"] is None


# classify_yelp_business

class TestClassifyYelpBusiness:
    def test_happy_path_museums_alias(self):
        raw = {
            "name": "Art Institute",
            "categories": [{"alias": "museums", "title": "Museums"}],
            "rating": 4.5,
            "review_count": 200,
            "price": "$$",
            "url": "https://yelp.com/biz/art-inst",
            "is_closed": False,
        }
        out = classify_yelp_business(raw)
        assert out["title"] == "Art Institute"
        assert out["source"] == "yelp"
        assert out["source_url"] == "https://yelp.com/biz/art-inst"
        assert out["matched_primary_type"] == "museums"
        assert out["category"] == "museum"
        assert out["activity_type"] == "sightseeing"
        assert out["business_status"] == "OPEN"
        assert out["rating"] == 4.5
        assert out["review_count"] == 200
        assert out["price_level"] == 2
        rule = YELP_CATEGORY_RULES["museums"]
        assert out["duration_minutes"] == rule["duration_minutes"]

    def test_first_matching_alias_in_list_wins(self):
        raw = {
            "name": "Multi",
            "categories": [
                {"alias": "nonexistent_alias_xyz"},
                {"alias": "coffee"},
            ],
            "is_closed": False,
        }
        out = classify_yelp_business(raw)
        assert out["matched_primary_type"] == "coffee"
        assert out["category"] == "cafe"

    def test_no_categories_empty_aliases(self):
        raw = {"name": "Bare", "categories": [], "is_closed": False}
        out = classify_yelp_business(raw)
        assert out["matched_primary_type"] is None
        assert out["provider_category_types"] == []
        assert out["title"] == "Bare"

    def test_alias_not_in_rules_only_defaults_plus_yelp_fields(self):
        raw = {
            "name": "Unknown Biz",
            "categories": [{"alias": "totally_unknown_category"}],
            "is_closed": True,
        }
        out = classify_yelp_business(raw)
        assert out["matched_primary_type"] is None
        assert out["business_status"] == "CLOSED"
        assert out["category"] == "general"
        assert out["activity_type"] == "activity"

    def test_categories_missing_keys_skipped(self):
        raw = {
            "name": "Partial cats",
            "categories": [{}, {"alias": "parks"}],
            "is_closed": False,
        }
        out = classify_yelp_business(raw)
        assert out["matched_primary_type"] == "parks"
        assert out["category"] == "park"

    def test_default_activity_fields_always_present_after_classify(self):
        raw = {
            "name": "Check keys",
            "categories": [{"alias": "bars"}],
            "is_closed": False,
        }
        out = classify_yelp_business(raw)
        for key in DEFAULT_ACTIVITY_FIELDS:
            assert key in out