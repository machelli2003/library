from tests.helpers import auth_header


def test_public_register_always_creates_student_even_if_role_sent(client):
    """Regression test for the Phase 7 finding: /register must ignore any
    client-supplied role and always create a student."""
    res = client.post(
        "/api/auth/register",
        json={"name": "Sneaky", "email": "sneaky@test.com", "password": "Password123", "role": "admin"},
    )
    assert res.status_code == 201
    assert res.get_json()["role"] == "student"


def test_create_staff_requires_admin(client, librarian_token):
    token, _ = librarian_token
    res = client.post(
        "/api/auth/create-staff",
        json={"name": "New Librarian", "email": "newlib@test.com", "password": "Password123", "role": "librarian"},
        headers=auth_header(token),
    )
    assert res.status_code == 403


def test_admin_can_create_staff(client, admin_token):
    token, _ = admin_token
    res = client.post(
        "/api/auth/create-staff",
        json={"name": "New Librarian", "email": "newlib2@test.com", "password": "Password123", "role": "librarian"},
        headers=auth_header(token),
    )
    assert res.status_code == 201
    assert res.get_json()["role"] == "librarian"


def test_passwords_must_meet_strength_requirements(client):
    res = client.post(
        "/api/auth/register",
        json={"name": "Weak Password", "email": "weak@test.com", "password": "weakpass"},
    )
    assert res.status_code == 422
    assert "Password must be at least 8 characters" in res.get_json()["errors"]["password"][0]


def test_account_locks_after_repeated_failed_logins(client):
    client.post(
        "/api/auth/register",
        json={"name": "Lockout User", "email": "lockout@test.com", "password": "Password123"},
    )

    for _ in range(5):
        res = client.post(
            "/api/auth/login",
            json={"email": "lockout@test.com", "password": "wrong-password"},
        )
        assert res.status_code == 401

    locked_res = client.post(
        "/api/auth/login",
        json={"email": "lockout@test.com", "password": "Password123"},
    )
    assert locked_res.status_code == 423
    assert "Account locked" in locked_res.get_json()["message"]


def test_refresh_token_returns_new_access_token(client):
    client.post(
        "/api/auth/register",
        json={"name": "Refresh User", "email": "refresh@test.com", "password": "Password123"},
    )
    login_res = client.post(
        "/api/auth/login",
        json={"email": "refresh@test.com", "password": "Password123"},
    )
    assert login_res.status_code == 200
    refresh_token = login_res.get_json()["refresh_token"]
    refresh_res = client.post(
        "/api/auth/refresh",
        headers={"Authorization": f"Bearer {refresh_token}"},
    )
    assert refresh_res.status_code == 200
    assert "access_token" in refresh_res.get_json()


def test_register_is_rate_limited(client):
    for i in range(5):
        res = client.post(
            "/api/auth/register",
            json={"name": f"Rate {i}", "email": f"rate{i}@test.com", "password": "Password123"},
        )
        assert res.status_code in {201, 422}

    res = client.post(
        "/api/auth/register",
        json={"name": "Rate Limit", "email": "rate-limit@test.com", "password": "Password123"},
    )
    assert res.status_code == 429
