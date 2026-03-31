from typing import Any, Optional

from app.db import get_conn

from app.repositories.trip_preferences_repo import get_trip_preferences_by_trip_id
from app.repositories.trip_itinerary_repo import get_trip_itinerary_items


def create_trip(trip: dict[str, Any]) -> dict[str, Any]:
    sql = """
        INSERT INTO planner.trips (
            user_id,
            title,
            destination_city,
            destination_region,
            destination_country,
            start_date,
            end_date,
            trip_days,
            status
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *;
    """
    values = (
        trip.get("user_id"),
        trip["title"],
        trip["destination_city"],
        trip.get("destination_region"),
        trip.get("destination_country", "US"),
        trip["start_date"],
        trip["end_date"],
        trip["trip_days"],
        trip.get("status", "draft"),
    )

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, values)
            return cur.fetchone()


def get_trip_by_id(trip_id: str) -> Optional[dict[str, Any]]:
    sql = """
        SELECT *
        FROM planner.trips
        WHERE id = %s;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (trip_id,))
            return cur.fetchone()


def list_trips(limit: int = 50, offset: int = 0) -> list[dict[str, Any]]:
    sql = """
        SELECT *
        FROM planner.trips
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (limit, offset))
            return cur.fetchall()


def list_trips_by_user(user_id: str, limit: int = 50, offset: int = 0) -> list[dict[str, Any]]:
    sql = """
        SELECT *
        FROM planner.trips
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (user_id, limit, offset))
            return cur.fetchall()


def update_trip_status(trip_id: str, status: str) -> Optional[dict[str, Any]]:
    sql = """
        UPDATE planner.trips
        SET status = %s,
            updated_at = NOW()
        WHERE id = %s
        RETURNING *;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (status, trip_id))
            return cur.fetchone()
        
def get_full_trip(trip_id: str) -> Optional[dict[str, Any]]:
    trip = get_trip_by_id(trip_id)
    if not trip:
        return None

    preferences = get_trip_preferences_by_trip_id(trip_id)
    itinerary_items = get_trip_itinerary_items(trip_id)

    return {
        "trip": trip,
        "preferences": preferences,
        "itinerary_items": itinerary_items,
    }