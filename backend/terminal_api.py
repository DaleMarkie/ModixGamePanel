import os
import subprocess
import asyncio
from typing import Optional
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, StreamingResponse

router = APIRouter()

# ---------------------------
# Global process & logs
# ---------------------------
running_process: Optional[subprocess.Popen] = None
log_queue: asyncio.Queue = asyncio.Queue()

# ---------------------------
# Utils
# ---------------------------
def is_valid_batch(batch_file: str) -> bool:
    """Check if the path is a valid Windows batch file."""
    return bool(batch_file) and os.path.isfile(batch_file) and batch_file.lower().endswith(".bat")

async def stream_output(stream):
    loop = asyncio.get_event_loop()
    while True:
        line = await loop.run_in_executor(None, stream.readline)
        if not line:
            break
        await log_queue.put(line.decode(errors="ignore").strip())

async def monitor_exit(process):
    global running_process
    await asyncio.get_event_loop().run_in_executor(None, process.wait)
    await log_queue.put("[SYSTEM] Server stopped")
    running_process = None

# ---------------------------
# Endpoints
# ---------------------------

@router.post("/validate-batch")
async def validate_batch_endpoint(request: Request):
    data = await request.json()
    batch_file = data.get("batchFile")
    return {"valid": is_valid_batch(batch_file)}

@router.post("/start")
async def start_server(request: Request):
    global running_process
    if running_process:
        return JSONResponse({"error": "Server already running"}, status_code=400)

    data = await request.json()
    batch_file = data.get("batchFile")
    if not is_valid_batch(batch_file):
        return JSONResponse({"error": f"Invalid batch file: {batch_file}"}, status_code=400)

    try:
        running_process = subprocess.Popen(
            batch_file,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            stdin=subprocess.PIPE,
            shell=True
        )
        asyncio.create_task(stream_output(running_process.stdout))
        asyncio.create_task(monitor_exit(running_process))
        return {"success": True, "message": "Server started"}
    except Exception as e:
        running_process = None
        return JSONResponse({"error": str(e)}, status_code=500)

@router.post("/stop")
async def stop_server():
    global running_process
    if not running_process:
        return JSONResponse({"error": "Server not running"}, status_code=400)
    running_process.terminate()
    return {"success": True, "message": "Server stopping..."}

@router.post("/command")
async def send_command(request: Request):
    global running_process
    data = await request.json()
    cmd = data.get("command")
    if not running_process or not cmd:
        return JSONResponse({"error": "Server not running or invalid command"}, status_code=400)
    try:
        running_process.stdin.write((cmd + "\n").encode())
        running_process.stdin.flush()
        return {"success": True, "command": cmd}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@router.get("/terminal/log-stream")
async def log_stream():
    async def event_generator():
        while True:
            log = await log_queue.get()
            yield f"data: {log}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")
