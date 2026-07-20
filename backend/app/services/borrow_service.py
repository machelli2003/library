import logging
from datetime import date, timedelta
from decimal import Decimal
from app.extensions import db
from app.models import BorrowRecord, Book, Fine, Notification, Reservation

logger = logging.getLogger(__name__)


def _send_notification(notif):
    db.session.add(notif)
    db.session.flush()  # Populates DB fields (e.g. ID, created_at)
    try:
        from app.extensions import socketio
        socketio.emit("new_notification", notif.to_dict(), to=f"user_{notif.user_id}")
    except Exception as e:
        logger.error(f"WebSocket emit error: {e}")

BORROW_PERIOD_DAYS = 14
FINE_RATE_PER_DAY = Decimal("2.00")  # GHS 2 per day late
MAX_ACTIVE_BORROWS_PER_STUDENT = 3
RENEWAL_DAYS = 7


class BorrowError(Exception):
    def __init__(self, message, status_code=400):
        self.message = message
        self.status_code = status_code


def request_borrow(user_id, book_id):
    book = Book.query.get(book_id)
    if not book:
        raise BorrowError("Book not found", 404)
    if not book.is_available:
        raise BorrowError("No copies available for this book", 409)

    active_count = BorrowRecord.query.filter(
        BorrowRecord.user_id == user_id,
        BorrowRecord.status.in_(("pending", "approved", "borrowed")),
    ).count()
    if active_count >= MAX_ACTIVE_BORROWS_PER_STUDENT:
        raise BorrowError(
            f"You already have {MAX_ACTIVE_BORROWS_PER_STUDENT} active borrows", 409
        )

    existing = BorrowRecord.query.filter(
        BorrowRecord.user_id == user_id,
        BorrowRecord.book_id == book_id,
        BorrowRecord.status.in_(("pending", "approved", "borrowed")),
    ).first()
    if existing:
        raise BorrowError("You already have an active request for this book", 409)

    record = BorrowRecord(user_id=user_id, book_id=book_id, status="pending")
    db.session.add(record)
    db.session.commit()
    return record


def approve_borrow(record_id):
    record = _get_record(record_id)
    if record.status != "pending":
        raise BorrowError("Only pending requests can be approved", 409)

    book = record.book
    if not book.is_available:
        raise BorrowError("No copies available for this book", 409)

    book.available_copies -= 1
    record.status = "borrowed"
    record.borrow_date = date.today()
    record.due_date = date.today() + timedelta(days=BORROW_PERIOD_DAYS)

    # Notify the student their borrow was approved
    notif = Notification(
        user_id=record.user_id,
        message=f'Your request to borrow "{record.book.title}" has been approved. Due {record.due_date}.',
        type="borrow",
    )
    _send_notification(notif)

    db.session.commit()
    logger.info(f"Borrow record {record.id} approved (book_id={book.id}, user_id={record.user_id})")
    return record


def reject_borrow(record_id):
    record = _get_record(record_id)
    if record.status != "pending":
        raise BorrowError("Only pending requests can be rejected", 409)

    record.status = "rejected"

    # Notify the student their borrow was rejected
    notif = Notification(
        user_id=record.user_id,
        message=f'Your borrow request for "{record.book.title}" was not approved.',
        type="rejection",
    )
    _send_notification(notif)

    db.session.commit()
    return record


def return_book(record_id):
    record = _get_record(record_id)
    if record.status not in ("borrowed", "overdue"):
        raise BorrowError("This book isn't currently borrowed", 409)

    record.return_date = date.today()
    record.status = "returned"

    # Check for oldest pending reservation on this book
    res = (
        Reservation.query.filter_by(book_id=record.book_id, status="pending")
        .order_by(Reservation.created_at.asc())
        .first()
    )
    if res:
        res.status = "fulfilled"
        # Auto-create pending borrow request for the student who held it
        new_borrow = BorrowRecord(
            user_id=res.user_id,
            book_id=record.book_id,
            status="pending",
        )
        db.session.add(new_borrow)

        notif = Notification(
            user_id=res.user_id,
            message=f'Your reservation for "{record.book.title}" has been fulfilled! A borrow request has been auto-submitted for approval.',
            type="borrow",
        )
        _send_notification(notif)
        logger.info(f"Reservation {res.id} fulfilled for user {res.user_id}")
    else:
        record.book.available_copies += 1

    if record.due_date and record.return_date > record.due_date:
        days_late = (record.return_date - record.due_date).days
        amount = FINE_RATE_PER_DAY * days_late
        fine = Fine(borrow_record_id=record.id, amount=amount, status="unpaid")
        db.session.add(fine)
        logger.info(f"Fine created for borrow record {record.id}: GHS {amount} ({days_late} days late)")

        # Notify student about the fine
        notif = Notification(
            user_id=record.user_id,
            message=f'A fine of GHS {float(amount):.2f} has been applied for the late return of "{record.book.title}" ({days_late} day(s) overdue).',
            type="fine",
        )
        _send_notification(notif)

    db.session.commit()
    logger.info(f"Borrow record {record.id} returned")
    return record


def renew_borrow(record_id, user_id):
    record = _get_record(record_id)

    if record.user_id != int(user_id):
        raise BorrowError("You can only renew your own loans", 403)
    if record.status != "borrowed":
        raise BorrowError("Only currently borrowed books can be renewed", 409)
    if record.renewed:
        raise BorrowError("This loan has already been renewed once", 409)

    record.due_date = record.due_date + timedelta(days=RENEWAL_DAYS)
    record.renewed = True
    db.session.commit()

    logger.info(f"Borrow record {record.id} renewed by user {user_id}, new due_date={record.due_date}")
    return record


def mark_overdue_records():
    """Intended to run on a schedule (cron / APScheduler) — flips borrowed
    records past their due_date to 'overdue' so librarians can see them."""
    overdue = BorrowRecord.query.filter(
        BorrowRecord.status == "borrowed",
        BorrowRecord.due_date < date.today(),
    ).all()
    for record in overdue:
        record.status = "overdue"
        notif = Notification(
            user_id=record.user_id,
            message=f'Your loan of "{record.book.title}" is overdue. Please return it as soon as possible to avoid additional fines.',
            type="overdue",
        )
        _send_notification(notif)
    db.session.commit()
    return len(overdue)


def _get_record(record_id):
    record = BorrowRecord.query.get(record_id)
    if not record:
        raise BorrowError("Borrow record not found", 404)
    return record


def get_user_history(user_id):
    return BorrowRecord.query.filter_by(user_id=user_id).order_by(
        BorrowRecord.created_at.desc()
    ).all()


def get_pending_requests():
    return BorrowRecord.query.filter_by(status="pending").order_by(
        BorrowRecord.created_at.asc()
    ).all()
