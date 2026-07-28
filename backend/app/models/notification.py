from datetime import datetime
from app.extensions import db


class Notification(db.Document):
    meta = {
        "collection": "notifications",
        "indexes": [
            "user_id",
            "is_read",
            "created_at",
            [("user_id", 1), ("is_read", 1)],
        ],
    }

    user_id = db.StringField(required=True)  # User.id as string
    message = db.StringField(max_length=255, required=True)
    type = db.StringField(max_length=50, required=True)  # 'borrow', 'overdue', 'fine', 'rejection'
    is_read = db.BooleanField(default=False)
    created_at = db.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": self.user_id,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Notification {self.id}>"

