from datetime import datetime
from app.extensions import db


class Reservation(db.Document):
    meta = {
        "collection": "reservations",
        "indexes": [
            "user_id",
            "book_id",
            "status",
            "created_at",
            [("user_id", 1), ("book_id", 1)],
        ],
    }

    user_id = db.StringField(required=True)  # User.id as string
    book_id = db.StringField(required=True)  # Book.id as string
    book_title = db.StringField(max_length=200, null=True)  # denormalized
    book_author = db.StringField(max_length=150, null=True)  # denormalized
    status = db.StringField(max_length=50, default="pending", choices=("pending", "fulfilled", "cancelled"))
    created_at = db.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": self.user_id,
            "book_id": self.book_id,
            "book_title": self.book_title,
            "book_author": self.book_author,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Reservation {self.id}>"

