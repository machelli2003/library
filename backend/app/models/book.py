from datetime import datetime
from app.extensions import db


class Book(db.Document):
    meta = {
        "collection": "books",
        "indexes": [
            "category_id",
            "category_name",
            "available_copies",
            "created_at",
            [("title", 1), ("author", 1)],
        ],
    }

    title = db.StringField(max_length=200, required=True)
    author = db.StringField(max_length=150, required=True)
    isbn = db.StringField(max_length=20, unique=True, sparse=True, null=True)
    category_id = db.StringField(null=True)  # stores Category.id as string
    category_name = db.StringField(max_length=80, null=True)  # denormalized for performance
    quantity = db.IntField(default=1, required=True)
    available_copies = db.IntField(default=1, required=True)
    description = db.StringField(null=True)
    cover_url = db.StringField(max_length=255, null=True)
    created_at = db.DateTimeField(default=datetime.utcnow)

    @property
    def is_available(self):
        return self.available_copies > 0

    def to_dict(self):
        avg_rating, review_count = self._get_rating_stats()
        return {
            "id": str(self.id),
            "title": self.title,
            "author": self.author,
            "isbn": self.isbn,
            "category": self.category_name,
            "category_id": self.category_id,
            "quantity": self.quantity,
            "available_copies": self.available_copies,
            "is_available": self.is_available,
            "description": self.description,
            "cover_url": self.cover_url,
            "average_rating": avg_rating,
            "review_count": review_count,
        }

    def _get_rating_stats(self):
        from app.models.review import Review
        reviews = list(Review.objects(book_id=str(self.id)))
        if not reviews:
            return 0.0, 0
        ratings = [r.rating for r in reviews if r.rating]
        avg = round(sum(ratings) / len(ratings), 1) if ratings else 0.0
        return avg, len(ratings)

    def __repr__(self):
        return f"<Book {self.title}>"

