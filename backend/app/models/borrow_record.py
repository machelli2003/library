from datetime import datetime
from app.extensions import db

BORROW_STATUSES = ("pending", "approved", "rejected", "borrowed", "returned", "overdue")


class BorrowRecord(db.Document):
    meta = {
        "collection": "borrow_records",
        "indexes": [
            "user_id",
            "book_id",
            "status",
            "due_date",
            "borrow_date",
            "created_at",
            [("user_id", 1), ("status", 1)],
        ],
    }

    user_id = db.StringField(required=True)  # User.id as string
    user_name = db.StringField(max_length=100, null=True)  # denormalized
    book_id = db.StringField(required=True)  # Book.id as string
    book_title = db.StringField(max_length=200, null=True)  # denormalized
    borrow_date = db.DateTimeField(null=True)
    due_date = db.DateTimeField(null=True)
    return_date = db.DateTimeField(null=True)
    status = db.StringField(max_length=20, choices=BORROW_STATUSES, default="pending")
    renewed = db.BooleanField(default=False)
    created_at = db.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": self.user_id,
            "user_name": self.user_name,
            "book_id": self.book_id,
            "book_title": self.book_title,
            "borrow_date": self.borrow_date.isoformat() if self.borrow_date else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "return_date": self.return_date.isoformat() if self.return_date else None,
            "status": self.status,
            "renewed": self.renewed,
        }

    def __repr__(self):
        return f"<BorrowRecord {self.id}>"

