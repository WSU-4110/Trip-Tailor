from typing import List, Optional

from app.clients.yelp_client import YelpClient
from app.services.place_provider import PlaceProvider
from app.services.normalize_place import normalize_yelp_business


class YelpAdapter(PlaceProvider):
    """
    Adapter: converts Yelp's raw response shape into our canonical place dict.
    """

    def __init__(self, client: YelpClient):
        self.client = client

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
        raw = self.client.search_businesses(
            term=term,
            latitude=latitude,
            longitude=longitude,
            radius_meters=radius_meters,
            categories=categories,
            limit=limit,
            open_now=open_now,
        )

        businesses = raw.get("businesses") or []
        return [normalize_yelp_business(b) for b in businesses]