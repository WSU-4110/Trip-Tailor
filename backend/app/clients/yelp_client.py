import os
from typing import Any, Dict, Optional

import requests


class YelpClient:
    """
    Thin client around Yelp Fusion API.
    Auth uses env var: YELP_API_KEY
    """

    BASE_URL = "https://api.yelp.com/v3"

    def __init__(self, api_key: Optional[str] = None, timeout_s: int = 15):
        self.api_key = api_key or os.getenv("YELP_API_KEY")
        if not self.api_key:
            raise RuntimeError(
                "Missing Yelp API key. Set YELP_API_KEY in your environment or .env."
            )
        self.timeout_s = timeout_s

    def search_businesses(
        self,
        term: str,
        latitude: float,
        longitude: float,
        radius_meters: int = 5000,
        categories: Optional[str] = None,
        limit: int = 10,
        open_now: Optional[bool] = None,
    ) -> Dict[str, Any]:
        """
        Yelp Fusion: GET /businesses/search
        Returns raw JSON dict from Yelp.
        """
        url = f"{self.BASE_URL}/businesses/search"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        params: Dict[str, Any] = {
            "term": term,
            "latitude": latitude,
            "longitude": longitude,
            "radius": radius_meters,
            "limit": limit,
        }
        if categories:
            params["categories"] = categories
        if open_now is not None:
            params["open_now"] = open_now

        resp = requests.get(url, headers=headers, params=params, timeout=self.timeout_s)
        # Raise nice errors for non-200s
        try:
            resp.raise_for_status()
        except requests.HTTPError as e:
            raise RuntimeError(f"Yelp API error: {resp.status_code} {resp.text}") from e

        return resp.json()