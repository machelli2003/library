import threading
import time
from datetime import datetime, timedelta
from app.extensions import db
from app.models import BorrowRecord, Notification, Book


def check_due_dates_and_notify(app):
    """Scan active borrow records and create due-soon & overdue notifications."""
    with app.app_context():
        now = datetime.utcnow()
        due_soon_cutoff = now + timedelta(days=2)

        # 1. Check for books due in <= 2 days
        due_soon_records = BorrowRecord.objects(
            status="borrowed",
            due_date__lte=due_soon_cutoff,
            due_date__gte=now,
        ).all()

        for rec in due_soon_records:
            title = rec.book_title or "your borrowed book"
            msg = f"Reminder: '{title}' is due on {rec.due_date.date()}. Please return or renew on time."

            existing = Notification.objects(
                user_id=rec.user_id,
                message=msg,
                is_read=False,
            ).first()

            if not existing:
                notif = Notification(
                    user_id=rec.user_id,
                    message=msg,
                    type="borrow",
                )
                notif.save()

        # 2. Check for newly overdue books
        overdue_records = BorrowRecord.objects(
            status="borrowed",
            due_date__lt=now,
        ).all()

        for rec in overdue_records:
            rec.status = "overdue"
            rec.save()
            title = rec.book_title or "your borrowed book"
            msg = f"URGENT: '{title}' was due on {rec.due_date.date()} and is now overdue."

            existing = Notification.objects(
                user_id=rec.user_id,
                message=msg,
                is_read=False,
            ).first()

            if not existing:
                notif = Notification(
                    user_id=rec.user_id,
                    message=msg,
                    type="overdue",
                )
                notif.save()


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

