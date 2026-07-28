from app import create_app
from app.models import User, Book, Category, BorrowRecord, Fine, Notification, Reservation, Review, ActivityLog


def main():
    app = create_app()
    with app.app_context():
        # Ensure indexes exist for all MongoEngine models
        for model in [User, Book, Category, BorrowRecord, Fine, Notification, Reservation, Review, ActivityLog]:
            model.ensure_indexes()
        print("✅ MongoDB Atlas connection verified and indexes ensured.")


if __name__ == "__main__":
    main()

