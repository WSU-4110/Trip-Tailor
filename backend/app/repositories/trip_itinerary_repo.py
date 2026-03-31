from typing import Any

from app.db import get_conn


def insert_trip_itinerary_item(item: dict[str, Any]) -> dict[str, Any]:
    sql = """
        INSERT INTO planner.trip_itinerary_items (
            trip_id,
            day_number,
            item_order,
            scheduled_date,
            place_id,
            activity_id,
            locked_by_user,
            source_type,
            selection_reason,
            item_status,
            notes
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *;
    """
    values = (
        item["trip_id"],
        item["day_number"],
        item["item_order"],
        item.get("scheduled_date"),
        item["place_id"],
        item["activity_id"],
        item.get("locked_by_user", False),
        item.get("source_type", "generated"),
        item.get("selection_reason"),
        item.get("item_status", "active"),
        item.get("notes"),
    )

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, values)
            return cur.fetchone()


def get_trip_itinerary_items(trip_id: str) -> list[dict[str, Any]]:
    sql = """
        SELECT
            tii.*,
            p.name AS place_name,
            p.city,
            p.region,
            a.title AS activity_title,
            a.category,
            a.activity_type,
            a.rating,
            a.estimated_cost_cents,
            a.duration_minutes
        FROM planner.trip_itinerary_items tii
        JOIN data.places p
            ON p.id = tii.place_id
        JOIN data.activities a
            ON a.id = tii.activity_id
        WHERE tii.trip_id = %s
        ORDER BY tii.day_number, tii.item_order;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (trip_id,))
            return cur.fetchall()


def delete_trip_itinerary_items(trip_id: str) -> None:
    sql = """
        DELETE FROM planner.trip_itinerary_items
        WHERE trip_id = %s;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (trip_id,))