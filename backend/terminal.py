import os
import subprocess
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

SERVICE_NAME = os.getenv("MODIX_GAME_SERVICE", "project-zomboid")


# -------------------------
# RUN COMMAND
# -------------------------
def run_cmd(cmd: list[str]):
    try:
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )
        return result.returncode, result.stdout.strip()
    except Exception as e:
        return 1, str(e)


# -------------------------
# START
# -------------------------
@router.post("/terminal/start")
def start_server():
    code, out = run_cmd(["systemctl", "start", SERVICE_NAME])
    return {
        "status": "started" if code == 0 else "error",
        "output": out
    }


# -------------------------
# STOP
# -------------------------
@router.post("/terminal/stop")
def stop_server():
    code, out = run_cmd(["systemctl", "stop", SERVICE_NAME])
    return {
        "status": "stopped" if code == 0 else "error",
        "output": out
    }


# -------------------------
# RESTART
# -------------------------
@router.post("/terminal/restart")
def restart_server():
    code, out = run_cmd(["systemctl", "restart", SERVICE_NAME])
    return {
        "status": "restarted" if code == 0 else "error",
        "output": out
    }


# -------------------------
# STATUS (REAL)
# -------------------------
@router.get("/terminal/status")
def status():
    code, out = run_cmd(["systemctl", "is-active", SERVICE_NAME])

    return {
        "status": "RUNNING" if "active" in out else "STOPPED",
        "raw": out
    }


# -------------------------
# WEBSOCKET (SO YOUR FRONTEND DOESN'T BREAK)
# -------------------------
@router.websocket("/terminal/ws")
async def terminal_ws(websocket: WebSocket):
    await websocket.accept()

    await websocket.send_text("Terminal connected")

    try:
        while True:
            # keep alive loop (optional future streaming)
            await websocket.receive_text()
            await websocket.send_text("alive")
    except WebSocketDisconnect:
        pass