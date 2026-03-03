from typing import List, Protocol, Optional


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