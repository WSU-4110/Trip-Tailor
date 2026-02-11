from flask import Flask, jsonify, request
import os
from .extensions import bcrypt, jwt


from app.repositories.activities_repo import list_activities, get_activity_by_id
from app.repositories.places_repo import list_places, get_place_by_id

def create_app():
    app = Flask(__name__)

    # Only used for auth; DB is handled by psycopg2 in app/db.py
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-key")

    bcrypt.init_app(app)
    jwt.init_app(app)


    @app.route("/health")
    def health():
        return {"status": "ok"}

    @app.route("/testing")
    def testing():
        return jsonify({
            "places": list_places(limit=10, offset=0),
            "activities": list_activities(limit=10, offset=0),
        })

    @app.get("/api/v1/activities")
    def api_list_activities():
        limit = request.args.get("limit", default=50, type=int)
        offset = request.args.get("offset", default=0, type=int)
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
