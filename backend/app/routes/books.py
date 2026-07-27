import os
import uuid
import csv
import io
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.schemas.book_schema import BookSchema, BookUpdateSchema
from app.services.book_service import (
    list_books, get_book, create_book, update_book, delete_book, BookError,
)
from app.extensions import db
from app.models import BorrowRecord, Book, Category
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


@books_bp.get("/recommended")
@jwt_required()
def get_recommended_books():
    """Get personalized book recommendations for the current user."""
    from sqlalchemy import func
    user_id = int(get_jwt_identity())

    # Find categories user has previously borrowed
    user_categories = (
        db.session.query(Book.category_id)
        .join(BorrowRecord, BorrowRecord.book_id == Book.id)
        .filter(BorrowRecord.user_id == user_id, Book.category_id.isnot(None))
        .group_by(Book.category_id)
        .all()
    )
    category_ids = [cat_id for (cat_id,) in user_categories if cat_id]

    query = Book.query.filter(Book.available_copies > 0)
    if category_ids:
        recommended = query.filter(Book.category_id.in_(category_ids)).limit(6).all()
    else:
        recommended = query.order_by(Book.created_at.desc()).limit(6).all()

    if len(recommended) < 6:
        existing_ids = {b.id for b in recommended}
        fallback = query.filter(Book.id.notin_(existing_ids)).limit(6 - len(recommended)).all()
        recommended.extend(fallback)

    return jsonify([b.to_dict() for b in recommended]), 200


@books_bp.get("/<int:book_id>")
@jwt_required()
def get_book_detail(book_id):
    try:
        book = get_book(book_id)
    except BookError as err:
        return jsonify({"message": err.message}), err.status_code
    return jsonify(book.to_dict()), 200


@books_bp.get("/<int:book_id>/history")
@role_required("librarian", "admin")
def get_book_borrow_history(book_id):
    """Get full borrowing history for a specific book."""
    try:
        book = get_book(book_id)
    except BookError as err:
        return jsonify({"message": err.message}), err.status_code

    records = BorrowRecord.query.filter_by(book_id=book_id).order_by(
        BorrowRecord.created_at.desc()
    ).all()

    return jsonify({
        "book": book.to_dict(),
        "borrow_records": [r.to_dict() for r in records],
        "total_borrows": len(records),
    }), 200


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


@books_bp.post("/bulk-import")
@role_required("librarian", "admin")
def bulk_import_books():
    """Import multiple books from JSON array or CSV file."""
    if "file" in request.files:
        file = request.files["file"]
        if not file.filename.endswith(".csv"):
            return jsonify({"message": "Only CSV files are supported for file upload"}), 422

        stream = io.StringIO(file.stream.read().decode("utf-8-sig"))
        reader = csv.DictReader(stream)
        books_data = list(reader)
    else:
        books_data = request.get_json()

    if not books_data or not isinstance(books_data, list):
        return jsonify({"message": "Provide a JSON array of books or a CSV file"}), 422

    imported = 0
    errors = []

    for idx, row in enumerate(books_data):
        title = row.get("title", "").strip()
        author = row.get("author", "").strip()
        if not title or not author:
            errors.append({"row": idx, "message": "Title and author are required"})
            continue

        quantity = int(row.get("quantity", 1))
        isbn = row.get("isbn", "").strip() or None
        category_name = row.get("category", "").strip()

        # Look up or create category by name
        category_id = None
        if category_name:
            cat = Category.query.filter_by(name=category_name).first()
            if not cat:
                cat = Category(name=category_name)
                db.session.add(cat)
                db.session.flush()
            category_id = cat.id

        try:
            book_data = {
                "title": title,
                "author": author,
                "isbn": isbn,
                "category_id": category_id,
                "quantity": quantity,
                "description": row.get("description", "").strip() or None,
            }
            create_book(book_data)
            imported += 1
        except Exception as e:
            errors.append({"row": idx, "message": str(e)})

    return jsonify({
        "imported": imported,
        "errors": errors,
        "total": len(books_data),
    }), 201 if imported > 0 else 400


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
    db.session.commit()

    return jsonify(book.to_dict()), 200


@books_bp.delete("/<int:book_id>")
@role_required("librarian", "admin")
def remove_book(book_id):
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

