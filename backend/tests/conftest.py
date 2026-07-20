import pytest
from app import create_app
from app.config import Config
from app.extensions import db as _db
from app.models import User


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_SECRET_KEY = "test-secret"


@pytest.fixture
def app():
    application = create_app(TestConfig)
    with application.app_context():
        _db.create_all()
        yield application
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def db(app):
    return _db


def _register_and_login(client, email, password, role, name="Test User"):
    if role == "student":
        client.post(
            "/api/auth/register",
            json={"name": name, "email": email, "password": "Password123", "role": role},
        )
    else:
        with client.application.app_context():
            user = User(name=name, email=email, role=role)
            user.set_password(password)
            _db.session.add(user)
            _db.session.commit()

    res = client.post("/api/auth/login", json={"email": email, "password": password})
    body = res.get_json()
    return body["access_token"], body["user"]


@pytest.fixture
def student_token(client):
    return _register_and_login(client, "student@test.com", "Password123", "student")


@pytest.fixture
def librarian_token(client):
    return _register_and_login(client, "librarian@test.com", "Password123", "librarian")


@pytest.fixture
def admin_token(client):
    return _register_and_login(client, "admin@test.com", "Password123", "admin")
