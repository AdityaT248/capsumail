from celery import Celery
from celery.schedules import crontab
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.routers.messages import send_scheduled_messages

load_dotenv()

# Redis URL from environment variables or default
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Create Celery app
celery_app = Celery(
    "worker",
    broker=REDIS_URL,
    backend=REDIS_URL
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Schedule tasks to run periodically
celery_app.conf.beat_schedule = {
    "send-scheduled-messages-daily": {
        "task": "app.celery_worker.task_send_scheduled_messages",
        "schedule": crontab(minute=0, hour="*/1"),  # Run every hour
    },
}

@celery_app.task
def task_send_scheduled_messages():
    """Task to check and send scheduled messages"""
    db = SessionLocal()
    try:
        send_scheduled_messages(db)
    finally:
        db.close()
    return {"status": "Scheduled messages processed"} 