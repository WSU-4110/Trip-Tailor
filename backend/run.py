from app import create_app
from app.db import get_conn
from dotenv import load_dotenv

from app.routes.trip_routes import trip_bp

load_dotenv()


app = create_app()

app.register_blueprint(trip_bp)

def assert_db():
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1;")
            cur.fetchone()

if __name__ == "__main__":
    assert_db()
    print("DB ok (psycopg2).")
    app.run(debug=True, port=5050)
