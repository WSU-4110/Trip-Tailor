from typing import Any, Optional
from app.db import get_conn


def list_places(limit: int = 50, offset: int = 0) -> list[dict[str, Any]]:
    sql = """
        SELECT
            id, name, address_line1, address_line2, city, region,
            postal_code, country, latitude, longitude,
            phone, website_url, google_maps_url, created_at, updated_at
        FROM data.places
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
        FROM data.places
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
        INSERT INTO data.places (
            name, address_line1, address_line2, city, region, postal_code, country,
            latitude, longitude, phone, website_url, google_maps_url,
            google_place_id, yelp_business_id
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (google_place_id)
        DO UPDATE SET
            name = EXCLUDED.name,
            address_line1 = COALESCE(EXCLUDED.address_line1, data.places.address_line1),
            address_line2 = COALESCE(EXCLUDED.address_line2, data.places.address_line2),
            city = COALESCE(EXCLUDED.city, data.places.city),
            region = COALESCE(EXCLUDED.region, data.places.region),
            postal_code = COALESCE(EXCLUDED.postal_code, data.places.postal_code),
            country = COALESCE(EXCLUDED.country, data.places.country),
            latitude = COALESCE(EXCLUDED.latitude, data.places.latitude),
            longitude = COALESCE(EXCLUDED.longitude, data.places.longitude),
            phone = COALESCE(EXCLUDED.phone, data.places.phone),
            website_url = COALESCE(EXCLUDED.website_url, data.places.website_url),
            google_maps_url = COALESCE(EXCLUDED.google_maps_url, data.places.google_maps_url),
            yelp_business_id = COALESCE(EXCLUDED.yelp_business_id, data.places.yelp_business_id),
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
