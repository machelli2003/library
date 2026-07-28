from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from app.models import Fine, BorrowRecord
from app.utils.decorators import role_required

fines_bp = Blueprint("fines", __name__)


@fines_bp.get("/mine")
@jwt_required()
def my_fines():
    user_id = str(get_jwt_identity())
    records = BorrowRecord.objects(user_id=user_id).all()
    borrow_ids = [str(r.id) for r in records]
    fines = Fine.objects(borrow_record_id__in=borrow_ids).order_by("-id").all()
    return jsonify([f.to_dict() for f in fines]), 200


@fines_bp.get("")
@role_required("librarian", "admin")
def all_fines():
    fines = Fine.objects.order_by("-id").all()
    return jsonify([f.to_dict() for f in fines]), 200


@fines_bp.patch("/<path:fine_id>/pay")
@role_required("librarian", "admin")
def mark_paid(fine_id):
    fine = Fine.objects(id=fine_id).first()
    if not fine:
        return jsonify({"message": "Fine not found"}), 404
    if fine.status == "paid":
        return jsonify({"message": "Fine already paid"}), 409

    fine.status = "paid"
    fine.paid_at = datetime.utcnow()
    fine.save()
    return jsonify(fine.to_dict()), 200
