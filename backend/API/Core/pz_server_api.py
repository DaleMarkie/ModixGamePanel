import os
import sys
import psutil
import asyncio
import subprocess
import shutil
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from typing import Optional

router = APIRouter(tags=["ProjectZomboid"])

# -------------------------
# Models
# -------------------------
class ServerOptions(BaseModel):
    os: str  # "linux" | "windows" | "chromeos"
    customPath: Optional[str] = None

class CommandRequest(BaseModel):
    command: str

# -------------------------
# Globals
# -------------------------
server_process: Optional[subprocess.Popen] = None
server_logs: asyncio.Queue[str] = asyncio.Queue()
server_stdin = None

steamcmd_process: Optional[subprocess.Popen] = None
steamcmd_logs: asyncio.Queue[str] = asyncio.Queue()

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GAMEFILES_DIR = os.path.join(PROJECT_ROOT, "backend", "gamefiles", "projectzomboid")
START_SCRIPT_LINUX = os.path.join(GAMEFILES_DIR, "start-server.sh")
START_SCRIPT_WINDOWS = os.path.join(GAMEFILES_DIR, "start-server.bat")

WORKSHOP_DIR_LINUX = os.path.expanduser("~/Zomboid/steamapps/workshop/content/108600")
WORKSHOP_DIR_WINDOWS = os.path.join(
    os.getenv("ProgramFiles(x86)", "C:\\Program Files (x86)"),
    "Steam", "steamapps", "workshop", "content", "108600"
)

# -------------------------
# Helpers
# -------------------------
def is_chromeos() -> bool:
    """Detect if running inside ChromeOS Crostini container."""
    try:
        return os.path.exists("/dev/.crosvm") or "CROS" in os.uname().release.upper()
    except Exception:
        return False

def get_default_script(os_type: str) -> str:
    if os_type == "windows":
        return START_SCRIPT_WINDOWS
    else:  # linux + chromeos
        return START_SCRIPT_LINUX

def get_workshop_dir(os_type: Optional[str] = None) -> str:
    """Return the correct workshop dir based on OS type or auto-detect."""
    if os_type == "windows" or sys.platform == "win32":
        return WORKSHOP_DIR_WINDOWS
    if os_type == "chromeos" or (os_type is None and is_chromeos()):
        candidates = [
            os.path.expanduser("~/.steam/steam/steamapps/workshop/content/108600"),
            os.path.expanduser("~/.var/app/com.valvesoftware.Steam/.steam/steam/steamapps/workshop/content/108600"),
            WORKSHOP_DIR_LINUX,  # fallback
        ]
        for c in candidates:
            if os.path.exists(c):
                return c
        return WORKSHOP_DIR_LINUX
    return WORKSHOP_DIR_LINUX

async def enqueue_output(stream, queue):
    loop = asyncio.get_running_loop()
    while True:
        line = await loop.run_in_executor(None, stream.readline)
        if not line:
            break
        await queue.put(line.strip())

# -------------------------
# Server Routes
# -------------------------
@router.post("/start-server")
async def start_server(options: ServerOptions):
    global server_process, server_stdin

    if server_process and server_process.poll() is None:
        return JSONResponse({"error": "Server already running"}, status_code=400)

    script = options.customPath or get_default_script(options.os)
    if not os.path.exists(script):
        return JSONResponse({"error": f"Server script not found: {script}"}, status_code=400)

    try:
        if options.os == "windows":
            cmd = [script]
        else:  # linux + chromeos
            cmd = ["bash", script]

        server_process = subprocess.Popen(
            cmd,
            cwd=GAMEFILES_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            stdin=subprocess.PIPE,
            bufsize=1,
            text=True,
            shell=(options.os == "windows"),
        )
        server_stdin = server_process.stdin

        asyncio.create_task(enqueue_output(server_process.stdout, server_logs))

        return {"status": "starting", "path": script, "os": options.os}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@router.get("/server-logs-stream")
