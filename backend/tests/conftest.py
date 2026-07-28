import pytest
import mongoengine
import mongomock
from app import create_app
from app.config import Config
from app.models import User, Book, Category, BorrowRecord, Fine, Notification, Reservation, Review, ActivityLog


class TestConfig(Config):
    TESTING = True
    MONGODB_URI = "mongodb://localhost/test_db"
    JWT_SECRET_KEY = "test-secret"


@pytest.fixture
def app():
    mongoengine.disconnect_all()
    mongoengine.connect("test_db", host="mongodb://localhost/test_db", mongo_client_class=mongomock.MongoClient, alias="default")
    application = create_app(TestConfig)
    with application.app_context():
        yield application
    for model in [User, Book, Category, BorrowRecord, Fine, Notification, Reservation, Review, ActivityLog]:
        try:
            model.drop_collection()
        except Exception:
            pass
    mongoengine.disconnect_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def db(app):
    return mongoengine


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
            user.save()

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

