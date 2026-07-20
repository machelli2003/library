from marshmallow import EXCLUDE, Schema, ValidationError, fields, validate


def validate_password_strength(value):
    if len(value) < 8:
        raise ValidationError("Password must be at least 8 characters")
    if not any(char.isdigit() for char in value) or not any(char.isalpha() for char in value):
        raise ValidationError("Password must be at least 8 characters")


class RegisterSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    """Public registration — always creates a student. Role is never
    accepted from the client here; see StaffCreateSchema for librarian/admin
    account creation, which is admin-gated."""

    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate_password_strength)
    student_id = fields.Str(required=False, allow_none=True)
    program = fields.Str(required=False, allow_none=True)


class StaffCreateSchema(Schema):
    """Used only by the admin-gated /auth/create-staff endpoint."""

    class Meta:
        unknown = EXCLUDE

    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate_password_strength)
    role = fields.Str(required=True, validate=validate.OneOf(["librarian", "admin"]))


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)
