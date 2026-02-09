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
