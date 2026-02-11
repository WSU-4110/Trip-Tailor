from app import create_app
from app.db import get_conn

app = create_app()

def assert_db():
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1;")
            cur.fetchone()

if __name__ == "__main__":
    assert_db()
    print("DB ok (psycopg2).")
    app.run(debug=True)
