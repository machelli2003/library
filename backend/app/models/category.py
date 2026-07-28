from app.extensions import db


class Category(db.Document):
    meta = {"collection": "categories"}

    name = db.StringField(max_length=80, unique=True, required=True)

    def to_dict(self):
        return {"id": str(self.id), "name": self.name}

    def __repr__(self):
        return f"<Category {self.name}>"

