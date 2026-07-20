from flask import Blueprint, request, jsonify

from app.services.user_service import (
    list_users, set_active_status, change_role, UserError,
)
from app.utils.decorators import role_required

users_bp = Blueprint("users", __name__)


@users_bp.get("")
@role_required("admin")
def get_users():
    role = request.args.get("role")
    users = list_users(role)
    return jsonify([u.to_dict() for u in users]), 200


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
