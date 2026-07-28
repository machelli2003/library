"""
Seed MongoDB with initial data for the University Library System.

Run with:
    python seed_mongo.py
"""
from app import create_app
from app.models import User, Category, Book


def run_seed():
    app = create_app()
    with app.app_context():
        # Create categories
        categories_data = ["Computer Science", "Mathematics", "Literature", "Engineering", "Business"]
        categories = {}
        for name in categories_data:
            cat = Category.objects(name=name).first()
            if not cat:
                cat = Category(name=name)
                cat.save()
            categories[name] = cat

        # Create books
        books_data = [
            ("Introduction to Algorithms", "Cormen, Leiserson, Rivest", "9780262033848", "Computer Science", 3),
            ("Clean Code", "Robert C. Martin", "9780132350884", "Computer Science", 2),
            ("Calculus: Early Transcendentals", "James Stewart", "9781285741550", "Mathematics", 4),
            ("Things Fall Apart", "Chinua Achebe", "9780385474542", "Literature", 5),
            ("The Lean Startup", "Eric Ries", "9780307887894", "Business", 2),
        ]
        for title, author, isbn, category_name, qty in books_data:
            if not Book.objects(isbn=isbn).first():
                cat = categories[category_name]
                book = Book(
                    title=title,
                    author=author,
                    isbn=isbn,
                    category_id=str(cat.id),
                    category_name=category_name,
                    quantity=qty,
                    available_copies=qty,
                )
                book.save()

        # Create users
        if not User.objects(email="muna@librarian.edu").first():
            librarian = User(name="Muna", email="muna@librarian.edu", role="librarian")
            librarian.set_password("password123")
            librarian.save()

        if not User.objects(email="muna@admin.edu").first():
            admin = User(name="System Admin", email="muna@admin.edu", role="admin")
            admin.set_password("password123")
            admin.save()

        if not User.objects(email="muna@student.edu").first():
            student = User(
                name="Maymuna Faisal",
                email="muna@student.edu",
                role="student",
                student_id="SML/2024/001",
                program="BSc Library and Information Science",
            )
            student.set_password("password123")
            student.save()

        print("✅ MongoDB seed complete: 5 categories, 5 books, 3 users (student/librarian/admin)")


if __name__ == "__main__":
    run_seed()
