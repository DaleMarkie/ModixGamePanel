# backend/api_main.py
# Ensure project root is in sys.path for direct script execution
import sys
import os
import shutil
import subprocess
import platform
import socket
import datetime
import uuid
from typing import Optional

import psutil
try:
    import GPUtil
except ImportError:
    GPUtil = None

from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.API.Core.database import init_db, create_base_users_from_config, register_module_permissions
from backend.API.Core.container_manager_api import router as container_manager_router
from backend.API.Core.docker_api import router as docker_api_router
from backend.backend_module_loader import register_modules
from backend.API.Core.module_api import router as module_api_router
from backend.API.Core.auth import auth_router

# =========================
# App + Global Config/State
# =========================
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # frontend will call from any origin (adjust if needed)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(docker_api_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(container_manager_router, prefix="/api")
app.include_router(module_api_router, prefix="/api")
register_modules(app)

STEAM_WORKSHOP_DIR = os.path.expanduser("~/Zomboid/steamapps/workshop/content/108600")
STEAMCMD_DIR = os.path.expanduser("~/steamcmd")
PZ_SERVER_DIR = os.path.expanduser("~/pzserver")
START_SCRIPT = os.path.join(PZ_SERVER_DIR, "start-server.sh")

# Router for terminal/server endpoints
router = APIRouter(prefix="/api", tags=["terminal"])

# Queues/Processes for logs
import threading
from queue import Queue, Empty

server_process: subprocess.Popen | None = None
server_log_queue: Queue[str] = Queue()

install_process: subprocess.Popen | None = None
install_log_queue: Queue[str] = Queue()

_server_started_at: Optional[float] = None


def _enqueue_output(stream, queue: Queue, finished_marker: str):
    """Read lines from a process stream and push to a queue; add a final marker."""
    for line in iter(stream.readline, ""):
        if not line:
            break
        queue.put(line.rstrip("\n"))
    try:
        stream.close()
    except Exception:
        pass
    queue.put(finished_marker)


def _ensure_steamcmd():
    """Download steamcmd if not present."""
    os.makedirs(STEAMCMD_DIR, exist_ok=True)
    steamcmd_path = os.path.join(STEAMCMD_DIR, "steamcmd.sh")
    if not os.path.exists(steamcmd_path):
        subprocess.run(
            [
                "bash", "-c",
                f"cd {STEAMCMD_DIR} && curl -sqL https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz | tar zxvf -"
            ],
            check=True
        )
    return steamcmd_path


# ================
# Install Endpoints
# ================
@router.post("/install-server")
async def install_server():
    """
    Install or update Project Zomboid Dedicated Server via SteamCMD.
    Frontend will listen on /api/install-logs for live output.
    """
    global install_process

    # If an install is already running, don't start another
    if install_process and install_process.poll() is None:
        return {"message": "Installation already running"}

    os.makedirs(PZ_SERVER_DIR, exist_ok=True)
    steamcmd_path = _ensure_steamcmd()

    cmd = [
        steamcmd_path,
        "+login", "anonymous",
        "+force_install_dir", PZ_SERVER_DIR,
        "+app_update", "380870", "validate",
        "+quit"
    ]

    install_process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        universal_newlines=True,
    )

    threading.Thread(
        target=_enqueue_output,
        args=(install_process.stdout, install_log_queue, "[Install finished]"),
        daemon=True,
    ).start()

    return {"message": "Installation started"}


@router.get("/install-logs")
async def install_logs():
    """Stream SteamCMD install logs via SSE."""
    def event_stream():
        while True:
            try:
                line = install_log_queue.get(timeout=1)
                yield f"data: {line}\n\n"
                if line == "[Install finished]":
                    break
            except Empty:
                continue

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# ==============
# Server Control
# ==============
@router.post("/start-server")
async def start_server():
    """
    Start the PZ server if installed.
    Frontend will listen on /api/server-logs-stream for live output.
    """
    global server_process, _server_started_at

    if not os.path.exists(START_SCRIPT):
        return JSONResponse({"error": "Server files missing. Please click Install Server first."}, status_code=400)

    # Only one instance
    if server_process and server_process.poll() is None:
        return {"message": "Server already running", "pid": server_process.pid}

    # Ensure script is executable
    try:
        os.chmod(START_SCRIPT, 0o755)
    except Exception:
        pass

    server_process = subprocess.Popen(
        ["bash", START_SCRIPT, "-nosteam"],
        cwd=PZ_SERVER_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        universal_newlines=True,
    )

    _server_started_at = datetime.datetime.now().timestamp()

    threading.Thread(
        target=_enqueue_output,
        args=(server_process.stdout, server_log_queue, "[Process finished]"),
        daemon=True,
    ).start()

    return {"message": "Project Zomboid server started", "pid": server_process.pid}


