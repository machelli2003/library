import time
from collections import defaultdict

from flask import Blueprint, request, jsonify, g
from marshmallow import ValidationError
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)

from app.schemas.auth_schema import RegisterSchema, StaffCreateSchema, LoginSchema
from app.services.auth_service import (
    register_user,
    create_staff_user,
    authenticate_user,
    AuthError,
)
from app.models import User, StudentProfile
from app.utils.decorators import role_required

auth_bp = Blueprint("auth", __name__)

register_schema = RegisterSchema()
staff_create_schema = StaffCreateSchema()
login_schema = LoginSchema()

RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_ATTEMPTS = 5
register_attempts = defaultdict(list)


def _check_registration_rate_limit():
    client_ip = request.remote_addr or "unknown"
    now = time.time()
    attempts = g.setdefault("register_attempts", defaultdict(list))[client_ip]
    attempts[:] = [timestamp for timestamp in attempts if now - timestamp < RATE_LIMIT_WINDOW_SECONDS]
    if len(attempts) >= RATE_LIMIT_MAX_ATTEMPTS:
        return False
    attempts.append(now)
    return True


@auth_bp.post("/register")
def register():
    """Public registration. Always creates a student account regardless of
    what the client sends."""
    if not _check_registration_rate_limit():
        return jsonify({"message": "Too many registration attempts"}), 429

    try:
        data = register_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"message": "Validation failed", "errors": err.messages}), 422

    try:
        user = register_user(data)
    except AuthError as err:
        return jsonify({"message": err.message}), err.status_code

    from app.services.activity_service import log_activity
    log_activity(user.id, "Registered a new student profile")

    return jsonify(user.to_dict()), 201


@auth_bp.post("/create-staff")
@role_required("admin")
def create_staff():
    """Admin-only endpoint for creating librarian/admin accounts."""
    try:
        data = staff_create_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"message": "Validation failed", "errors": err.messages}), 422

    try:
        user = create_staff_user(data)
    except AuthError as err:
        return jsonify({"message": err.message}), err.status_code

    from app.services.activity_service import log_activity
    log_activity(int(get_jwt_identity()), f"Created staff account for {user.name} ({user.role})")

    return jsonify(user.to_dict()), 201


@auth_bp.post("/login")
def login():
    try:
        data = login_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"message": "Validation failed", "errors": err.messages}), 422

    try:
        user = authenticate_user(data["email"], data["password"])
    except AuthError as err:
        return jsonify({"message": err.message}), err.status_code

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role},
    )
    refresh_token = create_refresh_token(
        identity=str(user.id),
        additional_claims={"role": user.role},
    )

    from app.services.activity_service import log_activity
    log_activity(user.id, "Logged in")

    return jsonify({"access_token": access_token, "refresh_token": refresh_token, "user": user.to_dict()}), 200


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role},
    )
    return jsonify({"access_token": access_token}), 200


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user.to_dict()), 200


@auth_bp.post("/logout")
@jwt_required()
def logout():
    return jsonify({"message": "Logged out"}), 200


@auth_bp.put("/profile")
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    from app.extensions import db
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email:
        return jsonify({"message": "Name and email are required"}), 422

    if email != user.email:
        if User.query.filter_by(email=email).first():
            return jsonify({"message": "Email already in use"}), 409
        user.email = email

    user.name = name

    if user.role == "student":
        student_id = data.get("student_id")
        program = data.get("program")
        if not user.student_profile:
            user.student_profile = StudentProfile(user_id=user.id)
        user.student_profile.student_id = student_id
        user.student_profile.program = program

    if password:
        if len(password) < 8 or not any(c.isdigit() for c in password) or not any(c.isalpha() for c in password):
            return jsonify({"message": "Password must be at least 8 characters and contain both letters and numbers"}), 422
        user.set_password(password)

    db.session.commit()

    from app.services.activity_service import log_activity
    log_activity(user.id, "Updated profile settings")

    return jsonify(user.to_dict()), 200
