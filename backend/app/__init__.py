from flask import Flask, jsonify, request
import os
from .extensions import bcrypt, jwt
from flask_cors import CORS
from app.repositories.auth_repo import get_user_by_email, create_user
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required, get_jwt_identity


from app.repositories.activities_repo import list_activities, get_activity_by_id
from app.repositories.places_repo import list_places, get_place_by_id

def create_app():
    app = Flask(__name__)

    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}}, supports_credentials=True,)

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
    

    @app.post("/api/v1/auth/register")
    def register():
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400

        # Check if user already exists
        if get_user_by_email(email):
            return jsonify({"error": "User already exists"}), 400

        # Hash the password
        password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

        # Store user in DB
        user = create_user(email, password_hash)

        return jsonify({
            "message": "Account created",
            "user": {
                "id": user["id"],
                "email": user["email"]
            }
        }), 201


    @app.post("/api/v1/auth/login")
    def login():
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400

        user = get_user_by_email(email)

        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        if not bcrypt.check_password_hash(user["password_hash"], password):
            return jsonify({"error": "Invalid credentials"}), 401

        access_token = create_access_token(identity=str(user["id"]))

        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user["id"],
                "email": user["email"]
            }
        })



    @app.get("/api/v1/me")
    @jwt_required()
    def me():
        user_id = get_jwt_identity()
        return jsonify({
            "message": "Authenticated",
            "user_id": user_id
        })
    return app
