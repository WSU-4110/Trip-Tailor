from copy import deepcopy

from app.services.google_type_rules import GOOGLE_TYPE_RULES, TYPE_PRIORITY, get_default_activity_rule


def classify_google_place(raw: dict) -> dict:
    """
    Convert a raw Google Places result into normalized TripTailor activity metadata.
    """
    place_types = raw.get("types") or []
    result = deepcopy(get_default_activity_rule())

    for place_type in TYPE_PRIORITY:
        if place_type in place_types and place_type in GOOGLE_TYPE_RULES:
            result.update(GOOGLE_TYPE_RULES[place_type])
            break

    result["title"] = raw.get("name")
    result["description"] = None
    result["source"] = "google"
    result["source_url"] = None

    return result