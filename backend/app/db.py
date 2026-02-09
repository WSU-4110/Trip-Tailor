import os
import psycopg2
from psycopg2.extras import RealDictCursor


def get_conn():
    """
    Returns a new Postgres connection.
    Uses DATABASE_URL if present, otherwise falls back to individual env vars.
    """
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        return psycopg2.connect(db_url, cursor_factory=RealDictCursor)

    return psycopg2.connect(
        host=os.getenv("PGHOST", "localhost"),
        port=int(os.getenv("PGPORT", "5432")),
        dbname=os.getenv("PGDATABASE", "triptailor_dev"),
        user=os.getenv("PGUSER", os.getenv("USER")),
        password=os.getenv("PGPASSWORD", ""),
        cursor_factory=RealDictCursor,
    )
