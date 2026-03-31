from typing import Any, Optional

from psycopg2.extras import Json

from app.db import get_conn


def upsert_trip_preferences(preferences: dict[str, Any]) -> dict[str, Any]:
    sql = """
        INSERT INTO planner.trip_preferences (
            trip_id,
            budget_level,
            group_size,
            has_kids,
            family_friendly_required,
            good_for_groups_required,
            good_for_kids_required,
            indoor_outdoor_preference,
            max_effort_level,
            preferred_categories,
            excluded_categories,
            raw_questionnaire
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (trip_id)
        DO UPDATE SET
            budget_level = EXCLUDED.budget_level,
            group_size = EXCLUDED.group_size,
            has_kids = EXCLUDED.has_kids,
            family_friendly_required = EXCLUDED.family_friendly_required,
            good_for_groups_required = EXCLUDED.good_for_groups_required,
            good_for_kids_required = EXCLUDED.good_for_kids_required,
            indoor_outdoor_preference = EXCLUDED.indoor_outdoor_preference,
            max_effort_level = EXCLUDED.max_effort_level,
            preferred_categories = EXCLUDED.preferred_categories,
            excluded_categories = EXCLUDED.excluded_categories,
            raw_questionnaire = EXCLUDED.raw_questionnaire,
            updated_at = NOW()
        RETURNING *;
    """
    values = (
        preferences["trip_id"],
        preferences.get("budget_level"),
        preferences.get("group_size"),
        preferences.get("has_kids"),
        preferences.get("family_friendly_required"),
        preferences.get("good_for_groups_required"),
        preferences.get("good_for_kids_required"),
        preferences.get("indoor_outdoor_preference"),
        preferences.get("max_effort_level"),
        preferences.get("preferred_categories"),
        preferences.get("excluded_categories"),
        Json(preferences.get("raw_questionnaire")) if preferences.get("raw_questionnaire") is not None else None,
    )

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, values)
            return cur.fetchone()


def get_trip_preferences_by_trip_id(trip_id: str) -> Optional[dict[str, Any]]:
    sql = """
        SELECT *
        FROM planner.trip_preferences
        WHERE trip_id = %s;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (trip_id,))
            return cur.fetchone()