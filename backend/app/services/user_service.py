from app.extensions import db
from app.models import User


class UserError(Exception):
    def __init__(self, message, status_code=400):
        self.message = message
        self.status_code = status_code


def list_users(role=None):
    query = User.query
    if role:
        query = query.filter_by(role=role)
    return query.order_by(User.created_at.desc()).all()


def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        raise UserError("User not found", 404)
    return user


def set_active_status(user_id, is_active):
    user = get_user(user_id)
    user.is_active = is_active
    db.session.commit()
    return user


def change_role(user_id, new_role):
    user = get_user(user_id)
    if new_role not in ("student", "librarian", "admin"):
        raise UserError("Invalid role", 422)
    user.role = new_role
    db.session.commit()
    return user
