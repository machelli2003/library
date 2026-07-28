from datetime import datetime, timedelta
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import Book, BorrowRecord, Fine, User, Category, ActivityLog
from app.utils.decorators import role_required

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/student")
@role_required("student")
def student_stats():
    user_id = str(get_jwt_identity())
    now = datetime.utcnow()

    active_borrows = BorrowRecord.objects(
        user_id=user_id,
        status__in=("borrowed", "overdue"),
    ).count()

    due_soon_cutoff = now + timedelta(days=2)
    due_soon = BorrowRecord.objects(
        user_id=user_id,
        status="borrowed",
        due_date__lte=due_soon_cutoff,
    ).count()

    # Sum up unpaid fines via borrowing records
    user_borrows = BorrowRecord.objects(user_id=user_id).all()
    borrow_ids = [str(r.id) for r in user_borrows]
    unpaid_fines_amount = 0
    if borrow_ids:
        unpaid_fines = Fine.objects(borrow_record_id__in=borrow_ids, status="unpaid")
        for f in unpaid_fines:
            unpaid_fines_amount += float(f.amount)

    available_books = Book.objects(available_copies__gt=0).count()
    total_borrowed_all_time = BorrowRecord.objects(user_id=user_id).count()
    pending_requests = BorrowRecord.objects(user_id=user_id, status="pending").count()

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
    now = datetime.utcnow()

    pending_requests = BorrowRecord.objects(status="pending").count()
    overdue_books = BorrowRecord.objects(status="overdue").count()
    total_books = Book.objects.count()
    
    unpaid_fines = Fine.objects(status="unpaid")
    unpaid_fines_amount = sum(float(f.amount) for f in unpaid_fines)

    # Books borrowed this month
    first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    borrowed_this_month = BorrowRecord.objects(
        borrow_date__gte=first_of_month,
        status__in=("borrowed", "returned", "overdue"),
    ).count()

    # Total active borrowers (unique users with borrowed/overdue books)
    active_borrow_records = BorrowRecord.objects(status__in=("borrowed", "overdue"))
    active_user_ids = set(r.user_id for r in active_borrow_records)
    active_borrowers = len(active_user_ids)

    # Most popular category
    category_counts = {}
    active_borrows_books = list(BorrowRecord.objects(status__in=("borrowed", "returned", "overdue")))
    book_ids = list(set(br.book_id for br in active_borrows_books if br.book_id))
    books_map = {str(b.id): b for b in Book.objects(id__in=book_ids)} if book_ids else {}
    for br in active_borrows_books:
        book = books_map.get(br.book_id)
        if book and book.category_name:
            category_counts[book.category_name] = category_counts.get(book.category_name, 0) + 1
    
    most_popular_category = max(category_counts, key=category_counts.get) if category_counts else "N/A"

    return jsonify({
        "pending_requests": pending_requests,
        "overdue_books": overdue_books,
        "total_books": total_books,
        "unpaid_fines": float(unpaid_fines_amount),
        "borrowed_this_month": borrowed_this_month,
        "active_borrowers": active_borrowers,
        "most_popular_category": most_popular_category,
    }), 200


