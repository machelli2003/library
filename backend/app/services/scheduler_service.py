import threading
import time
from datetime import date, timedelta
from app.extensions import db
from app.models import BorrowRecord, Notification, Book

def check_due_dates_and_notify(app):
    """Scan active borrow records and create due-soon & overdue notifications."""
    with app.app_context():
        today = date.today()
        due_soon_cutoff = today + timedelta(days=2)

        # 1. Check for books due in <= 2 days
        due_soon_records = BorrowRecord.query.filter(
            BorrowRecord.status == "borrowed",
            BorrowRecord.due_date <= due_soon_cutoff,
            BorrowRecord.due_date >= today
        ).all()

        for rec in due_soon_records:
            book = Book.query.get(rec.book_id)
            title = book.title if book else "your borrowed book"
            msg = f"Reminder: '{title}' is due on {rec.due_date}. Please return or renew on time."
            
            # Prevent duplicate unread notifications
            existing = Notification.query.filter_by(
                user_id=rec.user_id,
                message=msg,
                is_read=False
            ).first()

            if not existing:
                notif = Notification(
                    user_id=rec.user_id,
                    message=msg,
                    type="borrow"
                )
                db.session.add(notif)

        # 2. Check for newly overdue books
        overdue_records = BorrowRecord.query.filter(
            BorrowRecord.status == "borrowed",
            BorrowRecord.due_date < today
        ).all()

        for rec in overdue_records:
            rec.status = "overdue"
            book = Book.query.get(rec.book_id)
            title = book.title if book else "your borrowed book"
            msg = f"URGENT: '{title}' was due on {rec.due_date} and is now overdue."

            existing = Notification.query.filter_by(
                user_id=rec.user_id,
                message=msg,
                is_read=False
            ).first()

            if not existing:
                notif = Notification(
                    user_id=rec.user_id,
                    message=msg,
                    type="overdue"
                )
                db.session.add(notif)

        db.session.commit()


def start_background_scheduler(app):
    """Start periodic background thread checking due dates every hour."""
    def run_loop():
        while True:
            try:
                check_due_dates_and_notify(app)
            except Exception as e:
                app.logger.error(f"Error in scheduler: {e}")
            time.sleep(3600)

    t = threading.Thread(target=run_loop, daemon=True)
    t.start()
