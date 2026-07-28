from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.borrow_service import (
    request_borrow, approve_borrow, reject_borrow, return_book, renew_borrow,
    get_user_history, get_pending_requests, BorrowError,
)
from app.models import BorrowRecord
from app.utils.decorators import role_required

borrow_bp = Blueprint("borrow", __name__)


@borrow_bp.post("")
@role_required("student")
def create_borrow_request():
    data = request.get_json() or {}
    book_id = data.get("book_id")
    if not book_id:
        return jsonify({"message": "book_id is required"}), 422

    user_id = str(get_jwt_identity())
    try:
        record = request_borrow(user_id, book_id)
    except BorrowError as err:
        return jsonify({"message": err.message}), err.status_code

    from app.services.activity_service import log_activity
    log_activity(user_id, f"Requested borrow of book '{record.book_title or 'Unknown'}'")

    return jsonify(record.to_dict()), 201


@borrow_bp.patch("/<path:record_id>/approve")
@role_required("librarian", "admin")
def approve(record_id):
    try:
        record = approve_borrow(record_id)
    except BorrowError as err:
        return jsonify({"message": err.message}), err.status_code

    from app.services.activity_service import log_activity
    actor_id = str(get_jwt_identity())
    log_activity(actor_id, f"Approved borrow request of '{record.book_title or 'Unknown'}' for student '{record.user_name or 'Unknown'}'")

    return jsonify(record.to_dict()), 200


@borrow_bp.patch("/<path:record_id>/reject")
@role_required("librarian", "admin")
def reject(record_id):
    try:
        record = reject_borrow(record_id)
    except BorrowError as err:
        return jsonify({"message": err.message}), err.status_code

    from app.services.activity_service import log_activity
    actor_id = str(get_jwt_identity())
    log_activity(actor_id, f"Rejected borrow request of '{record.book_title or 'Unknown'}' for student '{record.user_name or 'Unknown'}'")

    return jsonify(record.to_dict()), 200


@borrow_bp.patch("/<path:record_id>/return")
@role_required("librarian", "admin")
def process_return(record_id):
    try:
        record = return_book(record_id)
    except BorrowError as err:
        return jsonify({"message": err.message}), err.status_code

    from app.services.activity_service import log_activity
    actor_id = str(get_jwt_identity())
    log_activity(actor_id, f"Recorded return of book '{record.book_title or 'Unknown'}' from student '{record.user_name or 'Unknown'}'")

    return jsonify(record.to_dict()), 200


@borrow_bp.patch("/<path:record_id>/renew")
@jwt_required()
def renew(record_id):
    user_id = str(get_jwt_identity())
    try:
        record = renew_borrow(record_id, user_id)
    except BorrowError as err:
        return jsonify({"message": err.message}), err.status_code

    from app.services.activity_service import log_activity
    log_activity(user_id, f"Renewed borrow checkout of book '{record.book_title or 'Unknown'}'")

    return jsonify(record.to_dict()), 200


@borrow_bp.get("/history")
@jwt_required()
def my_history():
    user_id = str(get_jwt_identity())
    records = get_user_history(user_id)
    return jsonify([r.to_dict() for r in records]), 200


@borrow_bp.get("/pending")
@role_required("librarian", "admin")
def pending():
    records = get_pending_requests()
    return jsonify([r.to_dict() for r in records]), 200


@borrow_bp.get("/active")
@role_required("librarian", "admin")
def active_loans():
    records = BorrowRecord.objects(
        status__in=("approved", "borrowed", "overdue")
    ).order_by("+due_date").all()
    return jsonify([r.to_dict() for r in records]), 200
