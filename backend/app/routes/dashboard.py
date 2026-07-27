from datetime import date, timedelta
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Book, BorrowRecord, Fine, User, Category
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

    unpaid_fines_amount = (
        db.session.query(db.func.coalesce(db.func.sum(Fine.amount), 0))
        .join(BorrowRecord)
        .filter(BorrowRecord.user_id == user_id, Fine.status == "unpaid")
        .scalar()
    )

    available_books = Book.query.filter(Book.available_copies > 0).count()

    total_borrowed_all_time = BorrowRecord.query.filter_by(user_id=user_id).count()

    pending_requests = BorrowRecord.query.filter_by(
        user_id=user_id, status="pending"
    ).count()

    return jsonify({
        "books_borrowed": active_borrows,
        "due_soon": due_soon,
        "outstanding_fines": float(unpaid_fines_amount),
        "available_books": available_books,
        "total_borrowed_all_time": total_borrowed_all_time,
        "pending_requests": pending_requests,
    }), 200


@dashboard_bp.get("/librarian")
@role_required("librarian", "admin")
def librarian_stats():
    from sqlalchemy import func

    pending_requests = BorrowRecord.query.filter_by(status="pending").count()
    overdue_books = BorrowRecord.query.filter_by(status="overdue").count()
    total_books = Book.query.count()
    unpaid_fines_amount = (
        db.session.query(func.coalesce(func.sum(Fine.amount), 0))
        .filter_by(status="unpaid")
        .scalar()
    )

    # Books borrowed this month
    first_of_month = date.today().replace(day=1)
    borrowed_this_month = BorrowRecord.query.filter(
        BorrowRecord.borrow_date >= first_of_month,
        BorrowRecord.status.in_(("borrowed", "returned", "overdue")),
    ).count()

    # Total active borrowers (unique users with borrowed/overdue books)
    active_borrowers = (
        db.session.query(func.count(db.distinct(BorrowRecord.user_id)))
        .filter(BorrowRecord.status.in_(("borrowed", "overdue")))
        .scalar()
    )

    # Most popular category
    most_popular_category = (
        db.session.query(Category.name, func.count(BorrowRecord.id).label("total"))
        .join(Book, Book.category_id == Category.id)
        .join(BorrowRecord, BorrowRecord.book_id == Book.id)
        .group_by(Category.name)
        .order_by(func.count(BorrowRecord.id).desc())
        .first()
    )

    return jsonify({
        "pending_requests": pending_requests,
        "overdue_books": overdue_books,
        "total_books": total_books,
        "unpaid_fines": float(unpaid_fines_amount),
        "borrowed_this_month": borrowed_this_month,
        "active_borrowers": active_borrowers,
        "most_popular_category": most_popular_category[0] if most_popular_category else "N/A",
    }), 200


@dashboard_bp.get("/admin")
@role_required("admin")
def admin_stats():
    from sqlalchemy import func

    today = date.today()

    total_users = User.query.count()
    total_librarians = User.query.filter_by(role="librarian").count()
    total_students = User.query.filter_by(role="student").count()
    total_books = Book.query.count()
    active_borrows = BorrowRecord.query.filter(
        BorrowRecord.status.in_(("borrowed", "overdue"))
    ).count()

    # New users this month
    first_of_month = today.replace(day=1)
    new_users_this_month = User.query.filter(
        User.created_at >= first_of_month
    ).count()

    # New books this month
    new_books_this_month = Book.query.filter(
        Book.created_at >= first_of_month
    ).count()

    # Total fine collected
    total_fine_collected = (
        db.session.query(func.coalesce(func.sum(Fine.amount), 0))
        .filter_by(status="paid")
        .scalar()
    )

    # Total outstanding fines
    total_fine_outstanding = (
        db.session.query(func.coalesce(func.sum(Fine.amount), 0))
        .filter_by(status="unpaid")
        .scalar()
    )

    # Borrows today
    borrows_today = BorrowRecord.query.filter(
        func.date(BorrowRecord.created_at) == today
    ).count()

    return jsonify({
        "total_users": total_users,
        "total_librarians": total_librarians,
        "total_students": total_students,
        "total_books": total_books,
        "active_borrows": active_borrows,
        "new_users_this_month": new_users_this_month,
        "new_books_this_month": new_books_this_month,
        "total_fine_collected": float(total_fine_collected),
        "total_fine_outstanding": float(total_fine_outstanding),
        "borrows_today": borrows_today,
    }), 200


