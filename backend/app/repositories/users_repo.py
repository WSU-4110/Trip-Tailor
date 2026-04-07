from typing import Any, Optional
from werkzeug.security import generate_password_hash, check_password_hash
from app.db import get_conn


def create_user(name: str, email: str, password: str) -> Optional[dict[str, Any]]:
    """
    Insert a new user. Returns the created row (id, name, email, created_at)
    or None if the email is already taken.
    """
    sql = """
        INSERT INTO triptailor.users (name, email, password_hash)
        VALUES (%s, %s, %s)
        RETURNING id, name, email, created_at;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            try:
                cur.execute(sql, (name.strip(), email.lower().strip(), generate_password_hash(password)))
                conn.commit()
                return dict(cur.fetchone())
            except Exception:
                conn.rollback()
                return None


def get_user_by_email(email: str) -> Optional[dict[str, Any]]:
    """Fetch user row including password_hash for verification."""
    sql = """
        SELECT id, name, email, password_hash
        FROM triptailor.users
        WHERE email = %s;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (email.lower().strip(),))
            row = cur.fetchone()
            return dict(row) if row else None


def get_user_by_id(user_id: str) -> Optional[dict[str, Any]]:
    """Fetch public user fields by ID (no password_hash)."""
    sql = """
        SELECT id, name, email, created_at
        FROM triptailor.users
        WHERE id = %s;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (user_id,))
            row = cur.fetchone()
            return dict(row) if row else None


def verify_password(user: dict[str, Any], password: str) -> bool:
    """Check a plain password against the stored hash."""
    return check_password_hash(user["password_hash"], password)
