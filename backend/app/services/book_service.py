from app.extensions import db
from app.models import Book


class BookError(Exception):
    def __init__(self, message, status_code=400):
        self.message = message
        self.status_code = status_code


def list_books(search=None, category_id=None, page=1, per_page=12):
    query = Book.query

    if search:
        like = f"%{search}%"
        query = query.filter(db.or_(Book.title.ilike(like), Book.author.ilike(like)))

    if category_id:
        query = query.filter(Book.category_id == category_id)

    pagination = query.order_by(Book.title.asc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return pagination


def get_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        raise BookError("Book not found", 404)
    return book


def create_book(data):
    if data.get("isbn") and Book.query.filter_by(isbn=data["isbn"]).first():
        raise BookError("A book with this ISBN already exists", 409)

    book = Book(
        title=data["title"],
        author=data["author"],
        isbn=data.get("isbn"),
        category_id=data.get("category_id"),
        quantity=data["quantity"],
        available_copies=data["quantity"],  # new book starts fully available
        description=data.get("description"),
        cover_url=data.get("cover_url"),
    )
    db.session.add(book)
    db.session.commit()
    return book


def update_book(book_id, data):
    book = get_book(book_id)

    if "quantity" in data:
        # adjust available_copies by the same delta so currently-borrowed
        # copies remain accounted for correctly
        delta = data["quantity"] - book.quantity
        book.quantity = data["quantity"]
        book.available_copies = max(0, book.available_copies + delta)

    for field in ("title", "author", "isbn", "category_id", "description", "cover_url"):
        if field in data:
            setattr(book, field, data[field])

    db.session.commit()
    return book


def delete_book(book_id):
    book = get_book(book_id)
    db.session.delete(book)
    db.session.commit()