@dashboard_bp.get("/admin/reports")
@role_required("admin", "librarian")
def admin_reports():
    from sqlalchemy import func

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

    # 4. Least Borrowed Books (bottom 5)
    least_borrowed_data = (
        db.session.query(Book.title, func.count(BorrowRecord.id))
        .outerjoin(BorrowRecord, BorrowRecord.book_id == Book.id)
        .group_by(Book.title)
        .order_by(func.count(BorrowRecord.id).asc())
        .limit(5)
        .all()
    )
    least_borrowed = [{"name": title, "borrows": count} for title, count in least_borrowed_data]

    # 5. Fine Metrics
    paid_fines = db.session.query(func.sum(Fine.amount)).filter_by(status="paid").scalar() or 0
    unpaid_fines = db.session.query(func.sum(Fine.amount)).filter_by(status="unpaid").scalar() or 0
    fine_metrics = [
        {"name": "Paid", "value": float(paid_fines)},
        {"name": "Unpaid", "value": float(unpaid_fines)},
    ]

    # 6. Overdue books by category
    overdue_by_category = (
        db.session.query(Category.name, func.count(BorrowRecord.id))
        .join(Book, Book.category_id == Category.id)
        .join(BorrowRecord, BorrowRecord.book_id == Book.id)
        .filter(BorrowRecord.status == "overdue")
        .group_by(Category.name)
        .all()
    )
    overdue_category_data = [{"name": name, "value": count} for name, count in overdue_by_category]

    # 7. Recent registrations (last 10)
    recent_users = User.query.order_by(User.created_at.desc()).limit(10).all()
    recent_registrations = [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in recent_users
    ]

    return jsonify({
        "by_category": by_category,
        "monthly_activity": monthly_activity,
        "top_books": top_books,
        "least_borrowed": least_borrowed,
        "fine_metrics": fine_metrics,
        "total_fine_collected": float(paid_fines),
        "total_fine_outstanding": float(unpaid_fines),
        "overdue_by_category": overdue_category_data,
        "recent_registrations": recent_registrations,
    }), 200


@dashboard_bp.get("/activities")
@role_required("admin")
def recent_activities():
    from app.models.activity_log import ActivityLog
    logs = ActivityLog.query.order_by(ActivityLog.timestamp.desc()).limit(50).all()
    return jsonify([log.to_dict() for log in logs]), 200


@dashboard_bp.get("/admin/recent-users")
@role_required("admin")
def recent_users():
    users = User.query.order_by(User.created_at.desc()).limit(10).all()
    return jsonify([u.to_dict() for u in users]), 200


@dashboard_bp.get("/admin/export/fines")
@role_required("admin", "librarian")
def export_fines_csv():
    """Export fine management records as downloadable CSV."""
    import csv
    import io
    from flask import Response

    fines = Fine.query.all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Fine ID", "Borrow Record ID", "Amount (GHS)", "Status", "Paid At", "Created At"])

    for f in fines:
        writer.writerow([
            f.id,
            f.borrow_record_id,
            f.amount,
            f.status,
            f.paid_at.isoformat() if f.paid_at else "",
            f.created_at.isoformat() if f.created_at else ""
        ])

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=fines_report.csv"}
    )


@dashboard_bp.get("/admin/export/borrows")
@role_required("admin", "librarian")
def export_borrows_csv():
    """Export circulation borrow records as downloadable CSV."""
    import csv
    import io
    from flask import Response

    records = BorrowRecord.query.all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Record ID", "User ID", "Book ID", "Status", "Borrow Date", "Due Date", "Returned At"])

    for r in records:
        writer.writerow([
            r.id,
            r.user_id,
            r.book_id,
            r.status,
            r.borrow_date.isoformat() if r.borrow_date else "",
            r.due_date.isoformat() if r.due_date else "",
            r.returned_at.isoformat() if r.returned_at else ""
        ])

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=borrow_activity_report.csv"}
    )

