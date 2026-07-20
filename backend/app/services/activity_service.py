from app.extensions import db
from app.models.activity_log import ActivityLog


def log_activity(user_id, action):
    try:
        log = ActivityLog(user_id=user_id, action=action)
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        import logging

        logging.getLogger(__name__).error(f"Failed to log activity: {e}")
