from datetime import datetime
from app.extensions import db


class Review(db.Document):
    meta = {
        "collection": "reviews",
        "indexes": [
            "book_id",
            "user_id",
            "created_at",
            [("book_id", 1), ("user_id", 1)],
        ],
    }

    user_id = db.StringField(required=True)  # User.id as string
    user_name = db.StringField(max_length=100, null=True)  # denormalized
    book_id = db.StringField(required=True)  # Book.id as string
    rating = db.IntField(required=True, min_value=1, max_value=5)
    comment = db.StringField(null=True)
    created_at = db.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": self.user_id,
            "user_name": self.user_name or "Anonymous",
            "book_id": self.book_id,
            "rating": self.rating,
            "comment": self.comment,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Review {self.id}>"

