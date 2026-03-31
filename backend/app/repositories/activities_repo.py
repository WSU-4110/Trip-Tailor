#activities_repo.py
from typing import Any, Optional
from app.db import get_conn

ACTIVITY_COLUMNS = [
    "title",
    "description",
    "activity_type",
    "category",
    "tags",
    "estimated_cost_cents",
    "duration_minutes",
    "effort_level",
    "accessibility_notes",
    "wheelchair_accessible",
    "family_friendly",
    "good_for_groups",
    "good_for_kids",
    "pet_friendly",
    "indoor_outdoor",
    "noise_level",
    "activity_level",
    "reservations_required",
    "ticket_required",
    "source",
    "source_url",
    "provider_source",
    "provider_category_types",
    "matched_primary_type",
    "rating",
    "review_count",
    "price_level",
    "business_status",
    "quality_score",
]


def list_activities(limit: int = 50, offset: int = 0) -> list[dict[str, Any]]:
    sql = """
        SELECT *
        FROM data.activities
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (limit, offset))
            return cur.fetchall()


def get_activity_by_id(activity_id: str) -> Optional[dict[str, Any]]:
    sql = """
        SELECT *
        FROM data.activities
        WHERE id = %s;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (activity_id,))
            return cur.fetchone()

def get_activity_by_place_id(place_id: str) -> Optional[dict[str, Any]]:
    sql = """
        SELECT *
        FROM data.activities
        WHERE place_id = %s
        LIMIT 1;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (place_id,))
            return cur.fetchone()


def upsert_activity_for_place(place_id: str, activity: dict[str, Any]) -> Optional[dict[str, Any]]:
    """
    One activity/enrichment row per canonical place.
    If a row already exists for the place, update it. Otherwise insert.
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id
                FROM data.activities
                WHERE place_id = %s
                LIMIT 1;
                """,
                (place_id,),
            )
            existing = cur.fetchone()

            if existing:
                sql = """
                    UPDATE data.activities
                    SET
                        title = COALESCE(%s, title),
                        description = COALESCE(%s, description),
                        activity_type = COALESCE(%s, activity_type),
                        category = COALESCE(%s, category),
                        tags = COALESCE(%s, tags),
                        estimated_cost_cents = COALESCE(%s, estimated_cost_cents),
                        duration_minutes = COALESCE(%s, duration_minutes),
                        effort_level = COALESCE(%s, effort_level),
                        accessibility_notes = COALESCE(%s, accessibility_notes),
                        wheelchair_accessible = COALESCE(%s, wheelchair_accessible),
                        family_friendly = COALESCE(%s, family_friendly),
                        good_for_groups = COALESCE(%s, good_for_groups),
                        good_for_kids = COALESCE(%s, good_for_kids),
                        pet_friendly = COALESCE(%s, pet_friendly),
                        indoor_outdoor = COALESCE(%s, indoor_outdoor),
                        noise_level = COALESCE(%s, noise_level),
                        activity_level = COALESCE(%s, activity_level),
                        reservations_required = COALESCE(%s, reservations_required),
                        ticket_required = COALESCE(%s, ticket_required),
                        source = COALESCE(%s, source),
                        source_url = COALESCE(%s, source_url),
                        provider_source = COALESCE(%s, provider_source),
                        provider_category_types = COALESCE(%s, provider_category_types),
                        matched_primary_type = COALESCE(%s, matched_primary_type),
                        rating = COALESCE(%s, rating),
                        review_count = COALESCE(%s, review_count),
                        price_level = COALESCE(%s, price_level),
                        business_status = COALESCE(%s, business_status),
                        quality_score = COALESCE(%s, quality_score),
                        updated_at = NOW()
                    WHERE place_id = %s
                    RETURNING *;
                """
                values = (
                    activity.get("title"),
                    activity.get("description"),
                    activity.get("activity_type"),
                    activity.get("category"),
                    activity.get("tags"),
                    activity.get("estimated_cost_cents"),
                    activity.get("duration_minutes"),
                    activity.get("effort_level"),
                    activity.get("accessibility_notes"),
                    activity.get("wheelchair_accessible"),
                    activity.get("family_friendly"),
                    activity.get("good_for_groups"),
                    activity.get("good_for_kids"),
                    activity.get("pet_friendly"),
                    activity.get("indoor_outdoor"),
                    activity.get("noise_level"),
                    activity.get("activity_level"),
                    activity.get("reservations_required"),
                    activity.get("ticket_required"),
                    activity.get("source"),
                    activity.get("source_url"),
                    activity.get("provider_source"),
                    activity.get("provider_category_types"),
                    activity.get("matched_primary_type"),
                    activity.get("rating"),
                    activity.get("review_count"),
                    activity.get("price_level"),
                    activity.get("business_status"),
                    activity.get("quality_score"),
                    place_id,
                )
                cur.execute(sql, values)
                return cur.fetchone()

            sql = """
                INSERT INTO data.activities (
                    place_id,
                    title,
                    description,
                    activity_type,
                    category,
                    tags,
                    estimated_cost_cents,
                    duration_minutes,
                    effort_level,
                    accessibility_notes,
                    wheelchair_accessible,
                    family_friendly,
                    good_for_groups,
                    good_for_kids,
                    pet_friendly,
                    indoor_outdoor,
                    noise_level,
                    activity_level,
                    reservations_required,
                    ticket_required,
                    source,
                    source_url,
                    provider_source,
                    provider_category_types,
                    matched_primary_type,
                    rating,
                    review_count,
                    price_level,
                    business_status,
                    quality_score
                )
                VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                RETURNING *;
            """
            values = (
                place_id,
                activity.get("title"),
                activity.get("description"),
                activity.get("activity_type"),
                activity.get("category"),
                activity.get("tags"),
                activity.get("estimated_cost_cents"),
                activity.get("duration_minutes"),
                activity.get("effort_level"),
                activity.get("accessibility_notes"),
                activity.get("wheelchair_accessible"),
                activity.get("family_friendly"),
                activity.get("good_for_groups"),
                activity.get("good_for_kids"),
                activity.get("pet_friendly"),
                activity.get("indoor_outdoor"),
                activity.get("noise_level"),
                activity.get("activity_level"),
                activity.get("reservations_required"),
                activity.get("ticket_required"),
                activity.get("source"),
                activity.get("source_url"),
                activity.get("provider_source"),
                activity.get("provider_category_types"),
                activity.get("matched_primary_type"),
                activity.get("rating"),
                activity.get("review_count"),
                activity.get("price_level"),
                activity.get("business_status"),
                activity.get("quality_score"),
            )
            cur.execute(sql, values)
            return cur.fetchone()