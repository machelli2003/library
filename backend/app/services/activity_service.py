import logging
from app.models import User
from app.models.activity_log import ActivityLog


def log_activity(user_id, action, user_name=None):
    try:
        resolved_name = user_name
        if user_id and not resolved_name:
            user = User.objects(id=user_id).first()
            if user:
                resolved_name = user.name

        if not resolved_name:
            resolved_name = "System"

        log = ActivityLog(
            user_id=str(user_id) if user_id else None,
            user_name=resolved_name,
            action=action,
        )
        log.save()
    except Exception as e:
        logging.getLogger(__name__).error(f"Failed to log activity: {e}")

