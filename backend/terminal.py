import os
import subprocess
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

SERVER_SCRIPT = os.getenv(
    "MODIX_SERVER_SCRIPT",
    "/home/youruser/ZomboidServer/start-server.sh"
)

PROCESS = None
LOG_TASK = None
CONNECTED_CLIENTS = set()


# -------------------------
# STREAM OUTPUT TO WEBSOCKETS
# -------------------------
async def stream_output(pipe):
    try:
        while True:
            line = await asyncio.to_thread(pipe.readline)
            if not line:
                break

            dead_clients = set()

            for ws in CONNECTED_CLIENTS:
                try:
                    await ws.send_text(line.strip())
                except Exception:
                    dead_clients.add(ws)

            for ws in dead_clients:
                CONNECTED_CLIENTS.remove(ws)

    except Exception:
        pass


# -------------------------
# START SERVER
# -------------------------
@router.post("/terminal/start")
async def start_server():
    global PROCESS, LOG_TASK

    if PROCESS and PROCESS.poll() is None:
        return {"status": "already_running"}

    try:
        PROCESS = subprocess.Popen(
            ["bash", SERVER_SCRIPT],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )

        LOG_TASK = asyncio.create_task(stream_output(PROCESS.stdout))

        return {"status": "started", "pid": PROCESS.pid}

    except Exception as e:
        return {"status": "error", "message": str(e)}


# -------------------------
# STOP SERVER
# -------------------------
@router.post("/terminal/stop")
def stop_server():
    global PROCESS

    if not PROCESS:
        return {"status": "not_running"}

    try:
        PROCESS.terminate()
        PROCESS = None
        return {"status": "stopped"}

    except Exception as e:
        return {"status": "error", "message": str(e)}


# -------------------------
# RESTART
# -------------------------
@router.post("/terminal/restart")
async def restart_server():
    stop_server()
    await asyncio.sleep(1)
    return await start_server()


# -------------------------
# STATUS
# -------------------------
@router.get("/terminal/status")
def status():
    global PROCESS

    if PROCESS and PROCESS.poll() is None:
        return {"status": "RUNNING", "pid": PROCESS.pid}

    return {"status": "STOPPED"}


# -------------------------
# WEBSOCKET (REAL LOG STREAM)
# -------------------------
@router.websocket("/terminal/ws")
async def terminal_ws(websocket: WebSocket):
    await websocket.accept()
    CONNECTED_CLIENTS.add(websocket)

    try:
        await websocket.send_text("connected")

        while True:
            # keep alive + allow frontend pings
            await websocket.receive_text()

    except WebSocketDisconnect:
        CONNECTED_CLIENTS.remove(websocket)