from datetime import date, timedelta
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Book, BorrowRecord, Fine, User
from app.utils.decorators import role_required

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/student")
@role_required("student")
def student_stats():
    user_id = get_jwt_identity()

    active_borrows = BorrowRecord.query.filter(
        BorrowRecord.user_id == user_id,
        BorrowRecord.status.in_(("borrowed", "overdue")),
    ).count()

    due_soon_cutoff = date.today() + timedelta(days=2)
    due_soon = BorrowRecord.query.filter(
        BorrowRecord.user_id == user_id,
        BorrowRecord.status == "borrowed",
        BorrowRecord.due_date <= due_soon_cutoff,
    ).count()

    unpaid_fines = (
        Fine.query.join(BorrowRecord)
        .filter(BorrowRecord.user_id == user_id, Fine.status == "unpaid")
        .count()
    )

    available_books = Book.query.filter(Book.available_copies > 0).count()

    return jsonify({
        "books_borrowed": active_borrows,
        "due_soon": due_soon,
        "outstanding_fines": unpaid_fines,
        "available_books": available_books,
    }), 200


@dashboard_bp.get("/librarian")
@role_required("librarian", "admin")
def librarian_stats():
    return jsonify({
        "pending_requests": BorrowRecord.query.filter_by(status="pending").count(),
        "overdue_books": BorrowRecord.query.filter_by(status="overdue").count(),
        "total_books": Book.query.count(),
        "unpaid_fines": Fine.query.filter_by(status="unpaid").count(),
    }), 200


@dashboard_bp.get("/admin")
@role_required("admin")
def admin_stats():
    return jsonify({
        "total_users": User.query.count(),
        "total_librarians": User.query.filter_by(role="librarian").count(),
        "total_books": Book.query.count(),
        "active_borrows": BorrowRecord.query.filter(
            BorrowRecord.status.in_(("borrowed", "overdue"))
        ).count(),
    }), 200


@dashboard_bp.get("/admin/reports")
@role_required("admin", "librarian")
def admin_reports():
    from sqlalchemy import func
    from app.models import Category

    # 1. Borrows by Category
    category_data = (
        db.session.query(Category.name, func.count(BorrowRecord.id))
        .join(Book, Book.category_id == Category.id)
        .join(BorrowRecord, BorrowRecord.book_id == Book.id)
        .group_by(Category.name)
        .all()
    )
    by_category = [{"name": name, "value": count} for name, count in category_data]

    # 2. Monthly Borrow Activity (last 6 months)
    six_months_ago = date.today() - timedelta(days=180)
    borrows = BorrowRecord.query.filter(BorrowRecord.borrow_date >= six_months_ago).all()
    months_stats = {}
    for i in range(5, -1, -1):
        m = (date.today() - timedelta(days=i * 30)).strftime("%b")
        months_stats[m] = 0
    for b in borrows:
        if b.borrow_date:
            m = b.borrow_date.strftime("%b")
            if m in months_stats:
                months_stats[m] += 1
    monthly_activity = [{"name": m, "borrows": count} for m, count in months_stats.items()]

    # 3. Top 5 Borrowed Books
    top_books_data = (
        db.session.query(Book.title, func.count(BorrowRecord.id))
        .join(BorrowRecord, BorrowRecord.book_id == Book.id)
        .group_by(Book.title)
        .order_by(func.count(BorrowRecord.id).desc())
        .limit(5)
        .all()
    )
    top_books = [{"name": title, "borrows": count} for title, count in top_books_data]

    # 4. Fine Metrics
    paid_fines = db.session.query(func.sum(Fine.amount)).filter_by(status="paid").scalar() or 0
    unpaid_fines = db.session.query(func.sum(Fine.amount)).filter_by(status="unpaid").scalar() or 0
    fine_metrics = [
        {"name": "Paid", "value": float(paid_fines)},
        {"name": "Unpaid", "value": float(unpaid_fines)},
    ]

    return jsonify({
        "by_category": by_category,
        "monthly_activity": monthly_activity,
        "top_books": top_books,
        "fine_metrics": fine_metrics,
        "total_fine_collected": float(paid_fines),
        "total_fine_outstanding": float(unpaid_fines),
    }), 200


@dashboard_bp.get("/activities")
@role_required("admin")
def recent_activities():
    from app.models.activity_log import ActivityLog
    logs = ActivityLog.query.order_by(ActivityLog.timestamp.desc()).limit(20).all()
    return jsonify([log.to_dict() for log in logs]), 200
