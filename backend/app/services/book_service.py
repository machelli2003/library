from app.extensions import db
from app.models import Book, Category


class BookError(Exception):
    def __init__(self, message, status_code=400):
        self.message = message
        self.status_code = status_code


def list_books(search=None, category_id=None, page=1, per_page=12):
    query = Book.objects

    if search:
        query = query.filter(
            db.Q(title__icontains=search) | db.Q(author__icontains=search)
        )

    if category_id:
        query = query.filter(category_id=category_id)

    # Count total before pagination
    total = query.count()

    # Paginate
    skip = (page - 1) * per_page
    books = query.order_by("+title").skip(skip).limit(per_page).all()

    total_pages = (total + per_page - 1) // per_page if total > 0 else 1

    return books, total, page, total_pages


def get_book(book_id):
    book = Book.objects(id=book_id).first()
    if not book:
        raise BookError("Book not found", 404)
    return book


def create_book(data):
    if data.get("isbn") and Book.objects(isbn=data["isbn"]).first():
        raise BookError("A book with this ISBN already exists", 409)

    # Denormalize category name for performance
    category_name = None
    category_id = data.get("category_id")
    if category_id:
        category = Category.objects(id=category_id).first()
        if category:
            category_name = category.name

    book = Book(
        title=data["title"],
        author=data["author"],
        isbn=data.get("isbn"),
        category_id=category_id,
        category_name=category_name,
        quantity=data["quantity"],
        available_copies=data["quantity"],
        description=data.get("description"),
        cover_url=data.get("cover_url"),
    )
    book.save()
    return book


def update_book(book_id, data):
    book = get_book(book_id)

    if "quantity" in data:
        delta = data["quantity"] - book.quantity
        book.quantity = data["quantity"]
        book.available_copies = max(0, book.available_copies + delta)

    for field in ("title", "author", "isbn", "description", "cover_url"):
        if field in data:
            setattr(book, field, data[field])

    if "category_id" in data:
        book.category_id = data["category_id"]
        if data["category_id"]:
            category = Category.objects(id=data["category_id"]).first()
            book.category_name = category.name if category else None
        else:
            book.category_name = None

    book.save()
    return book


def delete_book(book_id):
    book = get_book(book_id)
    book.delete()

