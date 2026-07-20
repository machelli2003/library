"""
Run with:
    flask shell
    >>> from app.seed import run_seed
    >>> run_seed()
"""
from app.extensions import db
from app.models import User, StudentProfile, Category, Book


def run_seed():
    categories_data = ["Computer Science", "Mathematics", "Literature", "Engineering", "Business"]
    categories = {}
    for name in categories_data:
        cat = Category.query.filter_by(name=name).first()
        if not cat:
            cat = Category(name=name)
            db.session.add(cat)
            db.session.flush()
        categories[name] = cat

    books_data = [
        ("Introduction to Algorithms", "Cormen, Leiserson, Rivest", "9780262033848", "Computer Science", 3),
        ("Clean Code", "Robert C. Martin", "9780132350884", "Computer Science", 2),
        ("Calculus: Early Transcendentals", "James Stewart", "9781285741550", "Mathematics", 4),
        ("Things Fall Apart", "Chinua Achebe", "9780385474542", "Literature", 5),
        ("The Lean Startup", "Eric Ries", "9780307887894", "Business", 2),
    ]
    for title, author, isbn, category_name, qty in books_data:
        if not Book.query.filter_by(isbn=isbn).first():
            book = Book(
                title=title,
                author=author,
                isbn=isbn,
                category_id=categories[category_name].id,
                quantity=qty,
                available_copies=qty,
            )
            db.session.add(book)

    if not User.query.filter_by(email="librarian@uni.edu").first():
        librarian = User(name="Ama Serwaa", email="librarian@uni.edu", role="librarian")
        librarian.set_password("password123")
        db.session.add(librarian)

    if not User.query.filter_by(email="admin@uni.edu").first():
        admin = User(name="System Admin", email="admin@uni.edu", role="admin")
        admin.set_password("password123")
        db.session.add(admin)

    if not User.query.filter_by(email="student@uni.edu").first():
        student = User(name="Kwame Boateng", email="student@uni.edu", role="student")
        student.set_password("password123")
        db.session.add(student)
        db.session.flush()
        db.session.add(StudentProfile(user_id=student.id, student_id="UG/2024/0123", program="BSc Computer Science"))

    db.session.commit()
    print("Seed complete: 5 categories, 5 books, 3 users (student/librarian/admin)")
