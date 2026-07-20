from datetime import datetime
from app.extensions import db


class Reservation(db.Model):
    __tablename__ = "reservations"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    book_id = db.Column(
        db.Integer, db.ForeignKey("books.id", ondelete="CASCADE"), nullable=False
    )
    status = db.Column(db.String(50), default="pending", nullable=False)  # 'pending', 'fulfilled', 'cancelled'
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship("User", backref=db.backref("reservations", lazy=True))
    book = db.relationship("Book", backref=db.backref("reservations", lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "book_id": self.book_id,
            "book_title": self.book.title if self.book else None,
            "book_author": self.book.author if self.book else None,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }