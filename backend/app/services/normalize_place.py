#normalize_place.py
import re
from typing import Optional

_USA_TOKENS = {"usa", "united states", "united states of america", "us"}


def _country_to_iso(country_str: Optional[str]) -> Optional[str]:
    if not country_str:
        return None
    c = country_str.strip().lower()
    if c in _USA_TOKENS:
        return "US"
    return country_str.strip().upper()


def _parse_us_formatted_address(formatted: Optional[str]) -> dict:
    """
    Best-effort parse for formatted_address like:
    "5200 Woodward Ave, Detroit, MI 48202, USA"
    """
    if not formatted:
        return {"address_line1": None, "city": None, "region": None, "postal_code": None, "country": None}

    parts = [p.strip() for p in formatted.split(",") if p.strip()]
    address_line1 = parts[0] if len(parts) >= 1 else None

    city = None
    region = None
    postal_code = None
    country = None

    if len(parts) >= 2:
        country = _country_to_iso(parts[-1])

    if len(parts) >= 3:
        state_zip = parts[-2]
        m = re.match(r"^([A-Z]{2})(?:\s+(\d{5}(?:-\d{4})?))?$", state_zip)
        if m:
            region = m.group(1)
            postal_code = m.group(2)

    if len(parts) >= 4:
        city = parts[-3]

    return {
        "address_line1": address_line1,
        "city": city,
        "region": region,
        "postal_code": postal_code,
        "country": country or "US",
    }


def normalize_google_place(raw: dict) -> dict:
    loc = (raw.get("geometry") or {}).get("location") or {}
    formatted = raw.get("formatted_address")
    parsed = _parse_us_formatted_address(formatted)

    return {
        "name": raw.get("name"),
        "address_line1": parsed.get("address_line1"),
        "address_line2": None,
        "city": parsed.get("city"),
        "region": parsed.get("region"),
        "postal_code": parsed.get("postal_code"),
        "country": parsed.get("country") or "US",
        "latitude": loc.get("lat"),
        "longitude": loc.get("lng"),
        "phone": None,
        "website_url": None,
        "google_maps_url": None,
        "google_place_id": raw.get("place_id"),
        "yelp_business_id": None,
    }

def normalize_yelp_business(raw: dict) -> dict:
    """
    Normalize Yelp Fusion 'business' object to our canonical place dict.
    """
    coords = raw.get("coordinates") or {}
    location = raw.get("location") or {}

    # Yelp gives display_address as a list like:
    # ["123 Main St", "Detroit, MI 48202"]
    display_address = location.get("display_address") or []
    address_line1 = display_address[0] if len(display_address) >= 1 else None
    address_line2 = display_address[1] if len(display_address) >= 2 else None

    return {
        "name": raw.get("name"),
        "address_line1": address_line1,
        "address_line2": address_line2,
        "city": location.get("city"),
        "region": location.get("state"),
        "postal_code": location.get("zip_code"),
        "country": (location.get("country") or "US"),
        "latitude": coords.get("latitude"),
        "longitude": coords.get("longitude"),
        "phone": raw.get("display_phone") or raw.get("phone"),
        "website_url": raw.get("url"),  # Yelp business URL (not their website, but useful)
        "google_maps_url": None,
        "google_place_id": None,
        "yelp_business_id": raw.get("id"),
    }
