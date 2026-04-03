from flask import Blueprint, request, jsonify
from datetime import datetime

from app.services.trip_generator import generate_trip_from_preferences

from app.repositories.trips_repo import get_full_trip, list_trips
from app.repositories.trip_itinerary_repo import (insert_trip_itinerary_item, delete_trip_itinerary_item,
    update_trip_itinerary_item, reorder_day_items, get_trip_itinerary_items,)

from app.repositories.recommendations_repo import get_alternate_candidates

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
    
@trip_bp.route("/<trip_id>", methods=["GET"])
def get_trip(trip_id):
    try:
        result = get_full_trip(trip_id)

        if not result:
            return jsonify({"error": "Trip not found"}), 404

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@trip_bp.route("", methods=["GET"])
def get_trips():
    try:
        rows = list_trips(limit=50, offset=0)
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@trip_bp.route("/<trip_id>/items", methods=["POST"])
def add_custom_item(trip_id):
    try:
        data = request.get_json()

        day_number = data.get("day_number")
        if not day_number:
            return jsonify({"error": "day_number is required"}), 400

        place_id = data.get("place_id")
        activity_id = data.get("activity_id")
        custom_name = data.get("custom_name", "").strip()

        # Must have either a place/activity pair or a custom name
        if not place_id and not custom_name:
            return jsonify({"error": "Either place_id/activity_id or custom_name is required"}), 400

        # Use provided item_order for swaps, otherwise append to end of day
        item_order = data.get("item_order")
        if item_order is None:
            existing = get_trip_itinerary_items(trip_id)
            day_items = [i for i in existing if i["day_number"] == day_number]
            item_order = max((i["item_order"] for i in day_items), default=0) + 1

        item = insert_trip_itinerary_item({
            "trip_id": trip_id,
            "day_number": day_number,
            "item_order": item_order,
            "scheduled_date": data.get("scheduled_date"),
            "source_type": data.get("source_type", "user"),
            "item_status": "active",
            "place_id": place_id,
            "activity_id": activity_id,
            "custom_name": custom_name or None,
            "custom_address": data.get("custom_address"),
            "notes": data.get("notes"),
        })

        return jsonify(item), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@trip_bp.route("/<trip_id>/items/<item_id>", methods=["DELETE"])
def delete_item(trip_id, item_id):
    try:
        deleted = delete_trip_itinerary_item(item_id, trip_id)
        if not deleted:
            return jsonify({"error": "Item not found"}), 404
        return jsonify({"deleted": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@trip_bp.route("/<trip_id>/items/<item_id>", methods=["PATCH"])
def update_item(trip_id, item_id):
    try:
        data = request.get_json()
        updated = update_trip_itinerary_item(item_id, trip_id, {
            "notes": data.get("notes"),
            "custom_name": data.get("custom_name"),
            "custom_address": data.get("custom_address"),
        })
        if not updated:
            return jsonify({"error": "Item not found"}), 404
        return jsonify(updated), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@trip_bp.route("/<trip_id>/items/reorder", methods=["PATCH"])
def reorder_items(trip_id):
    try:
        data = request.get_json()
        day_number = data.get("day_number")
        ordered_ids = data.get("ordered_item_ids", [])

        if not day_number or not ordered_ids:
            return jsonify({"error": "day_number and ordered_item_ids are required"}), 400

        reorder_day_items(trip_id, day_number, ordered_ids)
        return jsonify({"reordered": True}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@trip_bp.route("/<trip_id>/items/<item_id>/alternates", methods=["GET"])
def get_item_alternates(trip_id, item_id):
    """
    Returns 3 alternate activity suggestions for a given itinerary item.
    Excludes all places already in the trip itinerary.
    """
    try:
        # Get the full trip to find the city and what's already in the itinerary
        result = get_full_trip(trip_id)
        if not result:
            return jsonify({"error": "Trip not found"}), 404

        trip = result["trip"]
        city = trip["destination_city"]
        region = trip.get("destination_region")

        # Exclude every place already in the itinerary
        exclude_place_ids = [
            item["place_id"]
            for item in result["itinerary_items"]
            if item.get("place_id")
        ]

        alternates = get_alternate_candidates(
            city=city,
            region=region,
            exclude_place_ids=exclude_place_ids,
            limit=3,
        )

        return jsonify(alternates), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    