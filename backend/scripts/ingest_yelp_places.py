# ingest_yelp_places.py
import os
import sys
import time
import argparse

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from dotenv import load_dotenv
load_dotenv()

from app.clients.yelp_client import YelpClient
from app.services.place_variables import build_place_variables
from app.repositories.places_repo import upsert_place
from app.repositories.activities_repo import upsert_activity_for_place
from app.repositories.external_ids_repo import upsert_place_external_id


def main():
    parser = argparse.ArgumentParser(
        description="Ingest places from Yelp into Postgres."
    )
    parser.add_argument("term", help='Search term, e.g. "museums"')
    parser.add_argument("--latitude", type=float, required=True)
    parser.add_argument("--longitude", type=float, required=True)
    parser.add_argument("--radius-meters", type=int, default=5000)
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--categories", type=str, default=None)
    parser.add_argument("--open-now", action="store_true")
    parser.add_argument(
        "--sleep",
        type=float,
        default=float(os.getenv("INGEST_RATE_LIMIT_SLEEP_SECONDS", "0.2")),
    )

    args = parser.parse_args()

    client = YelpClient()
    raw_response = client.search_businesses(
        term=args.term,
        latitude=args.latitude,
        longitude=args.longitude,
        radius_meters=args.radius_meters,
        categories=args.categories,
        limit=args.limit,
        open_now=True if args.open_now else None,
    )

    businesses = raw_response.get("businesses") or []

    upserted_places = 0
    upserted_activities = 0
    skipped = 0

    for business in businesses:
        variables = build_place_variables(business, provider="yelp")

        saved_place = upsert_place(variables)
        if not saved_place:
            skipped += 1
            continue

        upserted_places += 1

        saved_activity = upsert_activity_for_place(saved_place["id"], variables)
        if saved_activity:
            upserted_activities += 1

        upsert_place_external_id(
            place_id=saved_place["id"],
            source="yelp",
            external_id=variables.get("yelp_business_id"),
            source_url=variables.get("source_url"),
            raw_payload=business,
        )

        print(
            f"Upserted Yelp place/activity: {saved_place['name']} "
            f"| city={saved_place.get('city')} region={saved_place.get('region')} "
            f"| yelp_business_id={saved_place.get('yelp_business_id')}"
        )

        time.sleep(args.sleep)

    print(
        f"Done. places={upserted_places}, activities={upserted_activities}, skipped={skipped}"
    )


if __name__ == "__main__":
    main()