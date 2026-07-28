from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import Notification

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.get("")
@jwt_required()
def list_notifications():
    """Return all notifications for the current user, newest first."""
    user_id = str(get_jwt_identity())
    notifications = (
        Notification.objects(user_id=user_id)
        .order_by("-created_at")
        .limit(50)
        .all()
    )
    unread_count = sum(1 for n in notifications if not n.is_read)
    return jsonify({
        "notifications": [n.to_dict() for n in notifications],
        "unread_count": unread_count,
    }), 200


@notifications_bp.patch("/<path:notification_id>/read")
@jwt_required()
def mark_read(notification_id):
    """Mark a single notification as read (only the owning user may do this)."""
    user_id = str(get_jwt_identity())
    n = Notification.objects(id=notification_id, user_id=user_id).first()
    if not n:
        return jsonify({"message": "Notification not found"}), 404
    n.is_read = True
    n.save()
    return jsonify(n.to_dict()), 200


@notifications_bp.post("/read-all")
@jwt_required()
def mark_all_read():
    """Mark every unread notification for the current user as read."""
    user_id = str(get_jwt_identity())
    unread = Notification.objects(user_id=user_id, is_read=False)
    for n in unread:
        n.is_read = True
        n.save()
    Notification.objects(user_id=user_id, is_read=False).update(set__is_read=True)
    return jsonify({"message": "All notifications marked as read"}), 200
