from datetime import datetime
from app.extensions import db

BORROW_STATUSES = ("pending", "approved", "rejected", "borrowed", "returned", "overdue")


class BorrowRecord(db.Model):
    __tablename__ = "borrow_records"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    borrow_date = db.Column(db.Date, nullable=True)
    due_date = db.Column(db.Date, nullable=True)
    return_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.Enum(*BORROW_STATUSES, name="borrow_status"), default="pending")
    renewed = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    fines = db.relationship("Fine", backref="borrow_record", lazy=True, cascade="all, delete-orphan")
    user = db.relationship("User", backref="borrow_records")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": self.user.name if self.user else None,
            "book_id": self.book_id,
            "book_title": self.book.title if self.book else None,
            "borrow_date": self.borrow_date.isoformat() if self.borrow_date else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "return_date": self.return_date.isoformat() if self.return_date else None,
            "status": self.status,
            "renewed": self.renewed,
        }
