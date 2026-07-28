import logging
from datetime import datetime, timedelta
from decimal import Decimal
from app.extensions import db
from app.models import BorrowRecord, Book, Fine, Notification, Reservation, User

logger = logging.getLogger(__name__)


def _send_notification(notif):
    notif.save()
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
    book = Book.objects(id=book_id).first()
    if not book:
        raise BorrowError("Book not found", 404)
    if not book.is_available:
        raise BorrowError("No copies available for this book", 409)

    active_count = BorrowRecord.objects(
        user_id=user_id,
        status__in=("pending", "approved", "borrowed"),
    ).count()
    if active_count >= MAX_ACTIVE_BORROWS_PER_STUDENT:
        raise BorrowError(
            f"You already have {MAX_ACTIVE_BORROWS_PER_STUDENT} active borrows", 409
        )

    existing = BorrowRecord.objects(
        user_id=user_id,
        book_id=book_id,
        status__in=("pending", "approved", "borrowed"),
    ).first()
    if existing:
        raise BorrowError("You already have an active request for this book", 409)

    user = User.objects(id=user_id).first()

    record = BorrowRecord(
        user_id=user_id,
        user_name=user.name if user else None,
        book_id=book_id,
        book_title=book.title,
        status="pending",
    )
    record.save()
    return record


def approve_borrow(record_id):
    record = _get_record(record_id)
    if record.status != "pending":
        raise BorrowError("Only pending requests can be approved", 409)

    book = Book.objects(id=record.book_id).first()
    if not book or not book.is_available:
        raise BorrowError("No copies available for this book", 409)

    book.available_copies -= 1
    book.save()

    record.status = "borrowed"
    record.borrow_date = datetime.utcnow()
    record.due_date = datetime.utcnow() + timedelta(days=BORROW_PERIOD_DAYS)
    record.save()

    # Notify the student
    notif = Notification(
        user_id=record.user_id,
        message=f'Your request to borrow "{record.book_title}" has been approved. Due {record.due_date.date()}.',
        type="borrow",
    )
    _send_notification(notif)

    logger.info(f"Borrow record {record.id} approved (book_id={book.id}, user_id={record.user_id})")
    return record


def reject_borrow(record_id):
    record = _get_record(record_id)
    if record.status != "pending":
        raise BorrowError("Only pending requests can be rejected", 409)

    record.status = "rejected"
    record.save()

    notif = Notification(
        user_id=record.user_id,
        message=f'Your borrow request for "{record.book_title}" was not approved.',
        type="rejection",
    )
    _send_notification(notif)

    return record


def return_book(record_id):
    record = _get_record(record_id)
    if record.status not in ("borrowed", "overdue"):
        raise BorrowError("This book isn't currently borrowed", 409)

    record.return_date = datetime.utcnow()
    record.status = "returned"
    record.save()

    # Check for oldest pending reservation on this book
    res = (
        Reservation.objects(book_id=record.book_id, status="pending")
        .order_by("+created_at")
        .first()
    )
    if res:
        res.status = "fulfilled"
        res.save()

        # Auto-create pending borrow request for the student who held it
        user = User.objects(id=res.user_id).first()
        new_borrow = BorrowRecord(
            user_id=res.user_id,
            user_name=user.name if user else None,
            book_id=record.book_id,
            book_title=record.book_title,
            status="pending",
        )
        new_borrow.save()

        notif = Notification(
            user_id=res.user_id,
            message=f'Your reservation for "{record.book_title}" has been fulfilled! A borrow request has been auto-submitted for approval.',
            type="borrow",
        )
        _send_notification(notif)
        logger.info(f"Reservation {res.id} fulfilled for user {res.user_id}")
    else:
        book = Book.objects(id=record.book_id).first()
        if book:
            book.available_copies += 1
            book.save()

    # Check for late return and create fine
    if record.due_date and record.return_date > record.due_date:
        days_late = (record.return_date - record.due_date).days
        amount = FINE_RATE_PER_DAY * days_late
        user = User.objects(id=record.user_id).first()
        fine = Fine(
            borrow_record_id=str(record.id),
            user_id=record.user_id,
            user_name=user.name if user else None,
            user_email=user.email if user else None,
            book_title=record.book_title,
            amount=amount,
            status="unpaid",
        )
        fine.save()
        logger.info(f"Fine created for borrow record {record.id}: GHS {amount} ({days_late} days late)")

        notif = Notification(
            user_id=record.user_id,
            message=f'A fine of GHS {float(amount):.2f} has been applied for the late return of "{record.book_title}" ({days_late} day(s) overdue).',
            type="fine",
        )
        _send_notification(notif)

    logger.info(f"Borrow record {record.id} returned")
    return record


def renew_borrow(record_id, user_id):
    record = _get_record(record_id)

    if record.user_id != user_id:
        raise BorrowError("You can only renew your own loans", 403)
    if record.status != "borrowed":
        raise BorrowError("Only currently borrowed books can be renewed", 409)
    if record.renewed:
        raise BorrowError("This loan has already been renewed once", 409)

    record.due_date = record.due_date + timedelta(days=RENEWAL_DAYS)
    record.renewed = True
    record.save()

    logger.info(f"Borrow record {record.id} renewed by user {user_id}, new due_date={record.due_date}")
    return record


def mark_overdue_records():
    """Flip borrowed records past their due_date to 'overdue'."""
    now = datetime.utcnow()
    overdue = BorrowRecord.objects(
        status="borrowed",
        due_date__lt=now,
    ).all()
    for record in overdue:
        record.status = "overdue"
        record.save()
        notif = Notification(
            user_id=record.user_id,
            message=f'Your loan of "{record.book_title}" is overdue. Please return it as soon as possible to avoid additional fines.',
            type="overdue",
        )
        _send_notification(notif)
    return len(overdue)


def _get_record(record_id):
    record = BorrowRecord.objects(id=record_id).first()
    if not record:
        raise BorrowError("Borrow record not found", 404)
    return record


def get_user_history(user_id):
    return BorrowRecord.objects(user_id=user_id).order_by("-created_at").all()


def get_pending_requests():
    return BorrowRecord.objects(status="pending").order_by("+created_at").all()

