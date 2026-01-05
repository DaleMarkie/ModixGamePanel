import os
import sys
import asyncio
import subprocess
import datetime
from typing import Optional, Set, List
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse

router = APIRouter()

# ============================================================
# Globals
# ============================================================
running_process: Optional[subprocess.Popen] = None
current_script: Optional[str] = None
start_time: Optional[datetime.datetime] = None
auto_restart: bool = True

log_subscribers: Set[asyncio.Queue] = set()
process_lock = asyncio.Lock()

COMMAND_HISTORY_SIZE = 50
command_history: List[str] = []

# ============================================================
# Utils
# ============================================================

def is_windows() -> bool:
    return sys.platform.startswith("win")


def is_valid_script(path: str) -> bool:
    """
    Check if the path points to a valid batch/sh script.
    Supports files from any drive or mounted volume.
    """
    if not path:
        return False

    abs_path = os.path.abspath(path)

    if not os.path.isfile(abs_path):
        return False

    if is_windows():
        return abs_path.lower().endswith(".bat")
    return abs_path.lower().endswith(".sh")


async def broadcast_log(message: str):
    """Send log line to all connected SSE clients."""
    dead = set()
    for q in log_subscribers:
        try:
            q.put_nowait(message)
        except asyncio.QueueFull:
            dead.add(q)
    for q in dead:
        log_subscribers.discard(q)


async def read_stream(stream):
    """Read process output without blocking the event loop."""
    loop = asyncio.get_running_loop()
    while True:
        line = await loop.run_in_executor(None, stream.readline)
        if not line:
            break
        await broadcast_log(line.decode(errors="ignore").rstrip())


async def monitor_process(proc: subprocess.Popen, script: str):
    """Wait for process exit and cleanup. Auto-restart if enabled."""
    global running_process, current_script, start_time

    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, proc.wait)

    await broadcast_log("[SYSTEM] Server process exited")
    running_process = None
    start_time = None

    # Auto-restart logic
    if auto_restart and is_valid_script(script):
        await asyncio.sleep(2)  # slight delay before restart
        await broadcast_log("[SYSTEM] Auto-restarting server...")
        asyncio.create_task(_start_server_internal(script))


async def _start_server_internal(script: str):
    """Internal method to start the server without endpoint validation."""
    global running_process, current_script, start_time

    abs_script = os.path.abspath(script)
    if not is_valid_script(abs_script):
        await broadcast_log(f"[ERROR] Script not found or invalid: {abs_script}")
        return

    try:
        running_process = subprocess.Popen(
            abs_script,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            shell=is_windows(),
            bufsize=1
        )
        current_script = abs_script
        start_time = datetime.datetime.utcnow()

        asyncio.create_task(read_stream(running_process.stdout))
        asyncio.create_task(monitor_process(running_process, abs_script))
        await broadcast_log(f"[SYSTEM] Server started: {abs_script}")
    except Exception as e:
        running_process = None
        await broadcast_log(f"[ERROR] Failed to start server: {e}")


# ============================================================
# Endpoints
# ============================================================

@router.post("/validate-batch")
async def validate_script(request: Request):
    data = await request.json()
    return {"valid": is_valid_script(data.get("batchFile"))}


@router.post("/start")
async def start_server(request: Request):
    async with process_lock:
        if running_process:
            raise HTTPException(400, "Server already running")
        data = await request.json()
        script = data.get("batchFile")
        global auto_restart
        auto_restart = data.get("autoRestart", True)

        if not is_valid_script(script):
            raise HTTPException(400, f"Invalid script: {script}")

        await _start_server_internal(script)
        return {"success": True}


@router.post("/stop")
async def stop_server():
    async with process_lock:
        global running_process
        if not running_process:
            raise HTTPException(400, "Server not running")

        running_process.terminate()
        await broadcast_log("[SYSTEM] Stop signal sent")
        return {"success": True}


@router.post("/command")
async def send_command(request: Request):
    data = await request.json()
    cmd = data.get("command")

    if not running_process or not cmd:
        raise HTTPException(400, "Server not running or invalid command")

    try:
        if running_process.stdin is None:
            raise HTTPException(400, "Server stdin not available")
        running_process.stdin.write((cmd + "\n").encode())
        running_process.stdin.flush()

        # Save to command history
        command_history.append(cmd)
        if len(command_history) > COMMAND_HISTORY_SIZE:
            command_history.pop(0)

        await broadcast_log(f"> {cmd}")
        return {"success": True, "command": cmd}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/terminal/log-stream")
async def log_stream():
    queue = asyncio.Queue(maxsize=200)
    log_subscribers.add(queue)

    async def event_generator():
        try:
            await broadcast_log("[SYSTEM] Log stream connected")
            while True:
                msg = await queue.get()
                yield f"data: {msg}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            log_subscribers.discard(queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/status")
async def server_status():
    """Returns server status info."""
    return {
        "running": running_process is not None,
        "script": current_script,
        "uptime_seconds": (datetime.datetime.utcnow() - start_time).total_seconds() if start_time else 0,
        "auto_restart": auto_restart,
        "command_history": command_history[-COMMAND_HISTORY_SIZE:]
    }
