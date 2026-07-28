from datetime import date, timedelta
from tests.helpers import auth_header


def test_mark_fine_paid(client, student_token, librarian_token, db):
    from app.models import BorrowRecord

    s_token, _ = student_token
    l_token, _ = librarian_token

    book_res = client.post(
        "/api/books", json={"title": "Fine Book", "author": "A", "quantity": 1}, headers=auth_header(l_token)
    )
    book_id = book_res.get_json()["id"]

    borrow_res = client.post("/api/borrow", json={"book_id": book_id}, headers=auth_header(s_token))
    record_id = borrow_res.get_json()["id"]
    client.patch(f"/api/borrow/{record_id}/approve", headers=auth_header(l_token))

    record = BorrowRecord.objects.get(id=record_id)
    record.due_date = date.today() - timedelta(days=3)
    record.save()

    client.patch(f"/api/borrow/{record_id}/return", headers=auth_header(l_token))

    all_fines = client.get("/api/fines", headers=auth_header(l_token)).get_json()
    fine_id = all_fines[0]["id"]

    res = client.patch(f"/api/fines/{fine_id}/pay", headers=auth_header(l_token))
    assert res.status_code == 200
    assert res.get_json()["status"] == "paid"

    res2 = client.patch(f"/api/fines/{fine_id}/pay", headers=auth_header(l_token))
    assert res2.status_code == 409  # already paid


def test_student_cannot_view_all_fines(client, student_token):
    token, _ = student_token
    res = client.get("/api/fines", headers=auth_header(token))
    assert res.status_code == 403
