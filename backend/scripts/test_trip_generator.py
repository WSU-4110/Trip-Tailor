import os
import sys
from datetime import date
from pprint import pprint

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from dotenv import load_dotenv
load_dotenv()

from app.services.trip_generator import generate_trip_from_preferences


def main():
    payload = {
        "user_id": None,
        "title": "Detroit Culture Weekend",
        "destination_city": "Detroit",
        "destination_region": "MI",
        "destination_country": "US",
        "start_date": date(2026, 3, 21),
        "end_date": date(2026, 3, 23),
        "budget_level": "medium",
        "group_size": 2,
        "has_kids": False,
        "family_friendly_required": False,
        "good_for_groups_required": True,
        "good_for_kids_required": False,
        "indoor_outdoor_preference": "either",
        "max_effort_level": 3,
        "preferred_categories": ["museum", "park", "entertainment"],
        "excluded_categories": ["bar"],
        "activities_per_day": 3,
    }

    result = generate_trip_from_preferences(payload)

    print("\n=== SAVED TRIP ===")
    pprint(result["trip"])

    print("\n=== PREFERENCES ===")
    pprint(result["preferences"])

    print("\n=== ITINERARY ITEMS ===")
    pprint(result["itinerary_items"][:5])

    print("\n=== TOP RANKED RESULTS ===")
    pprint([
        {
            "place_name": r["place_name"],
            "category": r["category"],
            "activity_type": r["activity_type"],
            "rating": r["rating"],
            "score": r["recommendation_score"],
        }
        for r in result["ranked_results"][:10]
    ])


if __name__ == "__main__":
    main()