# test file location: Trip-Tailor/backend/tests
# Files placed at: Trip-Tailor/backend/app/services

import pytest
from typing import List, Optional, Protocol

from app.services.normalize_place import (
    _country_to_iso,
    _parse_us_formatted_address,
    normalize_google_place,
    normalize_yelp_business,
)
from app.services.place_variables import get_place_variable_names


# _country_to_iso

@pytest.mark.parametrize(
    "input_val, expected",
    [
        ("usa", "US"),
        ("USA", "US"),
        ("us", "US"),
        ("United States", "US"),
        ("united states of america", "US"),
        ("  usa  ", "US"),
        ("Canada", "CANADA"),
        (" germany ", "GERMANY"),
        ("Uk", "UK"),
    ],
)
def test_country_to_iso_valid_inputs(input_val, expected):
    assert _country_to_iso(input_val) == expected


def test_country_to_iso_none():
    assert _country_to_iso(None) is None


def test_country_to_iso_empty_string():
    assert _country_to_iso("") is None


def test_country_to_iso_whitespace_only():
    assert _country_to_iso("   ") == ""  # matches current implementation


def test_country_to_iso_case_preservation_for_non_usa():
    assert _country_to_iso("FrAnCe") == "FRANCE"


# _parse_us_formatted_address

def test_full_valid_address():
    result = _parse_us_formatted_address("5402 Woodward Ave, Detroit, MI 48202, USA")
    assert result == {
        "address_line1": "5402 Woodward Ave",
        "city": "Detroit",
        "region": "MI",
        "postal_code": "48202",
        "country": "US",
    }


def test_with_zip_plus4():
    result = _parse_us_formatted_address("1234 Main St, Ann Arbor, MI 48104-1234, USA")
    assert result["postal_code"] == "48104-1234"
    assert result["region"] == "MI"


def test_missing_zip():
    result = _parse_us_formatted_address("1234 Main St, Ann Arbor, MI, USA")
    assert result["region"] == "MI"
    assert result["postal_code"] is None


def test_missing_city():
    result = _parse_us_formatted_address("1234 Main St, MI 48104, USA")
    assert result["city"] is None
    assert result["region"] == "MI"


def test_missing_country_defaults_to_us():
    result = _parse_us_formatted_address("1234 Main St, Detroit, MI 48202")
    assert result["country"] == "US"


def test_non_usa_country_passthrough():
    result = _parse_us_formatted_address("1234 Main St, Toronto, ON M5V 3L9, Canada")
    assert result["country"] == "CANADA"


def test_only_address_line():
    result = _parse_us_formatted_address("1234 Main St")
    assert result["address_line1"] == "1234 Main St"
    assert result["city"] is None


def test_empty_string():
    result = _parse_us_formatted_address("")
    assert result == {
        "address_line1": None,
        "city": None,
        "region": None,
        "postal_code": None,
        "country": None,
    }


def test_none_input():
    result = _parse_us_formatted_address(None)
    assert result == {
        "address_line1": None,
        "city": None,
        "region": None,
        "postal_code": None,
        "country": None,
    }


def test_extra_spaces_and_commas():
    result = _parse_us_formatted_address(
        "  1234 Main St  ,  Detroit  , MI   48202 ,  USA  "
    )
    assert result["address_line1"] == "1234 Main St"
    assert result["city"] == "Detroit"
    assert result["region"] == "MI"
    assert result["postal_code"] == "48202"
    assert result["country"] == "US"


# normalize_google_place

def test_normalize_google_full_valid_input():
    raw = {
        "name": "Test Cafe",
        "formatted_address": "5200 Woodward Ave, Detroit, MI 48202, USA",
        "place_id": "abc123",
        "geometry": {"location": {"lat": 42.1, "lng": -83.1}},
    }
    result = normalize_google_place(raw)
    assert result == {
        "name": "Test Cafe",
        "address_line1": "5200 Woodward Ave",
        "address_line2": None,
        "city": "Detroit",
        "region": "MI",
        "postal_code": "48202",
        "country": "US",
        "latitude": 42.1,
        "longitude": -83.1,
        "phone": None,
        "website_url": None,
        "google_maps_url": None,
        "google_place_id": "abc123",
        "yelp_business_id": None,
    }


