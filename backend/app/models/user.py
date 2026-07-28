from datetime import datetime
from app.extensions import db, bcrypt


class User(db.Document):
    meta = {"collection": "users"}

    name = db.StringField(max_length=100, required=True)
    email = db.EmailField(max_length=150, unique=True, required=True)
    password_hash = db.StringField(max_length=255, required=True)
    role = db.StringField(max_length=20, choices=("student", "librarian", "admin"), default="student", required=True)
    is_active = db.BooleanField(default=True)
    failed_login_attempts = db.IntField(default=0)
    locked_until = db.DateTimeField(null=True)
    created_at = db.DateTimeField(default=datetime.utcnow)

    # Student-specific fields (only populated when role == "student")
    student_id = db.StringField(max_length=30, null=True)
    program = db.StringField(max_length=100, null=True)

    def set_password(self, raw_password):
        self.password_hash = bcrypt.generate_password_hash(raw_password).decode("utf-8")

    def check_password(self, raw_password):
        return bcrypt.check_password_hash(self.password_hash, raw_password)

    def to_dict(self):
        res = {
            "id": str(self.id),
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active,
        }
        if self.role == "student":
            res["student_id"] = self.student_id
            res["program"] = self.program
        return res

    def __repr__(self):
        return f"<User {self.email}>"


# StudentProfile is merged into User document for MongoDB (embedded pattern)
# No separate StudentProfile model needed

