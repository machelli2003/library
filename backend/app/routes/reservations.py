from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Book, BorrowRecord, Reservation

reservations_bp = Blueprint("reservations", __name__)


@reservations_bp.get("/my")
@jwt_required()
def my_reservations():
    """Get all reservations for the authenticated student."""
    user_id = get_jwt_identity()
    records = (
        Reservation.query.filter_by(user_id=user_id)
        .order_by(Reservation.created_at.desc())
        .all()
    )
    return jsonify([r.to_dict() for r in records]), 200


@reservations_bp.post("")
@jwt_required()
def create_reservation():
    """Create a new pending hold on a book with zero copies available."""
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    book_id = data.get("book_id")

    if not book_id:
        return jsonify({"message": "book_id is required"}), 400

    book = Book.query.get(book_id)
    if not book:
        return jsonify({"message": "Book not found"}), 404

    # Constraint: Only allow reservation if the book is actually out of stock
    if book.available_copies > 0:
        return jsonify({"message": "Book is currently available for direct borrowing"}), 400

    # Constraint: Check if user already has an active borrow/request for this book
    active_borrow = BorrowRecord.query.filter(
        BorrowRecord.user_id == user_id,
        BorrowRecord.book_id == book_id,
        BorrowRecord.status.in_(("pending", "borrowed", "overdue")),
    ).first()
    if active_borrow:
        return jsonify({"message": "You already have an active request or loan for this book"}), 400

    # Constraint: Check if user already has a pending reservation for this book
    existing_reservation = Reservation.query.filter_by(
        user_id=user_id, book_id=book_id, status="pending"
    ).first()
    if existing_reservation:
        return jsonify({"message": "You already have a pending reservation for this book"}), 400

    # Create reservation
    res = Reservation(user_id=user_id, book_id=book_id, status="pending")
    db.session.add(res)
    db.session.commit()

    return jsonify(res.to_dict()), 201


@reservations_bp.patch("/<int:id>/cancel")
@jwt_required()
def cancel_reservation(id):
    """Cancel a pending reservation."""
    user_id = get_jwt_identity()
    res = Reservation.query.filter_by(id=id, user_id=user_id).first()

    if not res:
        return jsonify({"message": "Reservation not found"}), 404

    if res.status != "pending":
        return jsonify({"message": f"Cannot cancel a reservation that is {res.status}"}), 400

    res.status = "cancelled"
    db.session.commit()

    return jsonify(res.to_dict()), 200