@router.get("/server-logs-stream")
async def server_logs_stream():
    """Stream server logs via SSE."""
    def event_stream():
        while True:
            try:
                line = server_log_queue.get(timeout=1)
                yield f"data: {line}\n\n"
                if line == "[Process finished]":
                    break
            except Empty:
                continue

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/shutdown-server")
async def shutdown_server():
    """Stop the running PZ server process."""
    global server_process, _server_started_at

    if not server_process or server_process.poll() is not None:
        return {"message": "No server is running"}

    # Try graceful first
    server_process.terminate()
    try:
        server_process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server_process.kill()

    server_process = None
    _server_started_at = None
    server_log_queue.put("[System] Server shutdown requested")
    server_log_queue.put("[Process finished]")

    return {"message": "Server stopped"}


# =============
# Server Stats
# =============
@router.get("/server-stats")
async def server_stats():
    """
    Minimal stats for the React header:
      { status: 'running'|'stopped', cpu, ramUsed, ramTotal, uptime }
    """
    status = "running" if server_process and server_process.poll() is None else "stopped"

    # CPU %
    try:
        cpu = psutil.cpu_percent(interval=0.1)
    except Exception:
        cpu = None

    # RAM
    try:
        vm = psutil.virtual_memory()
        ram_total = round(vm.total / (1024**3), 2)
        ram_used = round((vm.total - vm.available) / (1024**3), 2)
    except Exception:
        ram_total = ram_used = None

    # Uptime
    if status == "running" and _server_started_at:
        delta = int(datetime.datetime.now().timestamp() - _server_started_at)
        uptime = str(datetime.timedelta(seconds=delta))
    else:
        uptime = "0:00:00"

    return {
        "status": status,
        "cpu": cpu,
        "ramUsed": ram_used,
        "ramTotal": ram_total,
        "uptime": uptime,
    }


# Attach the router
app.include_router(router)

