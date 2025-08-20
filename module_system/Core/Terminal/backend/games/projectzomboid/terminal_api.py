# /project/workspace/module_system/Core/Terminal/backend/games/projectzomboid/terminal_api.py
import os
import subprocess
from fastapi import APIRouter, HTTPException

router = APIRouter()

BASE_DIR = "/project/workspace/backend/gamefiles/projectzomboid"
START_SCRIPT = os.path.join(BASE_DIR, "start-server.sh")
STOP_SCRIPT = os.path.join(BASE_DIR, "stop-server.sh")

@router.post("/start")
def start_server():
    if not os.path.exists(START_SCRIPT):
        raise HTTPException(status_code=404, detail="Start script not found")
    try:
        subprocess.Popen(["bash", START_SCRIPT])
        return {"status": "ok", "message": "Project Zomboid server starting..."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stop")
def stop_server():
    if not os.path.exists(STOP_SCRIPT):
        raise HTTPException(status_code=404, detail="Stop script not found")
    try:
        subprocess.Popen(["bash", STOP_SCRIPT])
        return {"status": "ok", "message": "Project Zomboid server stopping..."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
def server_status():
    try:
        output = subprocess.check_output(["screen", "-list"]).decode()
        running = "pzserver" in output
        return {"status": "running" if running else "stopped"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