def test_normalize_google_missing_geometry():
    raw = {
        "name": "No Location Place",
        "formatted_address": "123 Main St, Detroit, MI 48202, USA",
        "place_id": "xyz789",
    }
    result = normalize_google_place(raw)
    assert result["latitude"] is None
    assert result["longitude"] is None


def test_normalize_google_missing_formatted_address():
    raw = {
        "name": "Unknown Address",
        "place_id": "noaddr123",
        "geometry": {"location": {"lat": 10.0, "lng": 20.0}},
    }
    result = normalize_google_place(raw)
    assert result["address_line1"] is None
    assert result["city"] is None
    assert result["region"] is None
    assert result["postal_code"] is None
    assert result["country"] == "US"


def test_normalize_google_missing_country_defaults_to_us():
    raw = {
        "name": "Local Spot",
        "formatted_address": "123 Main St, Detroit, MI 48202",
        "place_id": "local123",
        "geometry": {"location": {"lat": 1.0, "lng": 2.0}},
    }
    result = normalize_google_place(raw)
    assert result["country"] == "US"


def test_normalize_google_partial_address():
    raw = {
        "name": "Partial",
        "formatted_address": "123 Main St",
        "place_id": "partial123",
    }
    result = normalize_google_place(raw)
    assert result["address_line1"] == "123 Main St"
    assert result["city"] is None


def test_normalize_google_empty_input():
    result = normalize_google_place({})
    assert result["name"] is None
    assert result["latitude"] is None
    assert result["longitude"] is None
    assert result["country"] == "US"


def test_normalize_google_geometry_without_location():
    raw = {
        "name": "Weird Geometry",
        "formatted_address": "123 Main St, Detroit, MI 48202, USA",
        "geometry": {},
    }
    result = normalize_google_place(raw)
    assert result["latitude"] is None
    assert result["longitude"] is None


# normalize_yelp_business

def test_normalize_yelp_full_valid_input():
    raw = {
        "name": "Test Restaurant",
        "id": "yelp123",
        "url": "https://yelp.com/biz/test",
        "display_phone": "(313) 123-4567",
        "coordinates": {"latitude": 42.3, "longitude": -83.0},
        "location": {
            "display_address": ["123 Main St", "Detroit, MI 48202"],
            "city": "Detroit",
            "state": "MI",
            "zip_code": "48202",
            "country": "US",
        },
    }
    result = normalize_yelp_business(raw)
    assert result == {
        "name": "Test Restaurant",
        "address_line1": "123 Main St",
        "address_line2": "Detroit, MI 48202",
        "city": "Detroit",
        "region": "MI",
        "postal_code": "48202",
        "country": "US",
        "latitude": 42.3,
        "longitude": -83.0,
        "phone": "(313) 123-4567",
        "website_url": "https://yelp.com/biz/test",
        "google_maps_url": None,
        "google_place_id": None,
        "yelp_business_id": "yelp123",
    }


def test_normalize_yelp_phone_fallback():
    raw = {
        "name": "Phone Test",
        "id": "phone123",
        "phone": "+13131234567",
        "coordinates": {},
        "location": {},
    }
    result = normalize_yelp_business(raw)
    assert result["phone"] == "+13131234567"


def test_normalize_yelp_missing_coordinates():
    raw = {
        "name": "No Coords",
        "id": "noc123",
        "location": {"display_address": ["123 Main St"]},
    }
    result = normalize_yelp_business(raw)
    assert result["latitude"] is None
    assert result["longitude"] is None


def test_normalize_yelp_missing_location():
    raw = {
        "name": "No Location",
        "id": "noloc123",
        "coordinates": {"latitude": 1.0, "longitude": 2.0},
    }
    result = normalize_yelp_business(raw)
    assert result["address_line1"] is None
    assert result["city"] is None
    assert result["country"] == "US"


