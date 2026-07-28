from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required

from app.schemas.category_schema import CategorySchema
from app.services.category_service import (
    list_categories, get_category, create_category, update_category,
    delete_category, CategoryError,
)
from app.utils.decorators import role_required

categories_bp = Blueprint("categories", __name__)
category_schema = CategorySchema()


@categories_bp.get("")
@jwt_required()
def get_categories():
    categories = list_categories()
    return jsonify([c.to_dict() for c in categories]), 200


@categories_bp.post("")
@role_required("librarian", "admin")
def add_category():
    try:
        data = category_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"message": "Validation failed", "errors": err.messages}), 422

    try:
        category = create_category(data)
    except CategoryError as err:
        return jsonify({"message": err.message}), err.status_code

    from app.services.activity_service import log_activity
    from flask_jwt_extended import get_jwt_identity
    actor_id = str(get_jwt_identity())
    log_activity(actor_id, f"Created category '{category.name}'")

    return jsonify(category.to_dict()), 201


@categories_bp.put("/<path:category_id>")
@role_required("librarian", "admin")
def edit_category(category_id):
    try:
        data = category_schema.load(request.get_json() or {}, partial=True)
    except ValidationError as err:
        return jsonify({"message": "Validation failed", "errors": err.messages}), 422

    try:
        category = update_category(category_id, data)
    except CategoryError as err:
        return jsonify({"message": err.message}), err.status_code

    return jsonify(category.to_dict()), 200


@categories_bp.delete("/<path:category_id>")
@role_required("librarian", "admin")
def remove_category(category_id):
    # Retrieve category name for logging before deletion
    from app.services.category_service import get_category
    try:
        category = get_category(category_id)
        cat_name = category.name
    except Exception:
        cat_name = "Unknown Category"

    try:
        delete_category(category_id)
    except CategoryError as err:
        return jsonify({"message": err.message}), err.status_code

    from app.services.activity_service import log_activity
    from flask_jwt_extended import get_jwt_identity
    actor_id = str(get_jwt_identity())
    log_activity(actor_id, f"Deleted category '{cat_name}'")

    return jsonify({"message": "Category deleted"}), 200