@dashboard_bp.get("/admin")
@role_required("admin")
def admin_stats():
    now = datetime.utcnow()
    today = now.date()

    total_users = User.objects.count()
    total_librarians = User.objects(role="librarian").count()
    total_students = User.objects(role="student").count()
    total_books = Book.objects.count()
    active_borrows = BorrowRecord.objects(status__in=("borrowed", "overdue")).count()

    # New users this month
    first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_users_this_month = User.objects(created_at__gte=first_of_month).count()

    # New books this month
    new_books_this_month = Book.objects(created_at__gte=first_of_month).count()

    # Total fine collected
    paid_fines = Fine.objects(status="paid")
    total_fine_collected = sum(float(f.amount) for f in paid_fines)

    # Total outstanding fines
    unpaid_fines = Fine.objects(status="unpaid")
    total_fine_outstanding = sum(float(f.amount) for f in unpaid_fines)

    # Borrows today
    today_start = datetime(today.year, today.month, today.day)
    tomorrow_start = today_start + timedelta(days=1)
    borrows_today = BorrowRecord.objects(
        created_at__gte=today_start,
        created_at__lt=tomorrow_start,
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
    now = datetime.utcnow()
    today = now.date()

    all_borrows = list(BorrowRecord.objects.all())
    all_book_ids = list(set(br.book_id for br in all_borrows if br.book_id))
    books_map = {str(b.id): b for b in Book.objects(id__in=all_book_ids)} if all_book_ids else {}

    # 1. Borrows by Category
    category_data = {}
    for br in all_borrows:
        book = books_map.get(br.book_id)
        if book and book.category_name:
            category_data[book.category_name] = category_data.get(book.category_name, 0) + 1
    by_category = [{"name": name, "value": count} for name, count in category_data.items()]

    # 2. Monthly Borrow Activity (last 6 months)
    six_months_ago = now - timedelta(days=180)
    months_stats = {}
    for i in range(5, -1, -1):
        m = (now - timedelta(days=i * 30)).strftime("%b")
        months_stats[m] = 0
    
    recent_borrows = BorrowRecord.objects(borrow_date__gte=six_months_ago).all()
    for b in recent_borrows:
        if b.borrow_date:
            m = b.borrow_date.strftime("%b")
            if m in months_stats:
                months_stats[m] += 1
    monthly_activity = [{"name": m, "borrows": count} for m, count in months_stats.items()]

    # 3. Top 5 Borrowed Books (by borrow count)
    book_borrow_counts = {}
    for br in all_borrows:
        book_borrow_counts[br.book_id] = book_borrow_counts.get(br.book_id, 0) + 1
    sorted_books = sorted(book_borrow_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    top_books = []
    for book_id, count in sorted_books:
        book = books_map.get(book_id)
        if book:
            top_books.append({"name": book.title, "borrows": count})

    # 4. Least Borrowed Books (bottom 5)
    least_sorted = sorted(book_borrow_counts.items(), key=lambda x: x[1])[:5]
    least_borrowed = []
    for book_id, count in least_sorted:
        book = books_map.get(book_id)
        if book:
            least_borrowed.append({"name": book.title, "borrows": count})

    # 5. Fine Metrics
    paid_fines = Fine.objects(status="paid")
    unpaid_fines = Fine.objects(status="unpaid")
    paid_total = sum(float(f.amount) for f in paid_fines)
    unpaid_total = sum(float(f.amount) for f in unpaid_fines)
    fine_metrics = [
        {"name": "Paid", "value": paid_total},
        {"name": "Unpaid", "value": unpaid_total},
    ]

    # 6. Overdue books by category
    overdue_category_data = {}
    overdue_borrows = [br for br in all_borrows if br.status == "overdue"]
    for br in overdue_borrows:
        book = books_map.get(br.book_id)
        if book and book.category_name:
            overdue_category_data[book.category_name] = overdue_category_data.get(book.category_name, 0) + 1
    overdue_by_category = [{"name": name, "value": count} for name, count in overdue_category_data.items()]

    # 7. Recent registrations (last 10)
    recent_users = User.objects.order_by("-created_at").limit(10).all()
    recent_registrations = [
        {
            "id": str(u.id),
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
        "total_fine_collected": paid_total,
        "total_fine_outstanding": unpaid_total,
        "overdue_by_category": overdue_by_category,
        "recent_registrations": recent_registrations,
    }), 200


@dashboard_bp.get("/activities")
@role_required("admin")
def recent_activities():
    logs = ActivityLog.objects.order_by("-timestamp").limit(50).all()
    return jsonify([log.to_dict() for log in logs]), 200


@dashboard_bp.get("/admin/recent-users")
@role_required("admin")
def recent_users():
    users = User.objects.order_by("-created_at").limit(10).all()
    return jsonify([u.to_dict() for u in users]), 200


@dashboard_bp.get("/admin/export/fines")
@role_required("admin", "librarian")
def export_fines_csv():
    """Export fine management records as downloadable CSV."""
    import csv
    import io
    from flask import Response

    fines = Fine.objects.all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Fine ID", "Borrow Record ID", "Amount (GHS)", "Status", "Paid At"])

    for f in fines:
        writer.writerow([
            str(f.id),
            f.borrow_record_id,
            float(f.amount),
            f.status,
            f.paid_at.isoformat() if f.paid_at else "",
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

    records = BorrowRecord.objects.all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Record ID", "User ID", "Book ID", "Status", "Borrow Date", "Due Date", "Returned At"])

    for r in records:
        writer.writerow([
            str(r.id),
            r.user_id,
            r.book_id,
            r.status,
            r.borrow_date.isoformat() if r.borrow_date else "",
            r.due_date.isoformat() if r.due_date else "",
            r.return_date.isoformat() if r.return_date else "",
        ])

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=borrow_activity_report.csv"}
    )
