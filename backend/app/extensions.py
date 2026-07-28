import mongoengine as db
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_socketio import SocketIO

jwt = JWTManager()
bcrypt = Bcrypt()
cors = CORS()
socketio = SocketIO()


def init_mongodb(app):
    """Initialize MongoDB connection via MongoEngine."""
    if app.config.get("TESTING"):
        return
    mongo_uri = app.config.get("MONGODB_URI", "")
    app.logger.info("Connecting to MongoDB Atlas...")
    db.connect(
        host=mongo_uri,
        alias="default",
    )
    app.logger.info("MongoDB Atlas connected successfully!")


def get_db():
    """Get the MongoEngine module for document/field definitions."""
    return db
