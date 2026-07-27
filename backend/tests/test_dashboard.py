from tests.helpers import auth_header


def test_student_dashboard_stats_shape(client, student_token):
    token, _ = student_token
    res = client.get("/api/dashboard/student", headers=auth_header(token))
    assert res.status_code == 200
    assert set(res.get_json().keys()) == {
        "books_borrowed", "due_soon", "outstanding_fines", "available_books",
        "total_borrowed_all_time", "pending_requests",
    }


def test_librarian_cannot_access_admin_dashboard(client, librarian_token):
    token, _ = librarian_token
    res = client.get("/api/dashboard/admin", headers=auth_header(token))
    assert res.status_code == 403


def test_admin_dashboard_stats(client, admin_token):
    token, _ = admin_token
    res = client.get("/api/dashboard/admin", headers=auth_header(token))
    assert res.status_code == 200
    assert "total_users" in res.get_json()
