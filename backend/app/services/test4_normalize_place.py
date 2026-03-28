import pytest
from normalize_place import normalize_yelp_business


def test_full_valid_input():
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


def test_phone_fallback_to_phone_field():
    raw = {
        "name": "Phone Test",
        "id": "phone123",
        "phone": "+13131234567",
        "coordinates": {},
        "location": {},
    }

    result = normalize_yelp_business(raw)

    assert result["phone"] == "+13131234567"


def test_missing_coordinates():
    raw = {
        "name": "No Coords",
        "id": "noc123",
        "location": {
            "display_address": ["123 Main St"],
        },
    }

    result = normalize_yelp_business(raw)

    assert result["latitude"] is None
    assert result["longitude"] is None


def test_missing_location():
    raw = {
        "name": "No Location",
        "id": "noloc123",
        "coordinates": {"latitude": 1.0, "longitude": 2.0},
    }

    result = normalize_yelp_business(raw)

    assert result["address_line1"] is None
    assert result["city"] is None
    assert result["country"] == "US"  # fallback


def test_display_address_variants():
    raw = {
        "name": "Short Address",
        "id": "short123",
        "location": {
            "display_address": ["123 Main St"],
        },
    }

    result = normalize_yelp_business(raw)

    assert result["address_line1"] == "123 Main St"
    assert result["address_line2"] is None


def test_empty_input():
    result = normalize_yelp_business({})

    assert result["name"] is None
    assert result["latitude"] is None
    assert result["longitude"] is None
    assert result["country"] == "US"


def test_country_passthrough():
    raw = {
        "name": "Canada Biz",
        "id": "can123",
        "location": {
            "country": "CA",
        },
    }

    result = normalize_yelp_business(raw)

    assert result["country"] == "CA"