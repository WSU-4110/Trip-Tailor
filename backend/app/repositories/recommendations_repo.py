from typing import Any

from app.db import get_conn

# Fetches all candidate places/activities for a destination city, filtering/scoring happens in Python service layer.
def get_candidate_activities_for_city(city: str, region: str | None = None, ) -> list[dict[str, Any]]:
   
    sql = """
        SELECT
            p.id AS place_id,
            p.name AS place_name,
            p.city,
            p.region,
            p.country,
            p.latitude,
            p.longitude,

            a.id AS activity_id,
            a.title,
            a.description,
            a.activity_type,
            a.category,
            a.tags,
            a.estimated_cost_cents,
            a.duration_minutes,
            a.effort_level,
            a.accessibility_notes,
            a.wheelchair_accessible,
            a.family_friendly,
            a.good_for_groups,
            a.good_for_kids,
            a.pet_friendly,
            a.indoor_outdoor,
            a.noise_level,
            a.activity_level,
            a.reservations_required,
            a.ticket_required,
            a.source,
            a.source_url,
            a.provider_source,
            a.provider_category_types,
            a.matched_primary_type,
            a.rating,
            a.review_count,
            a.price_level,
            a.business_status,
            a.quality_score
        FROM data.places p
        JOIN data.activities a
            ON a.place_id = p.id
        WHERE LOWER(p.city) = LOWER(%s)
          AND (%s IS NULL OR UPPER(p.region) = UPPER(%s))
          AND COALESCE(a.business_status, 'OPEN') != 'CLOSED'
        ORDER BY COALESCE(a.quality_score, a.rating, 0) DESC, p.name;
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (city, region, region))
            return cur.fetchall()

def get_alternate_candidates(
    city: str,
    region: str | None,
    exclude_place_ids: list[str],
    limit: int = 3,
) -> list[dict[str, Any]]:
    """
    Returns top candidates for a city, excluding places already in the itinerary.
    Used for the swap/alternate suggestions feature.
    """
    sql = """
        SELECT
            p.id AS place_id,
            p.name AS place_name,
            p.city,
            p.region,
            p.latitude,
            p.longitude,
            a.id AS activity_id,
            a.title,
            a.category,
            a.activity_type,
            a.description,
            a.tags,
            a.estimated_cost_cents,
            a.duration_minutes,
            a.effort_level,
            a.rating,
            a.review_count,
            a.indoor_outdoor,
            a.family_friendly,
            a.good_for_groups,
            a.good_for_kids,
            a.ticket_required,
            a.reservations_required,
            a.wheelchair_accessible,
            a.noise_level,
            a.quality_score,
            a.source_url
        FROM data.places p
        JOIN data.activities a
            ON a.place_id = p.id
        WHERE LOWER(p.city) = LOWER(%s)
          AND (%s IS NULL OR UPPER(p.region) = UPPER(%s))
          AND COALESCE(a.business_status, 'OPEN') != 'CLOSED'
          AND p.id != ALL(%s::uuid[])
        ORDER BY COALESCE(a.quality_score, a.rating, 0) DESC
        LIMIT %s;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (city, region, region, exclude_place_ids, limit))
            return cur.fetchall()