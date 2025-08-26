# backend/API/Core/game_server_api.py
import os
import subprocess
import asyncio
from fastapi import APIRouter
from fastapi.responses import JSONResponse, StreamingResponse

router = APIRouter()

running_process: subprocess.Popen | None = None
log_queue: asyncio.Queue = asyncio.Queue()

# ---------------------------
# Helpers
# ---------------------------
def check_port_in_use(port: int) -> bool:
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0

async def stream_subprocess_output(stream, prefix: str):
    loop = asyncio.get_event_loop()
    while True:
        line = await loop.run_in_executor(None, stream.readline)
        if not line:
            break
        await log_queue.put(f"[{prefix}] {line.strip()}")

async def monitor_process_exit(process: subprocess.Popen):
    global running_process
    await asyncio.get_event_loop().run_in_executor(None, process.wait)
    await log_queue.put("[SYSTEM] Server stopped")
    running_process = None

# ---------------------------
# Endpoints
# ---------------------------
@router.get("/server-status")
def server_status():
    return {"status": "running" if running_process else "stopped"}

@router.post("/start-server")
async def start_server(os: str = "linux"):
    global running_process
    if running_process:
        return JSONResponse({"error": "Server already running"}, status_code=400)

    if os == "linux":
        script_path = os.path.abspath("backend/gamefiles/projectzomboid/linux/server.sh")
        cmd = ["bash", script_path]
    elif os == "windows":
        script_path = os.path.abspath("backend/gamefiles/projectzomboid/windows/server.bat")
        cmd = ["cmd.exe", "/c", script_path]
    else:
        return JSONResponse({"error": "Invalid OS"}, status_code=400)

    if not os.path.exists(script_path):
        return JSONResponse({"error": f"Server script not found at {script_path}"}, status_code=404)

    running_process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )

    asyncio.create_task(stream_subprocess_output(running_process.stdout, "OUT"))
    asyncio.create_task(stream_subprocess_output(running_process.stderr, "ERR"))
    asyncio.create_task(monitor_process_exit(running_process))

    return {"status": "running", "message": f"{os} server started successfully"}

@router.post("/stop-server")
async def stop_server():
    global running_process
    if not running_process:
        return {"status": "stopped", "message": "Server is not running"}

    running_process.terminate()
    await log_queue.put("[SYSTEM] Server stopped manually")
    running_process = None
    return {"status": "stopped", "message": "Server terminated"}

@router.get("/log-stream")
async def terminal_log_stream():
    async def event_generator():
        while True:
            log = await log_queue.get()
            yield f"data: {log}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")
