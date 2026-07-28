import os

# Safely attempt eventlet monkey patch if supported (Python < 3.13)
try:
    import eventlet
    eventlet.monkey_patch()
except Exception:
    pass

from app import create_app
from app.extensions import socketio

app = create_app()

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV") != "production"
    socketio.run(app, host="0.0.0.0", port=port, debug=debug, allow_unsafe_werkzeug=True)
