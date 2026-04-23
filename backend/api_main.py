import os
import subprocess
import asyncio
import signal
from threading import Thread
from pathlib import Path
from typing import List, Dict, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# ---------------- CORE ROUTES ----------------
from backend.API.Core.auth import auth_router
from backend.terminal import router as terminal_router
from backend.games_api import router as games_router
from backend.modupdates_api import router as modupdates_router
from backend.server_scheduler import router as scheduler_router
from backend.serverports import router as serverports_router
from backend.performance import router as performance_router
from backend.sidebar_api import router as sidebar_router
from backend.rcon_pool import rcon_pool
from backend.steam.steam_install_api import router as steam_install_router

from backend.API.Core.games_api.projectzomboid import (
    PlayersBannedAPI,
    all_players_api,
    steam_notes_api,
    steam_search_player_api,
    api_chatlogs
)

from backend.API.Core.tools_api import ddos_manager_api

# ---------------- APP ----------------
app = FastAPI(title="Modix Panel Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- STATE ----------------
ZOMBOID_DIR = "/home/ritchiedale72/ZomboidServer"
START_SCRIPT = "./start-server.sh"
MODS_DIR = os.path.join(ZOMBOID_DIR, "mods")
PID_FILE = os.path.join(ZOMBOID_DIR, "server.pid")

log_clients: set[WebSocket] = set()
EVENT_LOOP = None


# ---------------- STARTUP ----------------
@app.on_event("startup")
async def startup_event():
    global EVENT_LOOP
    EVENT_LOOP = asyncio.get_running_loop()


# =========================================================
# FILE TREE SYSTEM
# =========================================================

def build_file_tree(root_path: str) -> List[Dict[str, Any]]:
    if not os.path.exists(root_path):
        return []

    items = []

    for entry in sorted(os.listdir(root_path)):
        full_path = os.path.join(root_path, entry)

        if os.path.isdir(full_path):
            items.append({
                "name": entry,
                "path": full_path,
                "type": "folder",
                "children": build_file_tree(full_path)
            })
        else:
            items.append({
                "name": entry,
                "path": full_path,
                "type": "file"
            })

    return items


# =========================================================
# WORKSHOP API (FRONTEND READY)
# =========================================================

workshop_router = APIRouter()

@workshop_router.get("/")
def get_workshop_mods():
    mods = []

    if not os.path.exists(MODS_DIR):
        return {"mods": []}

    for mod_id in os.listdir(MODS_DIR):
        mod_path = os.path.join(MODS_DIR, mod_id)

        if not os.path.isdir(mod_path):
            continue

        mods.append({
            "id": mod_id,
            "name": mod_id,
            "path": mod_path,
            "files": build_file_tree(mod_path)
        })

    return {"mods": mods}


@workshop_router.post("/subscribe")
def subscribe_mod(payload: dict):
    mod_id = payload.get("mod_id")

    if not mod_id:
        return {"error": "missing mod_id"}

    mod_path = os.path.join(MODS_DIR, mod_id)
    os.makedirs(mod_path, exist_ok=True)

    return {"status": "subscribed", "mod_id": mod_id}


# =========================================================
# FILE MANAGER (FIXED)
# =========================================================

file_router = APIRouter()

@file_router.get("/file")
def read_file(path: str = Query(...)):
    if not os.path.exists(path):
        return {"content": ""}

    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return {"content": f.read()}


@file_router.post("/file/save")
def save_file(payload: dict):
    path = payload.get("path")
    content = payload.get("content", "")

    if not path:
        return {"error": "missing path"}

    os.makedirs(os.path.dirname(path), exist_ok=True)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

    return {"status": "saved"}


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
# RCON
# =========================================================

async def execute_rcon(command: str):
    try:
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

app.include_router(auth_router, prefix="/api")
app.include_router(games_router, prefix="/api/games")
app.include_router(modupdates_router, prefix="/api/mods")
app.include_router(modupdates_router, prefix="/api/updater")

app.include_router(workshop_router, prefix="/api/workshop")
app.include_router(file_router, prefix="/api/filemanager")

app.include_router(PlayersBannedAPI.router, prefix="/api/projectzomboid/banned")
app.include_router(all_players_api.router, prefix="/api/projectzomboid/players")
app.include_router(steam_notes_api.router, prefix="/api/projectzomboid/steam-notes")
app.include_router(steam_search_player_api.router, prefix="/api/projectzomboid/steam-search")
app.include_router(api_chatlogs.chat_bp, prefix="/api/projectzomboid/chat")

app.include_router(ddos_manager_api.router, prefix="/api/ddos")
app.include_router(performance_router, prefix="/api")
app.include_router(sidebar_router, prefix="/api/sidebar")

app.include_router(terminal_router, prefix="/api/terminal")
app.include_router(scheduler_router, prefix="/api/scheduler")
app.include_router(serverports_router, prefix="/api/ports")
app.include_router(steam_install_router, prefix="/api/steam")


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {"status": "running"}


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