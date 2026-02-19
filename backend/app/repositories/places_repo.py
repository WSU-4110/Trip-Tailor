from typing import Any, Optional
from app.db import get_conn
import psycopg2


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
    Upsert a place using google_place_id when available.
    Falls back to identity (name, city, region, country) to avoid ux_places_identity collisions
    (e.g., seeded test data without google_place_id).
    """
    if not place.get("name"):
        return None

    with get_conn() as conn:
        with conn.cursor() as cur:
            # 1) Try upsert by google_place_id when present
            if place.get("google_place_id"):
                sql_google = """
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

                try:
                    cur.execute(sql_google, values)
                    return cur.fetchone()
                except psycopg2.errors.UniqueViolation:
                    # Identity constraint hit (seed row exists). Roll back and fall through.
                    conn.rollback()

            # 2) Fallback: upsert by identity (name, city, region, country)
            sql_identity = """
                INSERT INTO data.places (
                    name, address_line1, address_line2, city, region, postal_code, country,
                    latitude, longitude, phone, website_url, google_maps_url,
                    google_place_id, yelp_business_id
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (name, city, region, country)
                DO UPDATE SET
                    address_line1 = COALESCE(EXCLUDED.address_line1, data.places.address_line1),
                    address_line2 = COALESCE(EXCLUDED.address_line2, data.places.address_line2),
                    postal_code = COALESCE(EXCLUDED.postal_code, data.places.postal_code),
                    latitude = COALESCE(EXCLUDED.latitude, data.places.latitude),
                    longitude = COALESCE(EXCLUDED.longitude, data.places.longitude),
                    phone = COALESCE(EXCLUDED.phone, data.places.phone),
                    website_url = COALESCE(EXCLUDED.website_url, data.places.website_url),
                    google_maps_url = COALESCE(EXCLUDED.google_maps_url, data.places.google_maps_url),

                    -- IMPORTANT: fill provider IDs if missing
                    google_place_id = COALESCE(data.places.google_place_id, EXCLUDED.google_place_id),
                    yelp_business_id = COALESCE(data.places.yelp_business_id, EXCLUDED.yelp_business_id),

                    name = EXCLUDED.name,
                    city = COALESCE(EXCLUDED.city, data.places.city),
                    region = COALESCE(EXCLUDED.region, data.places.region),
                    country = COALESCE(EXCLUDED.country, data.places.country),
                    updated_at = NOW()
                RETURNING *;
            """

            values2 = (
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

            cur.execute(sql_identity, values2)
            return cur.fetchone()

