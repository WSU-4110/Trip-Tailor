from flask import Blueprint, request, jsonify
from datetime import datetime

from app.services.trip_generator import generate_trip_from_preferences

trip_bp = Blueprint("trip", __name__, url_prefix="/api/v1/trips")


def _parse_date(value: str):
    return datetime.strptime(value, "%Y-%m-%d").date()

@trip_bp.route("/test", methods=["GET"])
def test():
    return {"message": "Trip route working"}

@trip_bp.route("/generate", methods=["POST"])
def generate_trip():
    try:
        data = request.get_json()

        payload = {
            **data,
            "start_date": _parse_date(data["start_date"]),
            "end_date": _parse_date(data["end_date"]),
        }

        result = generate_trip_from_preferences(payload)

        return jsonify({
            "trip": result["trip"],
            "preferences": result["preferences"],
            "itinerary_items": result["itinerary_items"],
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    