from datetime import datetime
from app.extensions import db


class ActivityLog(db.Document):
    meta = {
        "collection": "activity_logs",
        "indexes": [
            "timestamp",
            "user_id",
            [("-timestamp", 1)],
        ],
    }

    user_id = db.StringField(null=True)  # User.id as string or None for system actions
    user_name = db.StringField(max_length=100, default="System")  # denormalized
    action = db.StringField(max_length=255, required=True)
    timestamp = db.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": self.user_id,
            "user_name": self.user_name or "System",
            "action": self.action,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }

    def __repr__(self):
        return f"<ActivityLog {self.id}>"

