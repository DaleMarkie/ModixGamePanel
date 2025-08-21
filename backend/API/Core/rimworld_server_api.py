# backend/API/Core/rimworld_server_api.py
import subprocess
import psutil
import time
from fastapi import APIRouter, Response
from fastapi.responses import StreamingResponse, JSONResponse

router = APIRouter(prefix="/api/rimworld", tags=["RimWorld Server"])

server_process = None
server_start_time = None

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
        return JSONResponse(content={"message": "RimWorld server already running"}, status_code=400)

    try:
        # ⚠️ Adjust path to where your RimWorldLinux.x86_64 or dedicated server binary is
        server_process = subprocess.Popen(
            ["./RimWorldLinux.x86_64", "-batchmode", "-nographics", "-logfile", "server.log"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True,
        )
        server_start_time = time.time()
        return {"message": "✅ RimWorld server started"}
    except Exception as e:
        return JSONResponse(content={"detail": str(e)}, status_code=500)

@router.post("/stop-server")
async def stop_server():
    global server_process
    if server_process and server_process.poll() is None:
        server_process.terminate()
        server_process.wait()
        return {"message": "🛑 RimWorld server stopped"}
    return JSONResponse(content={"message": "Server not running"}, status_code=400)

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
