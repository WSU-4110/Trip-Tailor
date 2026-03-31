# test_place_provider.py
import pytest
from typing import List, Optional, Protocol

# Protocol definition
class PlaceProvider(Protocol):
    """
    Target interface for the Adapter pattern.
    Any provider must return canonical place dicts for the rest of the app.
    """
    def search_places(
        self,
        term: str,
        latitude: float,
        longitude: float,
        radius_meters: int = 5000,
        limit: int = 10,
        categories: Optional[str] = None,
        open_now: Optional[bool] = None,
    ) -> List[dict]:
        return

# Dummy implementation for testing
class DummyProvider:
    def search_places(
        self,
        term: str,
        latitude: float,
        longitude: float,
        radius_meters: int = 5000,
        limit: int = 10,
        categories: Optional[str] = None,
        open_now: Optional[bool] = None,
    ) -> List[dict]:
        # Mock database of places
        all_places = [
            {"name": "Museum A", "category": "museum", "latitude": latitude, "longitude": longitude, "open_now": True},
            {"name": "Museum B", "category": "museum", "latitude": latitude, "longitude": longitude, "open_now": False},
            {"name": "Park C", "category": "park", "latitude": latitude, "longitude": longitude, "open_now": True},
            {"name": "Cafe D", "category": "cafe", "latitude": latitude, "longitude": longitude, "open_now": True},
        ]

        # Filter by term in name
        results = [p for p in all_places if term.lower() in p["name"].lower()]

        # Filter by category
        if categories:
            results = [p for p in results if p["category"] == categories]

        # Filter by open_now
        if open_now is not None:
            results = [p for p in results if p["open_now"] == open_now]

        # Limit results
        return results[:limit]

# Test the DummyProvider
def test_search_places():
    provider = DummyProvider()

    # 1. Search by term only
    results = provider.search_places(term="Museum", latitude=0, longitude=0)
    assert len(results) == 2
    assert all("Museum" in p["name"] for p in results)

    # 2. Search with limit
    results = provider.search_places(term="Museum", latitude=0, longitude=0, limit=1)
    assert len(results) == 1

    # 3. Search with category filter
    results = provider.search_places(term="Museum", latitude=0, longitude=0, categories="museum")
    assert all(p["category"] == "museum" for p in results)

    # 4. Search with open_now filter
    results = provider.search_places(term="Museum", latitude=0, longitude=0, open_now=True)
    assert all(p["open_now"] is True for p in results)

    # 5. Search with category and open_now combined
    results = provider.search_places(term="Museum", latitude=0, longitude=0, categories="museum", open_now=False)
    assert len(results) == 1
    assert results[0]["name"] == "Museum B"

    # 6. Search term with no match
    results = provider.search_places(term="Zoo", latitude=0, longitude=0)
    assert results == []