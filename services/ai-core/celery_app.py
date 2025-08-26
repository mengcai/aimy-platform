"""
Celery configuration for AIMY AI Core Service
Handles background tasks like model retraining and batch processing
"""

import os
from celery import Celery
from celery.schedules import crontab

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Create Celery instance
celery_app = Celery(
    "ai_core",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["celery_tasks"]
)

# Celery configuration
celery_app.conf.update(
    # Task serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Task routing
    task_routes={
        "celery_tasks.retrain_models": {"queue": "model_training"},
        "celery_tasks.batch_prediction": {"queue": "batch_processing"},
        "celery_tasks.data_processing": {"queue": "data_processing"},
    },
    
    # Queue configuration
    task_default_queue="default",
    task_default_exchange="default",
    task_default_routing_key="default",
    
    # Worker configuration
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    
    # Result backend configuration
    result_expires=3600,  # 1 hour
    
    # Beat schedule for periodic tasks
    beat_schedule={
        "daily-model-retraining": {
            "task": "celery_tasks.retrain_models",
            "schedule": crontab(hour=2, minute=0),  # 2 AM daily
            "args": (),
        },
        "hourly-metrics-collection": {
            "task": "celery_tasks.collect_metrics",
            "schedule": crontab(minute=0),  # Every hour
            "args": (),
        },
        "weekly-data-cleanup": {
            "task": "celery_tasks.cleanup_old_data",
            "schedule": crontab(day_of_week=0, hour=3, minute=0),  # Sunday 3 AM
            "args": (),
        },
    },
    
    # Task execution configuration
    task_always_eager=False,  # Set to True for testing
    task_eager_propagates=True,
    
    # Logging
    worker_log_format="[%(asctime)s: %(levelname)s/%(processName)s] %(message)s",
    worker_task_log_format="[%(asctime)s: %(levelname)s/%(processName)s] [%(task_name)s(%(task_id)s)] %(message)s",
)

# Optional: Configure Celery to use the same logging configuration
celery_app.conf.update(
    worker_log_level="INFO",
    worker_log_file=None,  # Log to console
)

if __name__ == "__main__":
    celery_app.start()
