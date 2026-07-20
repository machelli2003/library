from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Book, BorrowRecord, Review

reviews_bp = Blueprint("reviews", __name__)


@reviews_bp.get("/books/<int:book_id>/reviews")
def list_reviews(book_id):
    """Retrieve all reviews for a book."""
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"message": "Book not found"}), 404

    reviews = Review.query.filter_by(book_id=book_id).order_by(Review.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reviews]), 200


@reviews_bp.get("/books/<int:book_id>/review-eligibility")
@jwt_required()
def check_eligibility(book_id):
    """Check if the current student can review a book."""
    user_id = get_jwt_identity()

    book = Book.query.get(book_id)
    if not book:
        return jsonify({"message": "Book not found"}), 404

    # Constraint 1: Must have borrowed and returned this book
    returned = BorrowRecord.query.filter_by(
        user_id=user_id, book_id=book_id, status="returned"
    ).first()
    if not returned:
        return jsonify({
            "eligible": False,
            "reason": "You must have borrowed and returned this book before reviewing it.",
        }), 200

    # Constraint 2: Must not have reviewed it already
    existing = Review.query.filter_by(user_id=user_id, book_id=book_id).first()
    if existing:
        return jsonify({
            "eligible": False,
            "reason": "You have already reviewed this book.",
        }), 200

    return jsonify({"eligible": True, "reason": None}), 200


@reviews_bp.post("/books/<int:book_id>/reviews")
@jwt_required()
def add_review(book_id):
    """Post a rating and review for a book."""
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    rating = data.get("rating")
    comment = data.get("comment", "")

    if not rating or not (1 <= rating <= 5):
        return jsonify({"message": "Rating must be an integer between 1 and 5"}), 400

    book = Book.query.get(book_id)
    if not book:
        return jsonify({"message": "Book not found"}), 404

    # Eligibility check
    returned = BorrowRecord.query.filter_by(
        user_id=user_id, book_id=book_id, status="returned"
    ).first()
    if not returned:
        return jsonify({"message": "You can only review books you have borrowed and returned"}), 403

    existing = Review.query.filter_by(user_id=user_id, book_id=book_id).first()
    if existing:
        return jsonify({"message": "You have already reviewed this book"}), 400

    # Save review
    review = Review(user_id=user_id, book_id=book_id, rating=rating, comment=comment)
    db.session.add(review)
    db.session.commit()

    return jsonify(review.to_dict()), 201
