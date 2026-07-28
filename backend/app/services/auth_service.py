import logging
from datetime import datetime, timedelta

from app.extensions import db
from app.models import User

logger = logging.getLogger(__name__)


class AuthError(Exception):
    def __init__(self, message, status_code=400):
        self.message = message
        self.status_code = status_code


def register_user(data):
    """Public registration path. Always creates a student."""
    if User.objects(email=data["email"]).first():
        raise AuthError("Email already registered", 409)

    user = User(
        name=data["name"],
        email=data["email"],
        role="student",
        student_id=data.get("student_id"),
        program=data.get("program"),
    )
    user.set_password(data["password"])
    user.save()
    return user


def create_staff_user(data):
    """Admin-gated path for creating librarian/admin accounts."""
    if User.objects(email=data["email"]).first():
        raise AuthError("Email already registered", 409)

    user = User(name=data["name"], email=data["email"], role=data["role"])
    user.set_password(data["password"])
    user.save()
    return user


def authenticate_user(email, password):
    user = User.objects(email=email).first()
    if not user:
        logger.warning(f"Failed login attempt for email={email}")
        raise AuthError("Invalid email or password", 401)

    if user.locked_until and user.locked_until > datetime.utcnow():
        logger.warning(f"Login attempt on locked account: {email}")
        raise AuthError("Account locked", 423)

    if not user.check_password(password):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= 5:
            user.locked_until = datetime.utcnow() + timedelta(minutes=15)
        user.save()
        logger.warning(f"Failed login attempt for email={email}")
        raise AuthError("Invalid email or password", 401)

    if not user.is_active:
        logger.warning(f"Login attempt on disabled account: {email}")
        raise AuthError("Account is disabled", 403)

    user.failed_login_attempts = 0
    user.locked_until = None
    user.save()
    logger.info(f"User {user.id} ({user.email}) logged in")
    return user

