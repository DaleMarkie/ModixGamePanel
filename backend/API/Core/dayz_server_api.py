# backend/API/Core/dayz_server_api.py
import subprocess
import psutil
import time
from fastapi import APIRouter
from fastapi.responses import StreamingResponse, JSONResponse

router = APIRouter(prefix="/api/dayz", tags=["DayZ Server"])

server_process = None
server_start_time = None

# 🔹 Configure your DayZ server executable & parameters here
DAYZ_SERVER_CMD = [
    "./DayZServer",  # Adjust to the correct path if needed
    "-config=serverDZ.cfg",  # Your server config file
    "-port=2302",
    "-profiles=DayZProfile",
    "-dologs",
    "-adminlog",
    "-netlog",
    "-freezecheck"
]

def get_server_stats():
    if server_process and server_process.poll() is None:
        proc = psutil.Process(server_process.pid)
        mem_info = proc.memory_info()
        return {
            "status": "running",
            "cpu": proc.cpu_percent(interval=0.5),
            "ramUsed": mem_info.rss // (1024 * 1024),
            "ramTotal": psutil.virtual_memory().total // (1024 * 1024),
            "uptime": int(time.time() - server_start_time),
        }
    return {"status": "stopped"}

@router.post("/start-server")
async def start_server():
    global server_process, server_start_time
    if server_process and server_process.poll() is None:
        return JSONResponse(content={"message": "DayZ server already running"}, status_code=400)

    try:
        server_process = subprocess.Popen(
            DAYZ_SERVER_CMD,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True,
        )
        server_start_time = time.time()
        return {"message": "✅ DayZ server started"}
    except Exception as e:
        return JSONResponse(content={"detail": str(e)}, status_code=500)

@router.post("/stop-server")
async def stop_server():
    global server_process
    if server_process and server_process.poll() is None:
        server_process.terminate()
        server_process.wait()
        return {"message": "🛑 DayZ server stopped"}
    return JSONResponse(content={"message": "Server not running"}, status_code=400)

@router.post("/restart-server")
async def restart_server():
    global server_process, server_start_time
    # Stop first if running
    if server_process and server_process.poll() is None:
        server_process.terminate()
        server_process.wait()
        time.sleep(2)  # Small delay to ensure cleanup

    try:
        server_process = subprocess.Popen(
            DAYZ_SERVER_CMD,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True,
        )
        server_start_time = time.time()
        return {"message": "🔄 DayZ server restarted"}
    except Exception as e:
        return JSONResponse(content={"detail": str(e)}, status_code=500)

@router.get("/server-stats")
async def server_stats():
    return get_server_stats()

@router.get("/server-logs-stream")
async def stream_logs():
    def log_generator():
        if not server_process or not server_process.stdout:
            yield "data: No server running\n\n"
            return
        for line in server_process.stdout:
            yield f"data: {line.strip()}\n\n"
    return StreamingResponse(log_generator(), media_type="text/event-stream")
