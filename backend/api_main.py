import os
import subprocess
import asyncio
import signal
from threading import Thread
from typing import List, Dict, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# =========================================================
# AUTO PATH RESOLUTION 
# =========================================================

BASE_DIR = os.getenv("MODIX_BASE_DIR") or os.path.expanduser("~")
ZOMBOID_DIR = os.getenv("ZOMBOID_DIR") or os.path.join(BASE_DIR, "ZomboidServer")

MODS_DIR = os.path.join(ZOMBOID_DIR, "mods")
START_SCRIPT = os.path.join(ZOMBOID_DIR, "start-server.sh")
PID_FILE = os.path.join(ZOMBOID_DIR, "server.pid")

# ZOMBOID LOG (IMPORTANT FOR CHAT)
ZOMBOID_LOG = os.path.join(ZOMBOID_DIR, "Logs", "console.txt")

# =========================================================
# APP
# =========================================================

app = FastAPI(title="Modix Panel Backend (Portable)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

log_clients: set[WebSocket] = set()
EVENT_LOOP = None


@app.on_event("startup")
async def startup_event():
    global EVENT_LOOP
    EVENT_LOOP = asyncio.get_running_loop()

    # START CHAT BRIDGE AUTOMATICALLY
    asyncio.create_task(chat_log_tailer())


# =========================================================
# FILE TREE
# =========================================================

def build_file_tree(path: str) -> List[Dict[str, Any]]:
    if not os.path.exists(path):
        return []

    tree = []

    try:
        for item in sorted(os.listdir(path)):
            full = os.path.join(path, item)

            if os.path.isdir(full):
                tree.append({
                    "name": item,
                    "path": full,
                    "type": "folder",
                    "children": build_file_tree(full)
                })
            else:
                tree.append({
                    "name": item,
                    "path": full,
                    "type": "file"
                })
    except:
        return []

    return tree


# =========================================================
# 🔥 LIVE PROJECT ZOMBOID CHAT BRIDGE
# =========================================================

def parse_chat(line: str):
    line = line.strip()

    # basic detection (adjust if your logs differ)
    if "chat" in line.lower() or "say:" in line.lower():
        parts = line.split(":")
        if len(parts) >= 2:
            return {
                "player": parts[0].strip(),
                "message": ":".join(parts[1:]).strip(),
                "timestamp": "",
                "chat_type": "Global"
            }

    return None


async def broadcast_chat(msg):
    dead = set()

    for ws in log_clients:
        try:
            await ws.send_json(msg)
        except:
            dead.add(ws)

    for d in dead:
        log_clients.remove(d)


async def chat_log_tailer():
    if not os.path.exists(ZOMBOID_LOG):
        print("Zomboid log not found:", ZOMBOID_LOG)
        return

    with open(ZOMBOID_LOG, "r", encoding="utf-8", errors="ignore") as f:
        f.seek(0, os.SEEK_END)

        while True:
            line = f.readline()

            if not line:
                await asyncio.sleep(0.2)
                continue

            msg = parse_chat(line)

            if msg:
                await broadcast_chat(msg)


# =========================================================
# WEBSOCKET ENDPOINT (LIVE CHAT)
# =========================================================

@app.websocket("/ws/zomboid-chat")
async def zomboid_chat_ws(websocket: WebSocket):
    await websocket.accept()
    log_clients.add(websocket)

    try:
        while True:
            # keep alive
            await websocket.receive_text()

    except WebSocketDisconnect:
        log_clients.discard(websocket)


# =========================================================
# WORKSHOP API
# =========================================================

workshop_router = APIRouter()

@workshop_router.get("/")
def get_workshop_mods():

    if not os.path.exists(MODS_DIR):
        return {
            "mods": [],
            "status": "missing",
            "message": f"Mods directory not found at {MODS_DIR}"
        }

    mods = []

    try:
        entries = os.listdir(MODS_DIR)
    except Exception as e:
        return {
            "mods": [],
            "status": "error",
            "message": str(e)
        }

    for mod_id in entries:
        mod_path = os.path.join(MODS_DIR, mod_id)

        if not os.path.isdir(mod_path):
            continue

        mods.append({
            "id": mod_id,
            "name": mod_id,
            "path": mod_path,
            "files": build_file_tree(mod_path)
        })

    if len(mods) == 0:
        return {
            "mods": [],
            "status": "empty",
            "message": "No mods found in mods folder"
        }

    return {
        "mods": mods,
        "status": "ok",
        "count": len(mods),
        "mods_path": MODS_DIR
    }


@workshop_router.post("/subscribe")
def subscribe_mod(payload: dict):
    mod_id = payload.get("mod_id")

    if not mod_id:
        return {"status": "error", "message": "missing mod_id"}

    mod_path = os.path.join(MODS_DIR, mod_id)
    os.makedirs(mod_path, exist_ok=True)

    return {
        "status": "subscribed",
        "mod_id": mod_id,
        "path": mod_path
    }


# =========================================================
# FILE MANAGER
# =========================================================

file_router = APIRouter()

@file_router.get("/file")
def read_file(path: str = Query(...)):
    if not os.path.exists(path):
        return {"content": "", "status": "missing"}

    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return {"content": f.read(), "status": "ok"}
    except Exception as e:
        return {"content": "", "status": "error", "message": str(e)}


@file_router.post("/file/save")
def save_file(payload: dict):
    path = payload.get("path")
    content = payload.get("content", "")

    if not path:
        return {"status": "error", "message": "missing path"}

    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)

        with open(path, "w", encoding="utf-8") as f:
            f.write(content)

        return {"status": "saved", "path": path}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# =========================================================
