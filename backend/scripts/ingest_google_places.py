import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import argparse
import time

from app.clients.google_places_client import text_search
from app.services.normalize_place import normalize_google_place
from app.repositories.places_repo import upsert_place_by_google_id



def main():
    parser = argparse.ArgumentParser(description="Ingest places from Google Places Text Search into Postgres.")
    parser.add_argument("query", help='Search query, e.g. "museums in Detroit"')
    parser.add_argument("--max-results", type=int, default=int(os.getenv("INGEST_MAX_RESULTS", "20")))
    parser.add_argument("--sleep", type=float, default=float(os.getenv("INGEST_RATE_LIMIT_SLEEP_SECONDS", "0.2")))
    parser.add_argument("--paged", action="store_true", help="Fetch up to 2 pages (may cost more).")
    args = parser.parse_args()

    raw_results = text_search(args.query, max_results=args.max_results, paged=args.paged)

    upserted = 0
    skipped = 0

    for raw in raw_results:
        place = normalize_google_place(raw)
        saved = upsert_place_by_google_id(place)
        if not saved:
            skipped += 1
            continue

        upserted += 1
        print(
            f"Upserted: {saved['name']} | city={saved.get('city')} region={saved.get('region')} "
            f"| google_place_id={saved.get('google_place_id')}"
        )
        time.sleep(args.sleep)

    print(f"Done. Upserted={upserted}, Skipped={skipped}")


if __name__ == "__main__":
    main()
