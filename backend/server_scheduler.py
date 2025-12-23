import os
import subprocess
from fastapi import APIRouter, Body
from apscheduler.schedulers.background import BackgroundScheduler
from typing import List

scheduler = BackgroundScheduler()
scheduler.start()

router = APIRouter()

# Store scheduled jobs in-memory (or DB if needed)
scheduled_jobs = {}

@router.post("/add")
async def add_restart_schedule(
    game_id: str = Body(...),
    hour: int = Body(...),
    minute: int = Body(...),
    days: List[str] = Body(...)
):
    """Schedule server restart at given hour, minute, and weekdays"""
    job_id = f"{game_id}_restart"

    # Remove existing job if exists
    if job_id in scheduled_jobs:
        scheduled_jobs[job_id].remove()
    
    def restart_game():
        batch_path = os.path.expanduser(f"~/Zomboid/Server/{game_id}.sh")  # adjust path
        if os.path.exists(batch_path):
            subprocess.Popen([batch_path], shell=True)
    
    # Convert days like ["mon","tue"] -> 0,1,...6
    day_map = {"mon":0,"tue":1,"wed":2,"thu":3,"fri":4,"sat":5,"sun":6}
    day_numbers = [day_map[d.lower()] for d in days if d.lower() in day_map]

    scheduler.add_job(
        restart_game,
        trigger="cron",
        day_of_week=",".join(map(str,day_numbers)),
        hour=hour,
        minute=minute,
        id=job_id,
        replace_existing=True
    )

    scheduled_jobs[job_id] = scheduler.get_job(job_id)
    return {"status":"scheduled","job_id":job_id}
