from fastapi import APIRouter
from fastapi.responses import JSONResponse
import subprocess
import os
import threading

router = APIRouter()

# Default server paths (adjust if your SteamCMD install is different)
WINDOWS_SERVER_PATH = r"C:\SteamCMD\pzserver\server.bat"
LINUX_SERVER_PATH = "/home/steam/pzserver/server.sh"

server_process = None
log_lines = []
log_lock = threading.Lock()

def append_log(line: str):
    with log_lock:
        log_lines.append(line)
        if len(log_lines) > 500:
            log_lines.pop(0)

def stream_logs(process: subprocess.Popen):
    for line in iter(process.stdout.readline, b''):
        decoded = line.decode(errors='ignore').strip()
        append_log(decoded)
    append_log("Server process ended")

@router.get("/status")
async def status():
    if server_process and server_process.poll() is None:
        return {"status": "running"}
    return {"status": "stopped"}

@router.get("/log-stream")
async def log_stream():
    return JSONResponse(content={"logs": log_lines})

@router.post("/start-server")
async def start_server(data: dict):
    global server_process
    os_type = data.get("os")
    if server_process and server_process.poll() is None:
        return {"success": False, "message": "Server already running"}
    try:
        path = WINDOWS_SERVER_PATH if os_type == "windows" else LINUX_SERVER_PATH
        server_process = subprocess.Popen(
            [path],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            shell=True,
        )
        threading.Thread(target=stream_logs, args=(server_process,), daemon=True).start()
        return {"success": True, "message": f"{os_type} server started"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@router.post("/stop-server")
async def stop_server():
    global server_process
    if not server_process or server_process.poll() is not None:
        return {"success": False, "message": "Server is not running"}
    server_process.terminate()
    server_process = None
    append_log("Server stopped")
    return {"success": True, "message": "Server stopped"}
