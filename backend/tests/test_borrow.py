from datetime import date, timedelta
from tests.helpers import auth_header


def _create_book(client, token, quantity=2):
    res = client.post(
        "/api/books",
        json={"title": "Borrow Test Book", "author": "A", "quantity": quantity},
        headers=auth_header(token),
    )
    return res.get_json()["id"]


def test_full_borrow_approve_return_cycle(client, student_token, librarian_token):
    s_token, _ = student_token
    l_token, _ = librarian_token
    book_id = _create_book(client, l_token)

    res = client.post("/api/borrow", json={"book_id": book_id}, headers=auth_header(s_token))
    assert res.status_code == 201
    record_id = res.get_json()["id"]
    assert res.get_json()["status"] == "pending"

    res2 = client.patch(f"/api/borrow/{record_id}/approve", headers=auth_header(l_token))
    assert res2.status_code == 200
    assert res2.get_json()["status"] == "borrowed"

    book_res = client.get(f"/api/books/{book_id}", headers=auth_header(s_token))
    assert book_res.get_json()["available_copies"] == 1

    res3 = client.patch(f"/api/borrow/{record_id}/return", headers=auth_header(l_token))
    assert res3.status_code == 200
    assert res3.get_json()["status"] == "returned"

    fines_res = client.get("/api/fines/mine", headers=auth_header(s_token))
    assert fines_res.get_json() == []


def test_borrow_rejected_when_no_copies_available(client, student_token, librarian_token):
    s_token, _ = student_token
    l_token, _ = librarian_token
    book_id = _create_book(client, l_token, quantity=1)

    res = client.post("/api/borrow", json={"book_id": book_id}, headers=auth_header(s_token))
    record_id = res.get_json()["id"]
    client.patch(f"/api/borrow/{record_id}/approve", headers=auth_header(l_token))

    client.post(
        "/api/auth/register",
        json={"name": "S2", "email": "s2@test.com", "password": "password123"},
    )
    login2 = client.post("/api/auth/login", json={"email": "s2@test.com", "password": "password123"})
    token2 = login2.get_json()["access_token"]

    res2 = client.post("/api/borrow", json={"book_id": book_id}, headers=auth_header(token2))
    assert res2.status_code == 409


def test_max_active_borrows_limit(client, student_token, librarian_token):
    s_token, _ = student_token
    l_token, _ = librarian_token

    for _ in range(3):
        book_id = _create_book(client, l_token)
        res = client.post("/api/borrow", json={"book_id": book_id}, headers=auth_header(s_token))
        assert res.status_code == 201

    book_id_4 = _create_book(client, l_token)
    res = client.post("/api/borrow", json={"book_id": book_id_4}, headers=auth_header(s_token))
    assert res.status_code == 409


def test_duplicate_active_request_rejected(client, student_token, librarian_token):
    s_token, _ = student_token
    l_token, _ = librarian_token
    book_id = _create_book(client, l_token)

    client.post("/api/borrow", json={"book_id": book_id}, headers=auth_header(s_token))
    res = client.post("/api/borrow", json={"book_id": book_id}, headers=auth_header(s_token))
    assert res.status_code == 409


def test_late_return_creates_correct_fine_amount(client, student_token, librarian_token, db):
    from app.models import BorrowRecord

    s_token, _ = student_token
    l_token, _ = librarian_token
    book_id = _create_book(client, l_token)

    res = client.post("/api/borrow", json={"book_id": book_id}, headers=auth_header(s_token))
    record_id = res.get_json()["id"]
    client.patch(f"/api/borrow/{record_id}/approve", headers=auth_header(l_token))

    # simulate the book being 5 days overdue
    record = BorrowRecord.objects.get(id=record_id)
    record.due_date = date.today() - timedelta(days=5)
    record.save()

    res2 = client.patch(f"/api/borrow/{record_id}/return", headers=auth_header(l_token))
    assert res2.status_code == 200

    fines = client.get("/api/fines/mine", headers=auth_header(s_token)).get_json()
    assert len(fines) == 1
    assert fines[0]["amount"] == 10.00  # 5 days late x GHS 2/day
    assert fines[0]["status"] == "unpaid"


def test_only_pending_requests_can_be_approved(client, student_token, librarian_token):
    s_token, _ = student_token
    l_token, _ = librarian_token
    book_id = _create_book(client, l_token)

    res = client.post("/api/borrow", json={"book_id": book_id}, headers=auth_header(s_token))
    record_id = res.get_json()["id"]
    client.patch(f"/api/borrow/{record_id}/approve", headers=auth_header(l_token))

    res2 = client.patch(f"/api/borrow/{record_id}/approve", headers=auth_header(l_token))
    assert res2.status_code == 409
