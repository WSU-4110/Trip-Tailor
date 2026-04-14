from typing import Any, Optional

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
            notes,
            custom_name,
            custom_address
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *;
    """
    values = (
        item["trip_id"],
        item["day_number"],
        item["item_order"],
        item.get("scheduled_date"),
        item.get("place_id"),
        item.get("activity_id"),
        item.get("locked_by_user", False),
        item.get("source_type", "generated"),
        item.get("selection_reason"),
        item.get("item_status", "active"),
        item.get("notes"),
        item.get("custom_name"),
        item.get("custom_address"),
    )

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, values)
            return cur.fetchone()


def get_trip_itinerary_items(trip_id: str) -> list[dict[str, Any]]:
    sql = """
        SELECT
            tii.*,
            COALESCE(p.name, tii.custom_name) AS place_name,
            p.city,
            p.region,
            COALESCE(p.address_line1, tii.custom_address) AS address_line1,
            p.latitude,
            p.longitude,
            p.website_url,
            p.google_maps_url,
            p.phone,
            a.title AS activity_title,
            a.category,
            a.activity_type,
            a.description,
            a.tags,
            a.rating,
            a.review_count,
            a.estimated_cost_cents,
            a.duration_minutes,
            a.effort_level,
            a.indoor_outdoor,
            a.family_friendly,
            a.good_for_kids,
            a.good_for_groups,
            a.pet_friendly,
            a.wheelchair_accessible,
            a.reservations_required,
            a.ticket_required,
            a.noise_level,
            a.price_level,
            a.source_url
        FROM planner.trip_itinerary_items tii
        LEFT JOIN data.places p
            ON p.id = tii.place_id
        LEFT JOIN data.activities a
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

def delete_trip_itinerary_item(item_id: str, trip_id: str) -> bool:
    # Delete a single item. Returns True if a row was deleted.
    sql = """
        DELETE FROM planner.trip_itinerary_items
        WHERE id = %s AND trip_id = %s;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (item_id, trip_id))
            return cur.rowcount > 0


def update_trip_itinerary_item(item_id: str, trip_id: str, updates: dict[str, Any]) -> Optional[dict[str, Any]]:
    #Update notes and/or custom_name/custom_address on an item.
    sql = """
        UPDATE planner.trip_itinerary_items
        SET
            notes = COALESCE(%s, notes),
            custom_name = COALESCE(%s, custom_name),
            custom_address = COALESCE(%s, custom_address),
            day_number = COALESCE(%s, day_number),
            updated_at = NOW()
        WHERE id = %s AND trip_id = %s
        RETURNING *;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (
                updates.get("notes"),
                updates.get("custom_name"),
                updates.get("custom_address"),
                updates.get("day_number"),
                item_id,
                trip_id,
            ))
            return cur.fetchone()


def reorder_day_items(trip_id: str, day_number: int, ordered_item_ids: list[str]) -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute('SET CONSTRAINTS "planner"."uq_trip_day_order" DEFERRED;')
            for idx, item_id in enumerate(ordered_item_ids):
                cur.execute(
                    """
                    UPDATE planner.trip_itinerary_items
                    SET item_order = %s, day_number = %s, updated_at = NOW()
                    WHERE id = %s AND trip_id = %s;
                    """,
                    (idx + 1, day_number, item_id, trip_id),
                )
        conn.commit()

def reorder_multiple_days(trip_id: str, days: list[dict]) -> None:
    """
    Reorder items across multiple days in a single transaction.
    days format: [{"day_number": 1, "ordered_item_ids": [...]}, ...]
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute('SET CONSTRAINTS "planner"."uq_trip_day_order" DEFERRED;')
            for day in days:
                day_number = day["day_number"]
                ordered_item_ids = day["ordered_item_ids"]
                for idx, item_id in enumerate(ordered_item_ids):
                    cur.execute(
                        """
                        UPDATE planner.trip_itinerary_items
                        SET item_order = %s, day_number = %s, updated_at = NOW()
                        WHERE id = %s AND trip_id = %s;
                        """,
                        (idx + 1, day_number, item_id, trip_id),
                    )
        conn.commit()