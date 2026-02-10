from flask import Flask, jsonify, request

from app.repositories.activities_repo import list_activities, get_activity_by_id
from app.repositories.places_repo import list_places, get_place_by_id


def create_app():
    app = Flask(__name__)

    @app.route("/health")
    def health():
        return {"status": "ok"}

    # Debug convenience route (optional)
    @app.route("/testing")
    def testing():
        return jsonify({
            "places": list_places(limit=10, offset=0),
            "activities": list_activities(limit=10, offset=0),
        })

    # -------------------
    # API v1 endpoints
    # -------------------

    @app.get("/api/v1/activities")
    def api_list_activities():
        limit = request.args.get("limit", default=50, type=int)
        offset = request.args.get("offset", default=0, type=int)

        # guardrails
        limit = max(1, min(limit, 200))
        offset = max(0, offset)

        return jsonify(list_activities(limit=limit, offset=offset))

    @app.get("/api/v1/activities/<activity_id>")
    def api_get_activity(activity_id):
        row = get_activity_by_id(activity_id)
        if row is None:
            return jsonify({"error": {"code": "NOT_FOUND", "message": "Activity not found"}}), 404
        return jsonify(row)

    @app.get("/api/v1/places")
    def api_list_places():
        limit = request.args.get("limit", default=50, type=int)
        offset = request.args.get("offset", default=0, type=int)

        limit = max(1, min(limit, 200))
        offset = max(0, offset)

        return jsonify(list_places(limit=limit, offset=offset))

    @app.get("/api/v1/places/<place_id>")
    def api_get_place(place_id):
        row = get_place_by_id(place_id)
        if row is None:
            return jsonify({"error": {"code": "NOT_FOUND", "message": "Place not found"}}), 404
        return jsonify(row)

    return app
