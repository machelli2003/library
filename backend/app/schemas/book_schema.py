from marshmallow import Schema, fields, validate


class BookSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    author = fields.Str(required=True, validate=validate.Length(min=1, max=150))
    isbn = fields.Str(required=False, allow_none=True)
    category_id = fields.Str(required=False, allow_none=True)
    quantity = fields.Int(required=True, validate=validate.Range(min=1))
    description = fields.Str(required=False, allow_none=True)
    cover_url = fields.Str(required=False, allow_none=True)


class BookUpdateSchema(Schema):
    title = fields.Str(validate=validate.Length(min=1, max=200))
    author = fields.Str(validate=validate.Length(min=1, max=150))
    isbn = fields.Str(allow_none=True)
    category_id = fields.Str(allow_none=True)
    quantity = fields.Int(validate=validate.Range(min=1))
    description = fields.Str(allow_none=True)
    cover_url = fields.Str(allow_none=True)
