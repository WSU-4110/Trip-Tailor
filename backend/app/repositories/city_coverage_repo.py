from typing import Any, Optional
from app.db import get_conn

def get_city_coverage(city: str, region: Optional[str], country: str = "US") -> Optional[dict]:
    sql = """
        SELECT * FROM data.city_coverage
        WHERE LOWER(city) = LOWER(%s)
          AND (%s IS NULL OR UPPER(region) = UPPER(%s))
          AND UPPER(country) = UPPER(%s)
        LIMIT 1;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (city, region, region, country))
            return cur.fetchone()

def mark_city_seeded(city: str, region: Optional[str], country: str = "US", place_count: int = 0) -> None:
    sql = """
        INSERT INTO data.city_coverage (city, region, country, last_seeded_at, place_count, is_seeded)
        VALUES (%s, %s, %s, NOW(), %s, TRUE)
        ON CONFLICT (city, region, country)
        DO UPDATE SET
            last_seeded_at = NOW(),
            place_count = EXCLUDED.place_count,
            is_seeded = TRUE,
            updated_at = NOW();
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (city, region, country, place_count))