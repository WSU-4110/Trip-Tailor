import os
import requests

GOOGLE_PLACES_TEXTSEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"


def _get_key() -> str:
    key = os.getenv("GOOGLE_PLACES_API_KEY")
    if not key:
        raise RuntimeError("Missing GOOGLE_PLACES_API_KEY (set it in your environment or in backend/.env)")
    return key


def text_search(query: str, *, max_results: int = 10, paged: bool = False) -> list[dict]:
    """
    Google Places Text Search.
    Returns a list of raw place results.
    If paged=False: only first page (fast + cheap).
    If paged=True: may fetch a second page if next_page_token is provided.
    """
    key = _get_key()
    params = {"query": query, "key": key}

    results: list[dict] = []

    resp = requests.get(GOOGLE_PLACES_TEXTSEARCH_URL, params=params, timeout=20)
    resp.raise_for_status()
    data = resp.json()
    results.extend(data.get("results", []))

    if paged and data.get("next_page_token") and len(results) < max_results:
        import time
        time.sleep(2.0)  # token often needs a short delay before it works

        token = data["next_page_token"]
        resp2 = requests.get(
            GOOGLE_PLACES_TEXTSEARCH_URL,
            params={"pagetoken": token, "key": key},
            timeout=20,
        )
        resp2.raise_for_status()
        data2 = resp2.json()
        results.extend(data2.get("results", []))

    return results[:max_results]
