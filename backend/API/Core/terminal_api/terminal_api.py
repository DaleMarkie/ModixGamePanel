import os
import asyncio
import signal
import subprocess
import json
from typing import Optional, List

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, StreamingResponse

router = APIRouter()

# ---------------------------
# Global State
# ---------------------------
running_process: Optional[subprocess.Popen] = None
log_queue: asyncio.Queue = asyncio.Queue()
command_history: List[str] = []

# Path for saving persistent history
HISTORY_FILE = os.path.expanduser("~/.modix/command_history.json")
MAX_HISTORY = 500  # max commands to store


# ---------------------------
# Utils
# ---------------------------
def error_response(code: str, status_code: int, message: str):
    return JSONResponse({"error": code, "message": message}, status_code=status_code)


def load_command_history():
    """Load command history from file"""
    global command_history
    if os.path.isfile(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                command_history = json.load(f)
        except Exception:
            command_history = []


def save_command_history():
    """Save command history to file"""
    os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(command_history[-MAX_HISTORY:], f, indent=2)
    except Exception as e:
        print(f"[WARN] Failed to save history: {e}")


async def stream_subprocess_output(stream, prefix: str):
    """Push subprocess stdout/stderr into log queue"""
    loop = asyncio.get_event_loop()
    while True:
        line = await loop.run_in_executor(None, stream.readline)
        if not line:
            break
        await log_queue.put(f"[{prefix}] {line.strip()}")


async def monitor_process_exit(process):
    """Notify when server stops"""
    global running_process
    await asyncio.get_event_loop().run_in_executor(None, process.wait)
    await log_queue.put("[SYSTEM] Server stopped")
    running_process = None


# ---------------------------
# API Routes
# ---------------------------
@router.post("/start")
async def start_pz_server(request: Request):
    """Start Project Zomboid server"""
    global running_process
    if running_process and running_process.poll() is None:
        return error_response("BACKEND_001", 400, "Server already running")

    try:
        data = await request.json()
        startup_file = data.get("startupFile")
        os_type = data.get("os", "").lower()

        if not startup_file or not os.path.isfile(startup_file):
            return error_response("GAME_002", 404, f"Startup file not found: {startup_file}")

        if os_type == "windows":
            running_process = subprocess.Popen(
                ["cmd.exe", "/c", startup_file],
                cwd=os.path.dirname(startup_file),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                stdin=subprocess.PIPE,
                text=True,
                bufsize=1
            )
        elif os_type == "linux":
            running_process = subprocess.Popen(
                ["bash", startup_file],
                cwd=os.path.dirname(startup_file),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                stdin=subprocess.PIPE,
                text=True,
                bufsize=1,
                preexec_fn=os.setsid
            )
        else:
            return error_response("GAME_003", 400, "Unsupported OS type")

        asyncio.create_task(stream_subprocess_output(running_process.stdout, "OUT"))
        asyncio.create_task(stream_subprocess_output(running_process.stderr, "ERR"))
        asyncio.create_task(monitor_process_exit(running_process))

        return {"status": "running", "message": "Server started successfully"}
    except Exception as e:
        running_process = None
        return error_response("BACKEND_002", 500, str(e))


@router.post("/stop")
async def stop_pz_server():
    """Stop Project Zomboid server"""
    global running_process
    if not running_process or running_process.poll() is not None:
        return {"status": "stopped", "message": "Server not running"}

    try:
        if os.name == "nt":
            running_process.terminate()
        else:
            os.killpg(os.getpgid(running_process.pid), signal.SIGTERM)

        running_process = None
        await log_queue.put("[SYSTEM] Server stopped manually")
        return {"status": "stopped", "message": "Server terminated"}
    except Exception as e:
        return error_response("BACKEND_003", 500, str(e))


@router.post("/restart")
async def restart_pz_server(request: Request):
    """Restart Project Zomboid server"""
    await stop_pz_server()
    return await start_pz_server(request)


@router.get("/status")
async def server_status():
    """Check if server is running"""
    global running_process
    if running_process and running_process.poll() is None:
        return {"running": True, "pid": running_process.pid}
    return {"running": False}


@router.get("/terminal/log-stream")
async def terminal_log_stream():
    """SSE log stream for React terminal"""
    async def event_generator():
        while True:
            log = await log_queue.get()
            yield f"data: {log}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")


# ---------------------------
# Command Handling
# ---------------------------
@router.post("/terminal/send-command")
async def send_command(request: Request):
    """Send command to server stdin"""
    global running_process
    if not running_process or running_process.poll() is not None:
        return error_response("BACKEND_004", 400, "Server is not running")

    data = await request.json()
    command = data.get("command", "").strip()

    if not command:
        return error_response("BACKEND_005", 400, "No command provided")

    try:
        running_process.stdin.write(command + "\n")
        running_process.stdin.flush()
        command_history.append(command)
        save_command_history()
        return {"status": "sent", "command": command}
    except Exception as e:
        return error_response("BACKEND_006", 500, str(e))


@router.get("/terminal/command-history")
async def get_command_history():
    """Return the list of previously sent commands"""
    return {"history": command_history[-50:]}  # last 50 commands


# ---------------------------
# Initialize history
# ---------------------------
load_command_history()
