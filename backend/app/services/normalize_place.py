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
