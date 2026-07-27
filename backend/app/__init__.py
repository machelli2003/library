import os
from flask import Flask, jsonify
from .config import Config
from .extensions import db, migrate, jwt, bcrypt, cors, socketio


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    from .logging_config import setup_logging
    setup_logging(app)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    socketio.init_app(app, cors_allowed_origins="*")

    from flask_socketio import join_room
    from flask_jwt_extended import decode_token

    @socketio.on("connect")
    def handle_connect(auth=None):
        token = None
        if auth and "token" in auth:
            token = auth["token"]
        if not token:
            return False
        try:
            if token.startswith("Bearer "):
                token = token.split(" ")[1]
            decoded = decode_token(token)
            user_id = decoded["sub"]
            join_room(f"user_{user_id}")
            app.logger.info(f"User {user_id} connected to real-time socket.")
            return True
        except Exception as e:
            app.logger.error(f"Socket connection auth failed: {e}")
            return False

    from .routes.auth import auth_bp
    from .routes.books import books_bp
    from .routes.borrow import borrow_bp
    from .routes.fines import fines_bp
    from .routes.dashboard import dashboard_bp
    from .routes.categories import categories_bp
    from .routes.users import users_bp
    from .routes.notifications import notifications_bp
    from .routes.reservations import reservations_bp
    from .routes.reviews import reviews_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(books_bp, url_prefix="/api/books")
    app.register_blueprint(borrow_bp, url_prefix="/api/borrow")
    app.register_blueprint(fines_bp, url_prefix="/api/fines")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(categories_bp, url_prefix="/api/categories")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(reservations_bp, url_prefix="/api/reservations")
    app.register_blueprint(reviews_bp, url_prefix="/api")

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    from flask import send_from_directory

    @app.get("/api/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    @jwt.unauthorized_loader
    def missing_token(reason):
        return jsonify({"message": "Missing or invalid token"}), 401

    @jwt.invalid_token_loader
    def invalid_token(reason):
        return jsonify({"message": "Invalid token"}), 422

    @jwt.expired_token_loader
    def expired_token(header, payload):
        return jsonify({"message": "Token has expired"}), 401

    # Don't start the scheduler twice under Flask's debug reloader, and skip
    # it entirely during tests (TESTING=True) since pytest doesn't need it.
    if not app.config.get("TESTING") and os.environ.get("WERKZEUG_RUN_MAIN") != "false":
        from app.services.scheduler_service import start_background_scheduler
        start_background_scheduler(app)

    return app
