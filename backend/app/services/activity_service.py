import logging
from app.models.activity_log import ActivityLog


def log_activity(user_id, action, user_name="System"):
    try:
        log = ActivityLog(
            user_id=str(user_id) if user_id else None,
            user_name=user_name,
            action=action,
        )
        log.save()
    except Exception as e:
        logging.getLogger(__name__).error(f"Failed to log activity: {e}")