def test_normalize_yelp_display_address_single_item():
    raw = {
        "name": "Short Address",
        "id": "short123",
        "location": {"display_address": ["123 Main St"]},
    }
    result = normalize_yelp_business(raw)
    assert result["address_line1"] == "123 Main St"
    assert result["address_line2"] is None


def test_normalize_yelp_empty_input():
    result = normalize_yelp_business({})
    assert result["name"] is None
    assert result["latitude"] is None
    assert result["longitude"] is None
    assert result["country"] == "US"


def test_normalize_yelp_country_passthrough():
    raw = {
        "name": "Canada Biz",
        "id": "can123",
        "location": {"country": "CA"},
    }
    result = normalize_yelp_business(raw)
    assert result["country"] == "CA"


# get_place_variable_names  (place_variables.py)

def test_get_place_variable_names():
    expected_variables = [
        "name", "address_line1", "address_line2", "city", "region",
        "postal_code", "country", "latitude", "longitude", "phone",
        "website_url", "google_maps_url", "google_place_id", "yelp_business_id",
        "title", "description", "activity_type", "category", "tags",
        "estimated_cost_cents", "duration_minutes", "effort_level",
        "accessibility_notes", "wheelchair_accessible", "family_friendly",
        "good_for_groups", "good_for_kids", "pet_friendly", "indoor_outdoor",
        "noise_level", "activity_level", "reservations_required", "ticket_required",
        "source", "source_url", "provider_source", "provider_category_types",
        "matched_primary_type", "rating", "review_count", "price_level",
        "business_status", "quality_score",
    ]
    result = get_place_variable_names()
    assert result == expected_variables
    assert all(isinstance(var, str) for var in result)
    assert len(result) == len(set(result))


# PlaceProvider interface / DummyProvider  (place_provider.py)

class DummyProvider:
    """Concrete test implementation of the PlaceProvider protocol."""

    def search_places(
        self,
        term: str,
        latitude: float,
        longitude: float,
        radius_meters: int = 5000,
        limit: int = 10,
        categories: Optional[str] = None,
        open_now: Optional[bool] = None,
    ) -> List[dict]:
        all_places = [
            {"name": "Museum A", "category": "museum", "latitude": latitude, "longitude": longitude, "open_now": True},
            {"name": "Museum B", "category": "museum", "latitude": latitude, "longitude": longitude, "open_now": False},
            {"name": "Park C",   "category": "park",   "latitude": latitude, "longitude": longitude, "open_now": True},
            {"name": "Cafe D",   "category": "cafe",   "latitude": latitude, "longitude": longitude, "open_now": True},
        ]
        results = [p for p in all_places if term.lower() in p["name"].lower()]
        if categories:
            results = [p for p in results if p["category"] == categories]
        if open_now is not None:
            results = [p for p in results if p["open_now"] == open_now]
        return results[:limit]


def test_search_places_by_term():
    provider = DummyProvider()
    results = provider.search_places(term="Museum", latitude=0, longitude=0)
    assert len(results) == 2
    assert all("Museum" in p["name"] for p in results)


def test_search_places_with_limit():
    provider = DummyProvider()
    results = provider.search_places(term="Museum", latitude=0, longitude=0, limit=1)
    assert len(results) == 1


def test_search_places_with_category_filter():
    provider = DummyProvider()
    results = provider.search_places(term="Museum", latitude=0, longitude=0, categories="museum")
    assert all(p["category"] == "museum" for p in results)


def test_search_places_with_open_now_filter():
    provider = DummyProvider()
    results = provider.search_places(term="Museum", latitude=0, longitude=0, open_now=True)
    assert all(p["open_now"] is True for p in results)


def test_search_places_category_and_open_now_combined():
    provider = DummyProvider()
    results = provider.search_places(term="Museum", latitude=0, longitude=0, categories="museum", open_now=False)
    assert len(results) == 1
    assert results[0]["name"] == "Museum B"


def test_search_places_no_match():
    provider = DummyProvider()
    results = provider.search_places(term="Zoo", latitude=0, longitude=0)
    assert results == []