from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models import User
from app.services.user_service import (
    list_users, get_user, set_active_status, change_role, UserError,
)
from app.utils.decorators import role_required

users_bp = Blueprint("users", __name__)


@users_bp.get("")
@role_required("admin")
def get_users():
    role = request.args.get("role")
    users = list_users(role)
    return jsonify([u.to_dict() for u in users]), 200


@users_bp.get("/<int:user_id>")
@role_required("admin")
def get_user_detail(user_id):
    try:
        user = get_user(user_id)
    except UserError as err:
        return jsonify({"message": err.message}), err.status_code
    return jsonify(user.to_dict()), 200


@users_bp.put("/<int:user_id>")
@role_required("admin")
def edit_user(user_id):
    try:
        user = get_user(user_id)
    except UserError as err:
        return jsonify({"message": err.message}), err.status_code

    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")

    if not name or not email:
        return jsonify({"message": "Name and email are required"}), 422

    if email != user.email:
        if User.query.filter_by(email=email).first():
            return jsonify({"message": "Email already in use"}), 409
        user.email = email

    user.name = name
    db.session.commit()

    from app.services.activity_service import log_activity
    from flask_jwt_extended import get_jwt_identity
    actor_id = int(get_jwt_identity())
    log_activity(actor_id, f"Updated user profile for '{user.name}' (ID: {user.id})")

    return jsonify(user.to_dict()), 200


@users_bp.patch("/<int:user_id>/deactivate")
@role_required("admin")
def deactivate(user_id):
    try:
        user = set_active_status(user_id, False)
    except UserError as err:
        return jsonify({"message": err.message}), err.status_code
    return jsonify(user.to_dict()), 200


@users_bp.patch("/<int:user_id>/activate")
@role_required("admin")
def activate(user_id):
    try:
        user = set_active_status(user_id, True)
    except UserError as err:
        return jsonify({"message": err.message}), err.status_code
    return jsonify(user.to_dict()), 200


@users_bp.patch("/<int:user_id>/role")
@role_required("admin")
def update_role(user_id):
    data = request.get_json() or {}
    try:
        user = change_role(user_id, data.get("role"))
    except UserError as err:
        return jsonify({"message": err.message}), err.status_code
    return jsonify(user.to_dict()), 200


@users_bp.delete("/<int:user_id>")
@role_required("admin")
def remove_user(user_id):
    try:
        user = get_user(user_id)
    except UserError as err:
        return jsonify({"message": err.message}), err.status_code

    db.session.delete(user)
    db.session.commit()

    from app.services.activity_service import log_activity
    from flask_jwt_extended import get_jwt_identity
    actor_id = int(get_jwt_identity())
    log_activity(actor_id, f"Deleted user '{user.name}' (ID: {user.id})")

    return jsonify({"message": "User deleted"}), 200
