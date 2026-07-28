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
    category_id = request.args.get("category_id")
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 12, type=int)

    books, total, current_page, total_pages = list_books(search, category_id, page, per_page)
    return jsonify({
        "books": [b.to_dict() for b in books],
        "total": total,
        "page": current_page,
        "pages": total_pages,
    }), 200


@books_bp.get("/recommended")
@jwt_required()
def get_recommended_books():
    """Get personalized book recommendations for the current user."""
    user_id = get_jwt_identity()

    # Find categories user has previously borrowed
    user_borrows = BorrowRecord.objects(user_id=user_id).all()
    borrowed_book_ids = [r.book_id for r in user_borrows if r.book_id]
    
    # Get the books the user borrowed to find their categories
    borrowed_books = Book.objects(id__in=borrowed_book_ids) if borrowed_book_ids else []
    category_ids = [b.category_id for b in borrowed_books if b.category_id]

    query = Book.objects(available_copies__gt=0)
    if category_ids:
        recommended = query.filter(category_id__in=category_ids).limit(6).all()
    else:
        recommended = query.order_by("-created_at").limit(6).all()

    if len(recommended) < 6:
        existing_ids = [str(b.id) for b in recommended]
        fallback = query.filter(id__nin=existing_ids).limit(6 - len(recommended)).all()
        recommended.extend(fallback)

    return jsonify([b.to_dict() for b in recommended]), 200


@books_bp.get("/<path:book_id>")
@jwt_required()
def get_book_detail(book_id):
    try:
        book = get_book(book_id)
    except BookError as err:
        return jsonify({"message": err.message}), err.status_code
    return jsonify(book.to_dict()), 200


@books_bp.get("/<path:book_id>/history")
@role_required("librarian", "admin")
def get_book_borrow_history(book_id):
    """Get full borrowing history for a specific book."""
    try:
        book = get_book(book_id)
    except BookError as err:
        return jsonify({"message": err.message}), err.status_code

    records = BorrowRecord.objects(book_id=book_id).order_by("-created_at").all()

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
    actor_id = str(get_jwt_identity())
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
            cat = Category.objects(name=category_name).first()
            if not cat:
                cat = Category(name=category_name)
                cat.save()
            category_id = str(cat.id)

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


@books_bp.put("/<path:book_id>")
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
    actor_id = str(get_jwt_identity())
    log_activity(actor_id, f"Updated book information for '{book.title}'")

    return jsonify(book.to_dict()), 200


@books_bp.post("/<path:book_id>/cover")
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
    book.save()

    return jsonify(book.to_dict()), 200


@books_bp.delete("/<path:book_id>")
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
    actor_id = str(get_jwt_identity())
    log_activity(actor_id, f"Deleted book '{book_title}' from catalogue")

    return jsonify({"message": "Book deleted"}), 200