# ======================
# System info & Mod APIs
# ======================
@app.get("/api/server-info")
def get_server_info():
    try:
        # CPU
        cpu_model = platform.processor() or "Unknown"
        cpu_cores = f"{psutil.cpu_count(logical=False)} physical / {psutil.cpu_count(logical=True)} logical"
        cpu_clock = f"{psutil.cpu_freq().current:.2f} MHz" if psutil.cpu_freq() else "Unknown"
        cpu_arch = platform.machine()
        cpu_flags = " | ".join(platform.uname())

        # Memory
        mem = psutil.virtual_memory()
        swap = psutil.swap_memory()

        # Disk
        disk_total = psutil.disk_usage("/").total // (1024**3)
        disk_root = psutil.disk_usage("/").used // (1024**3)
        data_path = "/data"
        disk_data = psutil.disk_usage(data_path).used // (1024**3) if os.path.exists(data_path) else 0

        # Network
        hostname = socket.gethostname()
        primary_ip = socket.gethostbyname(hostname)
        public_ip = "N/A"
        interfaces = psutil.net_if_addrs()
        primary_iface = list(interfaces.keys())[0] if interfaces else "Unknown"
        net_io = psutil.net_io_counters()
        rx_tx = f"RX: {net_io.bytes_recv // (1024**2)} MB / TX: {net_io.bytes_sent // (1024**2)} MB"

        # OS
        os_name = platform.system()
        platform_info = platform.platform()
        kernel = platform.release()
        uptime_seconds = int(datetime.datetime.now().timestamp() - psutil.boot_time())
        uptime = str(datetime.timedelta(seconds=uptime_seconds))

        # Docker
        running_in_docker = os.path.exists("/.dockerenv")
        container_id = uuid.uuid4().hex[:12] if running_in_docker else "N/A"

        # GPU
        if GPUtil:
            gpus = GPUtil.getGPUs()
        else:
            gpus = []
        if gpus:
            gpu = {
                "model": gpus[0].name,
                "driver": gpus[0].driver,
                "vram": f"{gpus[0].memoryTotal} MB",
                "cuda": gpus[0].uuid,
            }
        else:
            gpu = {"model": "N/A", "driver": "N/A", "vram": "N/A", "cuda": "N/A"}

        extra = {
            "timezone": datetime.datetime.now().astimezone().tzname(),
            "locale": os.getenv("LANG", "en_US"),
            "shell": os.getenv("SHELL", "N/A"),
            "python": platform.python_version(),
            "nodejs": "Unknown",
        }

        modix = {
            "version": "1.0.0",
            "gitCommit": "abcdef123",
            "buildTime": datetime.datetime.now().isoformat(),
            "environment": "production",
            "apiPort": "2010",
            "frontendPort": "3000",
        }

        return {
            "cpu": {"model": cpu_model, "cores": cpu_cores, "clockSpeed": cpu_clock, "architecture": cpu_arch, "flags": cpu_flags},
            "memory": {"total": f"{mem.total // (1024**3)} GB", "used": f"{mem.used // (1024**3)} GB", "swapTotal": f"{swap.total // (1024**3)} GB", "swapUsed": f"{swap.used // (1024**3)} GB"},
            "disk": {"total": f"{disk_total} GB", "root": f"{disk_root} GB", "data": f"{disk_data} GB"},
            "network": {"primaryIP": primary_ip, "publicIP": public_ip, "interface": primary_iface, "rxTx": rx_tx},
            "os": {"os": os_name, "platform": platform_info, "kernel": kernel, "uptime": uptime, "hostname": hostname},
            "docker": {"runningInDocker": str(running_in_docker), "containerID": container_id, "image": "N/A", "volumes": "N/A"},
            "modix": modix,
            "gpu": gpu,
            "extra": extra,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# === Mods (unchanged from your code) ===
def read_mod_name_from_info(mod_dir: str) -> str:
    info_file = os.path.join(mod_dir, "mod.info")
    if os.path.isfile(info_file):
        try:
            with open(info_file, encoding="utf-8", errors="ignore") as f:
                for line in f:
                    if line.lower().startswith("name="):
                        return line.split("=", 1)[1].strip()
        except:
            pass
    mods_subdir = os.path.join(mod_dir, "mods")
    if os.path.isdir(mods_subdir):
        for sub in os.scandir(mods_subdir):
            if sub.is_dir():
                nested_info = os.path.join(sub.path, "mod.info")
                if os.path.isfile(nested_info):
                    try:
                        with open(nested_info, encoding="utf-8", errors="ignore") as f:
                            for line in f:
                                if line.lower().startswith("name="):
                                    return line.split("=", 1)[1].strip()
                    except:
                        pass
    return os.path.basename(mod_dir)

@app.get("/api/mods")
def list_mods():
    if not os.path.exists(STEAM_WORKSHOP_DIR):
        raise HTTPException(status_code=404, detail="Workshop folder not found.")
    mods = []
    for entry in os.scandir(STEAM_WORKSHOP_DIR):
        if entry.is_dir():
            mod_name = read_mod_name_from_info(entry.path)
            poster_path = None
            for root, _, files in os.walk(entry.path):
                if "poster.png" in files:
                    poster_path = os.path.join(root, "poster.png")
                    break
            mods.append({
                "id": entry.name,
                "name": mod_name,
                "path": os.path.abspath(entry.path),
                "poster": f"/api/mods/{entry.name}/poster" if poster_path else None,
                "enabled": True
            })
    return {"mods": mods}

@app.get("/api/mods/{mod_id}/poster")
def get_mod_poster(mod_id: str):
    mod_path = os.path.join(STEAM_WORKSHOP_DIR, mod_id)
    if not os.path.exists(mod_path):
        raise HTTPException(status_code=404, detail="Mod not found.")
    for root, _, files in os.walk(mod_path):
        if "poster.png" in files:
            return FileResponse(os.path.join(root, "poster.png"))
    raise HTTPException(status_code=404, detail="Poster not found.")

@app.post("/api/mods/{mod_id}/toggle")
def toggle_mod(mod_id: str):
    mod_path = os.path.join(STEAM_WORKSHOP_DIR, mod_id)
    if not os.path.exists(mod_path):
        raise HTTPException(status_code=404, detail="Mod not found.")
    return {"status": "ok", "message": f"Mod {mod_id} toggled"}

@app.delete("/api/mods/{mod_id}")
def delete_mod(mod_id: str):
    mod_path = os.path.join(STEAM_WORKSHOP_DIR, mod_id)
    if not os.path.exists(mod_path):
        raise HTTPException(status_code=404, detail="Mod not found.")
    try:
        shutil.rmtree(mod_path)
        return {"status": "ok", "message": f"Mod {mod_id} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/mods/open")
def open_mod_folder(data: dict):
    path: Optional[str] = data.get("path")
    if not path or not os.path.exists(path):
        raise HTTPException(status_code=400, detail="Invalid path")
    try:
        if sys.platform.startswith("linux"):
            subprocess.Popen(["xdg-open", path])
        elif sys.platform == "win32":
            os.startfile(path)
        elif sys.platform == "darwin":
            subprocess.Popen(["open", path])
        else:
            raise HTTPException(status_code=500, detail="Unsupported OS")
        return {"status": "ok", "message": f"Opened {path}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========
# Lifecycle
# =========
@app.on_event("startup")
def on_startup():
    init_db()
    create_base_users_from_config()
    register_module_permissions()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api_main:app", host="0.0.0.0", port=2010)
