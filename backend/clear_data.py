"""
Clear all seeded/mock data from the MongoDB database.

Run with:
    python clear_data.py
"""
from app import create_app
from app.models import (
    User,
    Category,
    Book,
    BorrowRecord,
    Fine,
    Notification,
    Reservation,
    Review,
    ActivityLog,
)


def clear_data():
    app = create_app()
    with app.app_context():
        models = [
            ActivityLog,
            Notification,
            Fine,
            Review,
            Reservation,
            BorrowRecord,
            Book,
            Category,
            User,
        ]

        for model in models:
            model.drop_collection()
            print(f"  ✔ Cleared collection: {model._get_collection_name()}")

        print("\n✅ All mock/seed data cleared from MongoDB. Database is now pristine.")


if __name__ == "__main__":
    clear_data()


