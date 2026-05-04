import os
import asyncio
import signal
import subprocess
import json
from typing import Optional, List

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, StreamingResponse

# ---------------------------
# ACTIVE GAME IMPORT
# ---------------------------
from backend.state.active_game import get_active_game

router = APIRouter()

# ---------------------------
# GLOBAL STATE
# ---------------------------
running_process: Optional[subprocess.Popen] = None
log_queue: asyncio.Queue = asyncio.Queue()
command_history: List[str] = []

HISTORY_FILE = os.path.expanduser("~/.modix/command_history.json")
MAX_HISTORY = 500


# ---------------------------
# UTILS
# ---------------------------
def error_response(code: str, status_code: int, message: str):
    return JSONResponse({"error": code, "message": message}, status_code=status_code)


def load_command_history():
    global command_history
    if os.path.isfile(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                command_history = json.load(f)
        except Exception:
            command_history = []


def save_command_history():
    os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(command_history[-MAX_HISTORY:], f, indent=2)
    except Exception as e:
        print(f"[WARN] history save failed: {e}")


async def stream_subprocess_output(stream, prefix: str):
    loop = asyncio.get_event_loop()
    while True:
        line = await loop.run_in_executor(None, stream.readline)
        if not line:
            break
        await log_queue.put(f"[{prefix}] {line.strip()}")


async def monitor_process_exit(process):
    global running_process
    await asyncio.get_event_loop().run_in_executor(None, process.wait)
    await log_queue.put("[SYSTEM] Server stopped")
    running_process = None


# ---------------------------
# GAME ROUTER CORE
# ---------------------------
def get_game_prefix():
    """
    Converts active game into log prefix.
    """
    game = get_active_game()
    return game.upper() if game else "NO_GAME"


def build_game_command(command: str):
    """
    Future proof hook for per-game command mapping.
    """
    game = get_active_game()

    if not game:
        return command

    # You can expand this later per game
    if game == "projectzomboid":
        return command

    if game == "rust":
        return command

    return command


# ---------------------------
# START SERVER
# ---------------------------
@router.post("/start")
async def start_server(request: Request):
    global running_process

    if running_process and running_process.poll() is None:
        return error_response("BACKEND_001", 400, "Server already running")

    try:
        data = await request.json()

        startup_file = data.get("startupFile")
        os_type = data.get("os", "").lower()

        game = get_active_game()

        await log_queue.put(f"[SYSTEM] Starting server for game: {game}")

        if not startup_file or not os.path.isfile(startup_file):
            return error_response("GAME_002", 404, "Startup file not found")

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

        return {
            "status": "running",
            "game": game,
            "message": "Server started"
        }

    except Exception as e:
        running_process = None
        return error_response("BACKEND_002", 500, str(e))


# ---------------------------
# STOP SERVER
# ---------------------------
@router.post("/stop")
async def stop_server():
    global running_process

    if not running_process or running_process.poll() is not None:
        return {"status": "stopped"}

    try:
        if os.name == "nt":
            running_process.terminate()
        else:
            os.killpg(os.getpgid(running_process.pid), signal.SIGTERM)

        running_process = None
        await log_queue.put("[SYSTEM] Server stopped manually")

        return {"status": "stopped"}

    except Exception as e:
        return error_response("BACKEND_003", 500, str(e))


# ---------------------------
# RESTART
# ---------------------------
@router.post("/restart")
async def restart_server(request: Request):
    await stop_server()
    return await start_server(request)


# ---------------------------
# STATUS
# ---------------------------
@router.get("/status")
async def status():
    return {
        "running": running_process is not None and running_process.poll() is None,
        "game": get_active_game()
    }


# ---------------------------
# LOG STREAM
# ---------------------------
@router.get("/terminal/log-stream")
async def log_stream():
    async def gen():
        while True:
            log = await log_queue.get()
            yield f"data: {log}\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream")


# ---------------------------
# COMMAND EXECUTION (UPDATED)
# ---------------------------
@router.post("/terminal/send-command")
async def send_command(request: Request):
    global running_process

    if not running_process or running_process.poll() is not None:
        return error_response("BACKEND_004", 400, "Server not running")

    data = await request.json()
    command = data.get("command", "").strip()

    if not command:
        return error_response("BACKEND_005", 400, "No command")

    try:
        game = get_active_game()
        command = build_game_command(command)

        running_process.stdin.write(command + "\n")
        running_process.stdin.flush()

        command_history.append(command)
        save_command_history()

        await log_queue.put(f"[{get_game_prefix()}] CMD: {command}")

        return {
            "status": "sent",
            "game": game,
            "command": command
        }

    except Exception as e:
        return error_response("BACKEND_006", 500, str(e))


# ---------------------------
# HISTORY
# ---------------------------
@router.get("/terminal/command-history")
async def history():
    return {"history": command_history[-50:]}


# ---------------------------
# INIT
# ---------------------------
load_command_history()