from typing import Any
from app.clients.google_places_client import text_search
from app.services.place_variables import build_place_variables
from app.repositories.places_repo import upsert_place
from app.repositories.activities_repo import upsert_activity_for_place
from app.repositories.external_ids_repo import upsert_place_external_id
from app.repositories.city_coverage_repo import mark_city_seeded

SEARCH_TERMS = [
    "museums", "parks", "tourist attractions",
    "restaurants", "bars", "entertainment",
]

def ingest_city_live(city: str, region: str, country: str = "US") -> int:
    """
    Runs a live Google Places ingest for a city on demand.
    Returns the number of places upserted.
    """
    total = 0

    for term in SEARCH_TERMS:
        query = f"{term} in {city} {region}"
        try:
            raw_results = text_search(query, max_results=10)
        except Exception:
            continue

        for raw in raw_results:
            variables = build_place_variables(raw, provider="google")
            saved_place = upsert_place(variables)
            if not saved_place:
                continue
            upsert_activity_for_place(saved_place["id"], variables)
            upsert_place_external_id(
                place_id=saved_place["id"],
                source="google",
                external_id=variables.get("google_place_id"),
                raw_payload=raw,
            )
            total += 1

    mark_city_seeded(city, region, country, place_count=total)
    return total