from typing import Any, Optional
from app.db import get_conn


def list_places(limit: int = 50, offset: int = 0) -> list[dict[str, Any]]:
    sql = """
        SELECT
            id, name, address_line1, address_line2, city, region,
            postal_code, country, latitude, longitude,
            phone, website_url, google_maps_url, created_at, updated_at
        FROM triptailor.places
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (limit, offset))
            return cur.fetchall()


def get_place_by_id(place_id: str) -> Optional[dict[str, Any]]:
    sql = """
        SELECT
            id, name, address_line1, address_line2, city, region,
            postal_code, country, latitude, longitude,
            phone, website_url, google_maps_url, created_at, updated_at
        FROM triptailor.places
        WHERE id = %s;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (place_id,))
            return cur.fetchone()


def upsert_place_by_google_id(place: dict[str, Any]) -> Optional[dict[str, Any]]:
    """
    Upsert a place using google_place_id as the unique identity.
    Requires at least: name + google_place_id.
    """
    if not place.get("name") or not place.get("google_place_id"):
        return None

    sql = """
        INSERT INTO triptailor.places (
            name, address_line1, address_line2, city, region, postal_code, country,
            latitude, longitude, phone, website_url, google_maps_url,
            google_place_id, yelp_business_id
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (google_place_id)
        DO UPDATE SET
            name = EXCLUDED.name,
            address_line1 = COALESCE(EXCLUDED.address_line1, triptailor.places.address_line1),
            address_line2 = COALESCE(EXCLUDED.address_line2, triptailor.places.address_line2),
            city = COALESCE(EXCLUDED.city, triptailor.places.city),
            region = COALESCE(EXCLUDED.region, triptailor.places.region),
            postal_code = COALESCE(EXCLUDED.postal_code, triptailor.places.postal_code),
            country = COALESCE(EXCLUDED.country, triptailor.places.country),
            latitude = COALESCE(EXCLUDED.latitude, triptailor.places.latitude),
            longitude = COALESCE(EXCLUDED.longitude, triptailor.places.longitude),
            phone = COALESCE(EXCLUDED.phone, triptailor.places.phone),
            website_url = COALESCE(EXCLUDED.website_url, triptailor.places.website_url),
            google_maps_url = COALESCE(EXCLUDED.google_maps_url, triptailor.places.google_maps_url),
            yelp_business_id = COALESCE(EXCLUDED.yelp_business_id, triptailor.places.yelp_business_id),
            updated_at = NOW()
        RETURNING *;
    """

    values = (
        place.get("name"),
        place.get("address_line1"),
        place.get("address_line2"),
        place.get("city"),
        place.get("region"),
        place.get("postal_code"),
        place.get("country"),
        place.get("latitude"),
        place.get("longitude"),
        place.get("phone"),
        place.get("website_url"),
        place.get("google_maps_url"),
        place.get("google_place_id"),
        place.get("yelp_business_id"),
    )

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, values)
            return cur.fetchone()
