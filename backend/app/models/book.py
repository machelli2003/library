from datetime import datetime
from app.extensions import db


class Book(db.Model):
    __tablename__ = "books"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(150), nullable=False)
    isbn = db.Column(db.String(20), unique=True)
    category_id = db.Column(
        db.Integer, db.ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )
    quantity = db.Column(db.Integer, nullable=False, default=1)
    available_copies = db.Column(db.Integer, nullable=False, default=1)
    description = db.Column(db.Text)
    cover_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    borrow_records = db.relationship("BorrowRecord", backref="book", lazy=True)

    @property
    def is_available(self):
        return self.available_copies > 0

    def to_dict(self):
        ratings = [r.rating for r in self.reviews] if hasattr(self, "reviews") and self.reviews else []
        avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 0.0
        review_count = len(ratings)
        return {
            "id": self.id,
            "title": self.title,
            "author": self.author,
            "isbn": self.isbn,
            "category": self.category.name if self.category else None,
            "category_id": self.category_id,
            "quantity": self.quantity,
            "available_copies": self.available_copies,
            "is_available": self.is_available,
            "description": self.description,
            "cover_url": self.cover_url,
            "average_rating": avg_rating,
            "review_count": review_count,
        }