async def server_logs_stream(request: Request):
    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            try:
                line = await asyncio.wait_for(server_logs.get(), timeout=1.0)
                yield f"data: {line}\n\n"
            except asyncio.TimeoutError:
                continue
            if server_process and server_process.poll() is not None:
                yield f"data: [Server finished]\n\n"
                break

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/send-command")
async def send_command(req: CommandRequest):
    global server_stdin, server_process
    if not server_process or server_process.poll() is not None:
        return JSONResponse({"error": "Server not running"}, status_code=400)

    try:
        server_stdin.write(req.command + "\n")
        server_stdin.flush()
        return {"status": "sent", "command": req.command}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@router.post("/shutdown-server")
async def shutdown_server():
    global server_process
    if not server_process or server_process.poll() is not None:
        return {"status": "not running"}

    server_process.terminate()
    try:
        server_process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server_process.kill()
    return {"status": "stopped"}

@router.get("/server-stats")
async def server_stats():
    global server_process
    if not server_process or server_process.poll() is not None:
        return {"status": "stopped"}

    try:
        proc = psutil.Process(server_process.pid)
        mem = proc.memory_info().rss / 1024 / 1024
        total = psutil.virtual_memory().total / 1024 / 1024
        cpu = proc.cpu_percent(interval=0.5)
        uptime = int((psutil.boot_time() - proc.create_time()) * -1)
        return {
            "status": "running",
            "ramUsed": round(mem, 2),
            "ramTotal": round(total, 2),
            "cpu": cpu,
            "uptime": f"{uptime}s",
        }
    except Exception as e:
        return {"status": "running", "error": str(e)}

# -------------------------
# SteamCMD
# -------------------------
def detect_steamcmd(os_type: Optional[str] = None) -> Optional[str]:
    """Detect SteamCMD path depending on OS type or auto-detect."""
    if os_type == "windows" or sys.platform == "win32":
        candidates = [
            shutil.which("steamcmd"),
            r"C:\steamcmd\steamcmd.exe",
            r"C:\Program Files (x86)\Steam\steamcmd.exe",
        ]
    elif os_type == "chromeos" or (os_type is None and is_chromeos()):
        candidates = [
            shutil.which("steamcmd"),
            os.path.expanduser("~/steamcmd/steamcmd.sh"),
            "/usr/games/steamcmd",
            os.path.expanduser("~/.var/app/com.valvesoftware.Steam/data/steamcmd/steamcmd.sh"),  # ChromeOS Flatpak
        ]
    else:  # generic linux
        candidates = [
            shutil.which("steamcmd"),
            os.path.expanduser("~/steamcmd/steamcmd.sh"),
            "/usr/games/steamcmd",
        ]

    for c in candidates:
        if c and os.path.exists(c):
            return c
    return None

@router.post("/steamcmd-update")
async def steamcmd_update(options: Optional[ServerOptions] = None):
    global steamcmd_process

    if steamcmd_process and steamcmd_process.poll() is None:
        return JSONResponse({"error": "SteamCMD update already running"}, status_code=400)

    os_type = options.os if options else None
    steamcmd_path = detect_steamcmd(os_type)
    if not steamcmd_path:
        raise HTTPException(status_code=500, detail="SteamCMD not found. Please install it and add to PATH.")

    cmd = [
        steamcmd_path,
        "+login", "anonymous",
        "+force_install_dir", GAMEFILES_DIR,
        "+app_update", "380870", "validate",
        "+quit",
    ]

    try:
        steamcmd_process = subprocess.Popen(
            cmd,
            cwd=GAMEFILES_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            bufsize=1,
            text=True,
        )
        asyncio.create_task(enqueue_output(steamcmd_process.stdout, steamcmd_logs))
        return {"status": "updating", "cmd": " ".join(cmd)}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@router.get("/steamcmd-logs-stream")
async def steamcmd_logs_stream(request: Request):
    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            try:
                line = await asyncio.wait_for(steamcmd_logs.get(), timeout=1.0)
                yield f"data: {line}\n\n"
            except asyncio.TimeoutError:
                continue
            if steamcmd_process and steamcmd_process.poll() is not None:
                yield f"data: [SteamCMD finished]\n\n"
                break

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# -------------------------
# Healthcheck
# -------------------------
@router.get("/ping")
async def ping():
    return {"status": "ok"}
