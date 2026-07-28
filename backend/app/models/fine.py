from datetime import datetime
from app.extensions import db


class Fine(db.Document):
    meta = {
        "collection": "fines",
        "indexes": [
            "borrow_record_id",
            "user_id",
            "status",
            "created_at",
            [("user_id", 1), ("status", 1)],
        ],
    }

    borrow_record_id = db.StringField(required=True)  # BorrowRecord.id as string
    user_id = db.StringField(null=True)  # denormalized for easier queries
    user_name = db.StringField(max_length=100, null=True)
    user_email = db.StringField(max_length=150, null=True)
    book_title = db.StringField(max_length=200, null=True)
    amount = db.DecimalField(precision=8, scale=2, required=True)
    status = db.StringField(max_length=20, choices=("unpaid", "paid"), default="unpaid")
    paid_at = db.DateTimeField(null=True)
    created_at = db.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "borrow_record_id": self.borrow_record_id,
            "amount": float(self.amount),
            "status": self.status,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
            "user_name": self.user_name,
            "user_email": self.user_email,
            "book_title": self.book_title,
        }

    def __repr__(self):
        return f"<Fine {self.id} ${self.amount}>"

