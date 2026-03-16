#places_repo.py
from typing import Any, Optional
from app.db import get_conn
import psycopg2


PLACE_COLUMNS = [
    "name",
    "address_line1",
    "address_line2",
    "city",
    "region",
    "postal_code",
    "country",
    "latitude",
    "longitude",
    "phone",
    "website_url",
    "google_maps_url",
    "google_place_id",
    "yelp_business_id",
]

def list_places(limit: int = 50, offset: int = 0) -> list[dict[str, Any]]:
    sql = """
        SELECT
            id, name, address_line1, address_line2, city, region,
            postal_code, country, latitude, longitude,
            phone, website_url, google_maps_url, created_at, updated_at, 
            google_place_id, yelp_business_id
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
            phone, website_url, google_maps_url, created_at, updated_at,
            google_place_id, yelp_business_id
        FROM data.places
        WHERE id = %s;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (place_id,))
            return cur.fetchone()

def _find_existing_place(cur, place:dict[str, Any]) -> Optional[dict[str, Any]]:
    if place.get("google_place_id"):
        cur.execute(
            """
            SELECT *
            FROM data.places
            WHERE google_place_id = %s
            LIMIT 1;
            """,
            (place["google_place_id"],),
        )
        row = cur.fetchone()
        if row:
            return row

    if place.get("yelp_business_id"):
        cur.execute(
            """
            SELECT *
            FROM data.places
            WHERE yelp_business_id = %s
            LIMIT 1;
            """,
            (place["yelp_business_id"],),
        )
    
        row = cur.fetchone()
        if row:
            return row
        
    if place.get("name") and place.get("city") and place.get("region") and place.get("country"):
        cur.execute(
            """
            SELECT *
            FROM data.places
            WHERE name = %s
              AND city = %s
              AND region = %s
              AND country = %s
            LIMIT 1;
            """,
            (
                place["name"],
                place["city"],
                place["region"],
                place["country"],
            ),
        )
        row = cur.fetchone()
        if row:
            return row

    return None

def upsert_place(place: dict[str, Any]) -> Optional[dict[str, Any]]:
    """
    Upserts data into rows for each provider
    Matches in this order: google_place_id, yelp_business_id, (name, city, region, county)
    Keeps the canonical data.places solely for information about each location
    """
    if not place.get("name"):
        return None

    with get_conn() as conn:
        with conn.cursor() as cur:
            existing = _find_existing_place(cur, place)

            if existing:
                sql = """
                    UPDATE data.places
                    SET
                        name = COALESCE(%s, name),
                        address_line1 = COALESCE(%s, address_line1),
                        address_line2 = COALESCE(%s, address_line2),
                        city = COALESCE(%s, city),
                        region = COALESCE(%s, region),
                        postal_code = COALESCE(%s, postal_code),
                        country = COALESCE(%s, country),
                        latitude = COALESCE(%s, latitude),
                        longitude = COALESCE(%s, longitude),
                        phone = COALESCE(%s, phone),
                        website_url = COALESCE(%s, website_url),
                        google_maps_url = COALESCE(%s, google_maps_url),
                        google_place_id = COALESCE(google_place_id, %s),
                        yelp_business_id = COALESCE(yelp_business_id, %s),
                        updated_at = NOW()
                    WHERE id = %s
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
                    existing["id"],
                )
                cur.execute(sql, values)
                return cur.fetchone()

            sql = """
                INSERT INTO data.places (
                    name, address_line1, address_line2, city, region, postal_code, country,
                    latitude, longitude, phone, website_url, google_maps_url,
                    google_place_id, yelp_business_id
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
            cur.execute(sql, values)
            return cur.fetchone()