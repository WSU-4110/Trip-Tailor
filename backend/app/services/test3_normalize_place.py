import pytest
from normalize_place import normalize_google_place


def test_full_valid_input():
    raw = {
        "name": "Test Cafe",
        "formatted_address": "5200 Woodward Ave, Detroit, MI 48202, USA",
        "place_id": "abc123",
        "geometry": {
            "location": {"lat": 42.1, "lng": -83.1}
        },
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


def test_missing_geometry():
    raw = {
        "name": "No Location Place",
        "formatted_address": "123 Main St, Detroit, MI 48202, USA",
        "place_id": "xyz789",
    }

    result = normalize_google_place(raw)

    assert result["latitude"] is None
    assert result["longitude"] is None


def test_missing_formatted_address():
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
    assert result["country"] == "US"  # fallback


def test_missing_country_defaults_to_us():
    raw = {
        "name": "Local Spot",
        "formatted_address": "123 Main St, Detroit, MI 48202",
        "place_id": "local123",
        "geometry": {"location": {"lat": 1.0, "lng": 2.0}},
    }

    result = normalize_google_place(raw)

    assert result["country"] == "US"


def test_partial_address():
    raw = {
        "name": "Partial",
        "formatted_address": "123 Main St",
        "place_id": "partial123",
    }

    result = normalize_google_place(raw)

    assert result["address_line1"] == "123 Main St"
    assert result["city"] is None


def test_empty_input():
    result = normalize_google_place({})

    assert result["name"] is None
    assert result["latitude"] is None
    assert result["longitude"] is None
    assert result["country"] == "US"


def test_geometry_without_location():
    raw = {
        "name": "Weird Geometry",
        "formatted_address": "123 Main St, Detroit, MI 48202, USA",
        "geometry": {},
    }

    result = normalize_google_place(raw)

    assert result["latitude"] is None
    assert result["longitude"] is None