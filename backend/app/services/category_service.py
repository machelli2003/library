from app.extensions import db
from app.models import Category


class CategoryError(Exception):
    def __init__(self, message, status_code=400):
        self.message = message
        self.status_code = status_code


def list_categories():
    return Category.query.order_by(Category.name.asc()).all()


def get_category(category_id):
    category = Category.query.get(category_id)
    if not category:
        raise CategoryError("Category not found", 404)
    return category


def create_category(data):
    if Category.query.filter_by(name=data["name"]).first():
        raise CategoryError("Category already exists", 409)
    category = Category(name=data["name"])
    db.session.add(category)
    db.session.commit()
    return category


def update_category(category_id, data):
    category = get_category(category_id)
    if "name" in data:
        existing = Category.query.filter_by(name=data["name"]).first()
        if existing and existing.id != category.id:
            raise CategoryError("Category name already in use", 409)
        category.name = data["name"]
    db.session.commit()
    return category


def delete_category(category_id):
    category = get_category(category_id)
    db.session.delete(category)
    db.session.commit()
