import os
import uuid
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.schemas.book_schema import BookSchema, BookUpdateSchema
from app.services.book_service import (
    list_books, get_book, create_book, update_book, delete_book, BookError,
)
from app.utils.decorators import role_required

books_bp = Blueprint("books", __name__)

book_schema = BookSchema()
book_update_schema = BookUpdateSchema()
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}


def _allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@books_bp.get("")
@jwt_required()
def get_books():
    search = request.args.get("search")
    category_id = request.args.get("category_id", type=int)
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 12, type=int)

    pagination = list_books(search, category_id, page, per_page)
    return jsonify({
        "books": [b.to_dict() for b in pagination.items],
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
    }), 200


@books_bp.get("/<int:book_id>")
@jwt_required()
def get_book_detail(book_id):
    try:
        book = get_book(book_id)
    except BookError as err:
        return jsonify({"message": err.message}), err.status_code
    return jsonify(book.to_dict()), 200


@books_bp.post("")
@role_required("librarian", "admin")
def add_book():
    try:
        data = book_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"message": "Validation failed", "errors": err.messages}), 422

    try:
        book = create_book(data)
    except BookError as err:
        return jsonify({"message": err.message}), err.status_code

    from app.services.activity_service import log_activity
    actor_id = int(get_jwt_identity())
    log_activity(actor_id, f"Added book '{book.title}' to catalogue")

    return jsonify(book.to_dict()), 201


@books_bp.put("/<int:book_id>")
@role_required("librarian", "admin")
def edit_book(book_id):
    try:
        data = book_update_schema.load(request.get_json() or {}, partial=True)
    except ValidationError as err:
        return jsonify({"message": "Validation failed", "errors": err.messages}), 422

    try:
        book = update_book(book_id, data)
    except BookError as err:
        return jsonify({"message": err.message}), err.status_code

    from app.services.activity_service import log_activity
    actor_id = int(get_jwt_identity())
    log_activity(actor_id, f"Updated book information for '{book.title}'")

    return jsonify(book.to_dict()), 200


@books_bp.post("/<int:book_id>/cover")
@role_required("librarian", "admin")
def upload_cover(book_id):
    try:
        book = get_book(book_id)
    except BookError as err:
        return jsonify({"message": err.message}), err.status_code

    if "file" not in request.files:
        return jsonify({"message": "No file provided"}), 422

    file = request.files["file"]
    if file.filename == "" or not _allowed_file(file.filename):
        return jsonify({"message": "Invalid file type. Use png, jpg, jpeg, or webp"}), 422

    filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    book.cover_url = f"/api/uploads/{filename}"
    from app.extensions import db
    db.session.commit()

    return jsonify(book.to_dict()), 200


@books_bp.delete("/<int:book_id>")
@role_required("librarian", "admin")
def remove_book(book_id):
    # Retrieve book detail for logging before deletion
    from app.services.book_service import get_book
    try:
        book = get_book(book_id)
        book_title = book.title
    except Exception:
        book_title = "Unknown Book"

    try:
        delete_book(book_id)
    except BookError as err:
        return jsonify({"message": err.message}), err.status_code

    from app.services.activity_service import log_activity
    actor_id = int(get_jwt_identity())
    log_activity(actor_id, f"Deleted book '{book_title}' from catalogue")

    return jsonify({"message": "Book deleted"}), 200
