import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-change-me")

    # MongoDB Atlas Connection URI (from MONGO_URI or MONGODB_URI env)
    MONGODB_URI = (
        os.getenv("MONGO_URI")
        or os.getenv("MONGODB_URI")
        or "mongodb+srv://library_user:minuamah123@cluster0.o35blay.mongodb.net/university_library?retryWrites=true&w=majority&appName=Cluster0"
    )

    JWT_ACCESS_TOKEN_EXPIRES = 60 * 60 * 8  # 8 hours
    UPLOAD_FOLDER = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "static", "uploads"
    )
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB max upload
