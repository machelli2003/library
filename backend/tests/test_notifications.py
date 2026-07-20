"""Tests for the /api/notifications endpoints."""
from tests.helpers import auth_header


def test_student_gets_empty_notifications_by_default(client, student_token):
    token, _ = student_token
    res = client.get("/api/notifications", headers=auth_header(token))
    assert res.status_code == 200
    data = res.get_json()
    assert "notifications" in data
    assert "unread_count" in data
    assert data["unread_count"] == 0


def test_approve_borrow_creates_notification(client, student_token, librarian_token):
    s_token, _ = student_token
    l_token, _ = librarian_token

    book_res = client.post(
        "/api/books",
        json={"title": "Notify Book", "author": "Auth", "quantity": 2},
        headers=auth_header(l_token),
    )
    assert book_res.status_code == 201
    book_id = book_res.get_json()["id"]

    borrow_res = client.post(
        "/api/borrow", json={"book_id": book_id}, headers=auth_header(s_token)
    )
    assert borrow_res.status_code == 201
    record_id = borrow_res.get_json()["id"]

    client.patch(f"/api/borrow/{record_id}/approve", headers=auth_header(l_token))

    notif_res = client.get("/api/notifications", headers=auth_header(s_token))
    assert notif_res.status_code == 200
    data = notif_res.get_json()
    assert data["unread_count"] >= 1
    types = [n["type"] for n in data["notifications"]]
    assert "borrow" in types


def test_reject_borrow_creates_rejection_notification(client, student_token, librarian_token):
    s_token, _ = student_token
    l_token, _ = librarian_token

    book_res = client.post(
        "/api/books",
        json={"title": "Reject Book", "author": "Auth", "quantity": 2},
        headers=auth_header(l_token),
    )
    book_id = book_res.get_json()["id"]

    borrow_res = client.post(
        "/api/borrow", json={"book_id": book_id}, headers=auth_header(s_token)
    )
    record_id = borrow_res.get_json()["id"]

    client.patch(f"/api/borrow/{record_id}/reject", headers=auth_header(l_token))

    notif_res = client.get("/api/notifications", headers=auth_header(s_token))
    data = notif_res.get_json()
    types = [n["type"] for n in data["notifications"]]
    assert "rejection" in types


def test_mark_single_notification_read(client, student_token, librarian_token):
    s_token, _ = student_token
    l_token, _ = librarian_token

    book_res = client.post(
        "/api/books",
        json={"title": "Mark Read Book", "author": "Auth", "quantity": 2},
        headers=auth_header(l_token),
    )
    book_id = book_res.get_json()["id"]
    borrow_res = client.post(
        "/api/borrow", json={"book_id": book_id}, headers=auth_header(s_token)
    )
    record_id = borrow_res.get_json()["id"]
    client.patch(f"/api/borrow/{record_id}/approve", headers=auth_header(l_token))

    data = client.get("/api/notifications", headers=auth_header(s_token)).get_json()
    notif_id = data["notifications"][0]["id"]

    res = client.patch(f"/api/notifications/{notif_id}/read", headers=auth_header(s_token))
    assert res.status_code == 200
    assert res.get_json()["is_read"] is True


def test_mark_all_notifications_read(client, student_token, librarian_token):
    s_token, _ = student_token
    l_token, _ = librarian_token

    book_res = client.post(
        "/api/books",
        json={"title": "All Read Book", "author": "Auth", "quantity": 2},
        headers=auth_header(l_token),
    )
    book_id = book_res.get_json()["id"]
    borrow_res = client.post(
        "/api/borrow", json={"book_id": book_id}, headers=auth_header(s_token)
    )
    record_id = borrow_res.get_json()["id"]
    client.patch(f"/api/borrow/{record_id}/approve", headers=auth_header(l_token))

    res = client.post("/api/notifications/read-all", headers=auth_header(s_token))
    assert res.status_code == 200

    data = client.get("/api/notifications", headers=auth_header(s_token)).get_json()
    assert data["unread_count"] == 0


def test_cannot_mark_another_users_notification_read(client, student_token, librarian_token, admin_token):
    s_token, _ = student_token
    l_token, _ = librarian_token
    a_token, _ = admin_token

    book_res = client.post(
        "/api/books",
        json={"title": "Access Check Book", "author": "Auth", "quantity": 2},
        headers=auth_header(l_token),
    )
    book_id = book_res.get_json()["id"]
    borrow_res = client.post(
        "/api/borrow", json={"book_id": book_id}, headers=auth_header(s_token)
    )
    record_id = borrow_res.get_json()["id"]
    client.patch(f"/api/borrow/{record_id}/approve", headers=auth_header(l_token))

    data = client.get("/api/notifications", headers=auth_header(s_token)).get_json()
    notif_id = data["notifications"][0]["id"]

    # Admin trying to mark student's notification as read → 404
    res = client.patch(f"/api/notifications/{notif_id}/read", headers=auth_header(a_token))
    assert res.status_code == 404
