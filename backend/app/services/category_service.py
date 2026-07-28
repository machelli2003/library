from app.models import Category


class CategoryError(Exception):
    def __init__(self, message, status_code=400):
        self.message = message
        self.status_code = status_code


def list_categories():
    return Category.objects.order_by("+name").all()


def get_category(category_id):
    category = Category.objects(id=category_id).first()
    if not category:
        raise CategoryError("Category not found", 404)
    return category


def create_category(data):
    if Category.objects(name=data["name"]).first():
        raise CategoryError("Category already exists", 409)
    category = Category(name=data["name"])
    category.save()
    return category


def update_category(category_id, data):
    category = get_category(category_id)
    if "name" in data:
        existing = Category.objects(name=data["name"]).first()
        if existing and str(existing.id) != category_id:
            raise CategoryError("Category name already in use", 409)
        category.name = data["name"]
    category.save()
    return category


def delete_category(category_id):
    category = get_category(category_id)
    category.delete()

