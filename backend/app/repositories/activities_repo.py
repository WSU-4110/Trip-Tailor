from typing import Any, Optional
from app.db import get_conn


def list_activities(limit: int = 50, offset: int = 0) -> list[dict[str, Any]]:
    sql = """
        SELECT
            id, place_id, title, description, activity_type, category, tags,
            estimated_cost_cents, duration_minutes, effort_level,
            accessibility_notes, wheelchair_accessible, family_friendly,
            source, source_url, created_at, updated_at
        FROM triptailor.activities
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (limit, offset))
            return cur.fetchall()


def get_activity_by_id(activity_id: str) -> Optional[dict[str, Any]]:
    sql = """
        SELECT
            id, place_id, title, description, activity_type, category, tags,
            estimated_cost_cents, duration_minutes, effort_level,
            accessibility_notes, wheelchair_accessible, family_friendly,
            source, source_url, created_at, updated_at
        FROM triptailor.activities
        WHERE id = %s;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (activity_id,))
            return cur.fetchone()
