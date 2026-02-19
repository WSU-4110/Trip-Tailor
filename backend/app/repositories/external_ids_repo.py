from typing import Any, Optional
from psycopg2.extras import Json
from app.db import get_conn

def upsert_place_external_id(
    *,
    place_id: str,
    source: str,
    external_id: str,
    source_url: Optional[str] = None,
    raw_payload: Optional[dict[str, Any]] = None,
) -> None:
    """
    Store/refresh the mapping from (source, external_id) -> place_id,
    and keep the latest raw_payload for inspection.
    """
    sql = """
        INSERT INTO data.place_external_ids
            (place_id, source, external_id, source_url, raw_payload)
        VALUES
            (%s, %s, %s, %s, %s)
        ON CONFLICT (source, external_id)
        DO UPDATE SET
            place_id = EXCLUDED.place_id,
            source_url = COALESCE(EXCLUDED.source_url, data.place_external_ids.source_url),
            raw_payload = COALESCE(EXCLUDED.raw_payload, data.place_external_ids.raw_payload),
            fetched_at = NOW();
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (place_id, source, external_id, source_url, Json(raw_payload) if raw_payload else None))
