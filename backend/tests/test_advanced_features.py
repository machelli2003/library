"""Tests for Reservations, Reviews, and Reports features."""
from tests.helpers import auth_header


def test_reservations_restrictions_and_cycles(client, student_token, librarian_token):
    s_token, student = student_token
    l_token, _ = librarian_token

    # 1. Create a book with 0 availability
    book_res = client.post(
        "/api/books",
        json={"title": "Reserved Book", "author": "Auth", "quantity": 1},
        headers=auth_header(l_token),
    )
    book_id = book_res.get_json()["id"]

    # 2. Cannot reserve book when copies are available
    res = client.post(
        "/api/reservations",
        json={"book_id": book_id},
        headers=auth_header(s_token),
    )
    assert res.status_code == 400
    assert "available for direct borrowing" in res.get_json()["message"]

    # 3. Borrow the book to make copies = 0
    borrow_res = client.post(
        "/api/borrow", json={"book_id": book_id}, headers=auth_header(s_token)
    )
    borrow_id = borrow_res.get_json()["id"]
    client.patch(f"/api/borrow/{borrow_id}/approve", headers=auth_header(l_token))

    # 4. Now we can reserve it (as another student, or same student? Deny if student has active borrow)
    # Denies because current student has active borrow
    res = client.post(
        "/api/reservations",
        json={"book_id": book_id},
        headers=auth_header(s_token),
    )
    assert res.status_code == 400

    # Register/login a second student
    client.post(
        "/api/auth/register",
        json={"name": "Student Two", "email": "student2@test.com", "password": "Password123", "role": "student"},
    )
    res_login = client.post("/api/auth/login", json={"email": "student2@test.com", "password": "Password123"})
    s2_token = res_login.get_json()["access_token"]
    s2_id = res_login.get_json()["user"]["id"]

    # Student 2 places the reservation
    res = client.post(
        "/api/reservations",
        json={"book_id": book_id},
        headers=auth_header(s2_token),
    )
    assert res.status_code == 201
    res_id = res.get_json()["id"]

    # 5. Cannot place duplicate reservation
    res_dup = client.post(
        "/api/reservations",
        json={"book_id": book_id},
        headers=auth_header(s2_token),
    )
    assert res_dup.status_code == 400

    # 6. Verify my reservations list
    res_list = client.get("/api/reservations/my", headers=auth_header(s2_token))
    assert len(res_list.get_json()) == 1

    # 7. Cancel reservation check (let's do a cancel test on student 2)
    client.patch(f"/api/reservations/{res_id}/cancel", headers=auth_header(s2_token))
    res_list_after = client.get("/api/reservations/my", headers=auth_header(s2_token))
    assert res_list_after.get_json()[0]["status"] == "cancelled"

    # Re-reserve for fulfillment testing
    res_new = client.post(
        "/api/reservations",
        json={"book_id": book_id},
        headers=auth_header(s2_token),
    )
    assert res_new.status_code == 201
    res_new_id = res_new.get_json()["id"]

    # 8. Fulfill reservation when book is returned
    client.patch(f"/api/borrow/{borrow_id}/return", headers=auth_header(l_token))

    # Reservation should be fulfilled
    res_check = client.get("/api/reservations/my", headers=auth_header(s2_token))
    assert res_check.get_json()[0]["status"] == "fulfilled"

    # A pending borrow request should have been created for student 2
    pending_res = client.get("/api/borrow/pending", headers=auth_header(l_token))
    pending_user_ids = [p["user_id"] for p in pending_res.get_json()]
    assert s2_id in pending_user_ids


def test_reviews_eligibility_and_calculations(client, student_token, librarian_token):
    s_token, student = student_token
    l_token, _ = librarian_token

    # 1. Create a book
    book_res = client.post(
        "/api/books",
        json={"title": "Reviewed Book", "author": "Auth", "quantity": 1},
        headers=auth_header(l_token),
    )
    book_id = book_res.get_json()["id"]

    # 2. Cannot review without borrowing
    res = client.post(
        f"/api/books/{book_id}/reviews",
        json={"rating": 5, "comment": "Excellent!"},
        headers=auth_header(s_token),
    )
    assert res.status_code == 403

    # 3. Check review eligibility
    elig = client.get(f"/api/books/{book_id}/review-eligibility", headers=auth_header(s_token)).get_json()
    assert elig["eligible"] is False

    # 4. Borrow and return the book
    borrow_res = client.post(
        "/api/borrow", json={"book_id": book_id}, headers=auth_header(s_token)
    )
    borrow_id = borrow_res.get_json()["id"]
    client.patch(f"/api/borrow/{borrow_id}/approve", headers=auth_header(l_token))
    client.patch(f"/api/borrow/{borrow_id}/return", headers=auth_header(l_token))

    # 5. Now eligible to review
    elig = client.get(f"/api/books/{book_id}/review-eligibility", headers=auth_header(s_token)).get_json()
    assert elig["eligible"] is True

    # 6. Post a review
    rev_res = client.post(
        f"/api/books/{book_id}/reviews",
        json={"rating": 4, "comment": "Good read"},
        headers=auth_header(s_token),
    )
    assert rev_res.status_code == 201

    # 7. Cannot review twice
    res_dup = client.post(
        f"/api/books/{book_id}/reviews",
        json={"rating": 5, "comment": "Excellent!"},
        headers=auth_header(s_token),
    )
    assert res_dup.status_code == 400

    # 8. Check averages in book details
    book_detail = client.get(f"/api/books/{book_id}", headers=auth_header(s_token)).get_json()
    assert book_detail["average_rating"] == 4.0
    assert book_detail["review_count"] == 1


def test_admin_reports_analytics_data(client, admin_token):
    token, _ = admin_token
    res = client.get("/api/dashboard/admin/reports", headers=auth_header(token))
    assert res.status_code == 200
    data = res.get_json()
    assert "by_category" in data
    assert "monthly_activity" in data
    assert "top_books" in data
    assert "fine_metrics" in data
    assert "total_fine_collected" in data
