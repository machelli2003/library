from app.extensions import db


class Fine(db.Model):
    __tablename__ = "fines"

    id = db.Column(db.Integer, primary_key=True)
    borrow_record_id = db.Column(
        db.Integer, db.ForeignKey("borrow_records.id", ondelete="CASCADE"), nullable=False
    )
    amount = db.Column(db.Numeric(8, 2), nullable=False)
    status = db.Column(db.Enum("unpaid", "paid", name="fine_status"), default="unpaid")
    paid_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        borrow = self.borrow_record
        user = borrow.user if borrow else None
        book = borrow.book if borrow else None
        return {
            "id": self.id,
            "borrow_record_id": self.borrow_record_id,
            "amount": float(self.amount),
            "status": self.status,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
            "user_name": user.name if user else None,
            "user_email": user.email if user else None,
            "book_title": book.title if book else None,
        }
