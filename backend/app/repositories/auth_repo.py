from typing import Any, Optional
from app.db import get_conn


def get_user_by_email(email: str) -> Optional[dict[str, Any]]:
    sql = """
        SELECT
            id,
            email,
            password_hash,
            created_at
        FROM auth.users
        WHERE email = %s;
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (email,))
            return cur.fetchone()


def create_user(email: str, password_hash: str) -> Optional[dict[str, Any]]:
    sql = """
        INSERT INTO auth.users (email, password_hash)
        VALUES (%s, %s)
        RETURNING id, email, created_at;
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (email, password_hash))
            user = cur.fetchone()
            conn.commit()
            return user