# SERVER CONTROL
# =========================================================

def read_pid():
    if not os.path.exists(PID_FILE):
        return None
    try:
        return int(open(PID_FILE).read().strip())
    except:
        return None


def write_pid(pid):
    with open(PID_FILE, "w") as f:
        f.write(str(pid))


def clear_pid():
    if os.path.exists(PID_FILE):
        os.remove(PID_FILE)


def kill_pid(pid):
    try:
        os.kill(pid, signal.SIGTERM)
        return True
    except:
        return False


def start_zomboid():
    pid = read_pid()

    if pid:
        try:
            os.kill(pid, 0)
            return f"Server already running (PID {pid})"
        except:
            clear_pid()

    proc = subprocess.Popen(
        ["bash", START_SCRIPT],
        cwd=ZOMBOID_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    write_pid(proc.pid)
    return f"Started PID {proc.pid}"


def stop_zomboid():
    pid = read_pid()

    if not pid:
        return "Server not running"

    kill_pid(pid)
    clear_pid()

    return f"Stopped PID {pid}"


# =========================================================
# RCON (SAFE)
# =========================================================

async def execute_rcon(command: str):
    try:
        from backend.rcon_pool import rcon_pool

        if hasattr(rcon_pool, "execute"):
            return await rcon_pool.execute(command)
        if hasattr(rcon_pool, "send"):
            return await rcon_pool.send(command)

        return "RCON not configured"
    except Exception as e:
        return str(e)


# =========================================================
# ROUTES
# =========================================================

app.include_router(workshop_router, prefix="/api/workshop")
app.include_router(file_router, prefix="/api/filemanager")

from backend.terminal import router as terminal_router
from backend.games_api import router as games_router
from backend.modupdates_api import router as modupdates_router
from backend.server_scheduler import router as scheduler_router
from backend.serverports import router as serverports_router
from backend.performance import router as performance_router
from backend.sidebar_api import router as sidebar_router
from backend.steam.steam_install_api import router as steam_install_router

app.include_router(terminal_router, prefix="/api/terminal")
app.include_router(games_router, prefix="/api/games")
app.include_router(modupdates_router, prefix="/api/mods")
app.include_router(modupdates_router, prefix="/api/updater")
app.include_router(scheduler_router, prefix="/api/scheduler")
app.include_router(serverports_router, prefix="/api/ports")
app.include_router(performance_router, prefix="/api")
app.include_router(sidebar_router, prefix="/api/sidebar")
app.include_router(steam_install_router, prefix="/api/steam")


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "status": "running",
        "mods_dir": MODS_DIR,
        "zomboid_dir": ZOMBOID_DIR,
        "chat_ws": "/ws/zomboid-chat"
    }


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":
    uvicorn.run(
        "backend.api_main:app",
        host="0.0.0.0",
        port=2010,
        reload=True,
        log_level="info"
    )