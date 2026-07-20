from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from app.extensions import db
from app.models import Fine, BorrowRecord
from app.utils.decorators import role_required

fines_bp = Blueprint("fines", __name__)


@fines_bp.get("/mine")
@jwt_required()
def my_fines():
    user_id = get_jwt_identity()
    fines = (
        Fine.query.join(BorrowRecord)
        .filter(BorrowRecord.user_id == user_id)
        .order_by(Fine.id.desc())
        .all()
    )
    return jsonify([f.to_dict() for f in fines]), 200


@fines_bp.get("")
@role_required("librarian", "admin")
def all_fines():
    fines = Fine.query.order_by(Fine.id.desc()).all()
    return jsonify([f.to_dict() for f in fines]), 200


@fines_bp.patch("/<int:fine_id>/pay")
@role_required("librarian", "admin")
def mark_paid(fine_id):
    fine = Fine.query.get(fine_id)
    if not fine:
        return jsonify({"message": "Fine not found"}), 404
    if fine.status == "paid":
        return jsonify({"message": "Fine already paid"}), 409

    fine.status = "paid"
    fine.paid_at = datetime.utcnow()
    db.session.commit()
    return jsonify(fine.to_dict()), 200
