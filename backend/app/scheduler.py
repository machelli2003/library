from apscheduler.schedulers.background import BackgroundScheduler
from app.services.borrow_service import mark_overdue_records


def init_scheduler(app):
    scheduler = BackgroundScheduler(daemon=True)

    def job():
        with app.app_context():
            count = mark_overdue_records()
            if count:
                app.logger.info(f"Marked {count} borrow record(s) as overdue")

    # Runs once a day at 00:05. Change to 'interval', minutes=60 for more
    # frequent checks during development/demo.
    scheduler.add_job(job, "cron", hour=0, minute=5, id="mark_overdue_job")
    scheduler.start()
    return scheduler
