import os
import sys
from datetime import date

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from dotenv import load_dotenv
load_dotenv()

from app.db import get_conn
from app.repositories.trips_repo import create_trip, get_full_trip
from app.repositories.trip_preferences_repo import upsert_trip_preferences
from app.repositories.trip_itinerary_repo import insert_trip_itinerary_item


def get_sample_activity_pair() -> dict:
    sql = """
        SELECT
            p.id AS place_id,
            a.id AS activity_id
        FROM data.places p
        JOIN data.activities a
            ON a.place_id = p.id
        LIMIT 1;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            row = cur.fetchone()
            if not row:
                raise RuntimeError("No sample place/activity found in DB.")
            return row


def main():
    pair = get_sample_activity_pair()

    trip = create_trip({
        "user_id": None,
        "title": "Detroit Weekend Test Trip",
        "destination_city": "Detroit",
        "destination_region": "MI",
        "destination_country": "US",
        "start_date": date(2026, 3, 20),
        "end_date": date(2026, 3, 22),
        "trip_days": 3,
        "status": "generated",
    })

    upsert_trip_preferences({
        "trip_id": trip["id"],
        "budget_level": "medium",
        "group_size": 2,
        "has_kids": False,
        "family_friendly_required": False,
        "good_for_groups_required": True,
        "good_for_kids_required": False,
        "indoor_outdoor_preference": "either",
        "max_effort_level": 3,
        "preferred_categories": ["museum", "park"],
        "excluded_categories": ["bar"],
        "raw_questionnaire": {
            "budget_level": "medium",
            "group_size": 2,
            "has_kids": False,
            "preferred_categories": ["museum", "park"],
        },
    })

    insert_trip_itinerary_item({
        "trip_id": trip["id"],
        "day_number": 1,
        "item_order": 1,
        "scheduled_date": date(2026, 3, 20),
        "place_id": pair["place_id"],
        "activity_id": pair["activity_id"],
        "source_type": "generated",
        "selection_reason": "Matched preferred category and effort level",
    })

    full_trip = get_full_trip(trip["id"])
    print(full_trip)


if __name__ == "__main__":
    main()