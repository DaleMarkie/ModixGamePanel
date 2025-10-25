import os
import subprocess
import socket
import asyncio
import json
import configparser
from typing import Optional

# FastAPI
from fastapi import FastAPI, Request, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Routers
from backend.terminal_api import router as terminal_router
from backend.API.Core.settings_api import server_settings
from backend.API.Core.games_api.projectzomboid import (
    pz_server_settings,
    PlayersBannedAPI,
    all_players_api,
    steam_notes_api,
    steam_search_player_api,
    api_chatlogs
)
from backend.API.Core.tools_api.performance_api import router as performance_router
from backend.API.Core.tools_api import ddos_manager_api
from backend.API.Core.workshop_api import workshop_api
from backend.filemanager import router as filemanager_router
from backend.updater_api import router as updater_router
from fastapi import APIRouter

# ---------------------------
# FastAPI App
# ---------------------------
app = FastAPI(title="Modix Panel Backend")

# ---------------------------
# CORS Middleware
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Global State
# ---------------------------
running_process: Optional[subprocess.Popen] = None
log_queue: asyncio.Queue = asyncio.Queue()
saved_mod_notes = {}

# ---------------------------
# Mount Routers
# ---------------------------
app.include_router(workshop_api.router, prefix="/workshop")
app.include_router(performance_router, prefix="/api")
app.include_router(ddos_manager_api.router, prefix="/api/ddos")
app.include_router(server_settings.router, prefix="/api/server_settings")

# Project Zomboid APIs
app.include_router(pz_server_settings.router, prefix="/api/projectzomboid/settings")
app.include_router(PlayersBannedAPI.router, prefix="/api/projectzomboid/banned")
app.include_router(all_players_api.router, prefix="/api/projectzomboid/players")
app.include_router(steam_notes_api.router, prefix="/api/projectzomboid/steam-notes")
app.include_router(steam_search_player_api.router, prefix="/api/projectzomboid/steam-search")
app.include_router(api_chatlogs.chat_bp, prefix="/api/projectzomboid/chat")
app.include_router(terminal_router, prefix="/api/projectzomboid")
app.include_router(filemanager_router, prefix="/api/filemanager", tags=["FileManager"])
app.include_router(updater_router, prefix="/api/updater", tags=["Updater"])

# ---------------------------
# Health & Port Check
# ---------------------------
@app.get("/health")
def health_check():
    return {"success": True, "status": "ok"}


@app.get("/check-port")
def check_port(port: int):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        in_use = s.connect_ex(("127.0.0.1", port)) == 0
    return {"port": port, "inUse": in_use}


def check_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0

# ---------------------------
# Port Checker Router
# ---------------------------
port_router = APIRouter()

DEFAULT_GAME_PORTS = [
    {"name": "Project Zomboid (Game)", "port": 16261},
    {"name": "Project Zomboid (Query)", "port": 16262},
    {"name": "DayZ", "port": 2302},
    {"name": "RimWorld", "port": 27015},
]

async def async_check_port(host: str, port: int) -> dict:
    loop = asyncio.get_event_loop()

    def _check():
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.5)
            return s.connect_ex((host, port)) == 0

    try:
        in_use = await loop.run_in_executor(None, _check)
        return {"name": f"Port {port}", "port": port, "status": "open" if in_use else "closed"}
    except Exception:
        return {"name": f"Port {port}", "port": port, "status": "closed"}

@port_router.get("/game-ports")
async def game_ports(host: str = Query("127.0.0.1"), custom_ports: str = Query("")):
    ports_to_check = DEFAULT_GAME_PORTS.copy()
    if custom_ports:
        for p in custom_ports.split(","):
            try:
                p_int = int(p.strip())
                ports_to_check.append({"name": f"Custom Port {p_int}", "port": p_int})
            except ValueError:
                return JSONResponse({"error": f"Invalid port: {p}"}, status_code=400)

    results = await asyncio.gather(*[async_check_port(host, p["port"]) for p in ports_to_check])
    return {"servers": results}

app.include_router(port_router, prefix="/api/server")

# ---------------------------
# Server Helpers
# ---------------------------
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
# Mod Notes (In-Memory)
# ---------------------------
@app.post("/api/save-mod-notes")
async def save_mod_notes(request: Request):
    data = await request.json()
    workshop_id = data.get("workshopId")
    notes = data.get("notes", "")
    categories = data.get("categories", [])
    if not workshop_id:
        return JSONResponse({"error": "Missing workshopId"}, status_code=400)
    saved_mod_notes[workshop_id] = {"notes": notes, "categories": categories}
    return {"message": "Notes saved", "data": saved_mod_notes[workshop_id]}

# ---------------------------
# Project Zomboid Mods
# ---------------------------
WORKSHOP_PATH = os.path.expanduser("~/Steam/steamapps/workshop/content/108600")
SERVER_INI_PATH = os.path.join(os.path.expanduser("~"), "Zomboid/Server/servertest.ini")


def read_installed_mods_from_ini() -> list[str]:
    config = configparser.ConfigParser()
    config.optionxform = str
    if not os.path.isfile(SERVER_INI_PATH):
        return []
    config.read(SERVER_INI_PATH, encoding="utf-8")
    if not config.has_section("Mods") or not config.has_option("Mods", "Mods"):
        return []
    mods_line = config.get("Mods", "Mods")
    return [m.strip() for m in mods_line.split(";") if m.strip()]


def scan_local_workshop() -> list[dict]:
    mods = []
    if not os.path.isdir(WORKSHOP_PATH):
        return mods
    for mod_id in os.listdir(WORKSHOP_PATH):
        mod_folder = os.path.join(WORKSHOP_PATH, mod_id)
        if os.path.isdir(mod_folder):
            mod_info_path = os.path.join(mod_folder, "mod.info.json")
            if os.path.isfile(mod_info_path):
                try:
                    with open(mod_info_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        mods.append({
                            "modId": mod_id,
                            "title": data.get("name", f"Mod {mod_id}"),
                            "version": data.get("version"),
                            "dependencies": data.get("dependencies", []),
                        })
                except Exception:
                    mods.append({"modId": mod_id, "title": f"Mod {mod_id}"})
            else:
                mods.append({"modId": mod_id, "title": f"Mod {mod_id}"})
    return mods

# ---------------------------
# Staff Chat Persistence
# ---------------------------
CHAT_FILE = "/home/modix/modix-app/data/staff_chat.json"
os.makedirs(os.path.dirname(CHAT_FILE), exist_ok=True)

# Create default file if missing
if not os.path.exists(CHAT_FILE) or os.stat(CHAT_FILE).st_size == 0:
    welcome_msg = [{
        "id": "1",
        "author": "System",
        "message": "👋 Welcome to the Staff Chat! Coordinate with your team, share updates, or pin important info.",
        "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
        "pinned": True,
        "important": True,
        "replies": [],
        "tags": [],
        "reactions": {}
    }]
    with open(CHAT_FILE, "w", encoding="utf-8") as f:
        json.dump(welcome_msg, f, indent=2)

@app.get("/api/chat")
async def get_staff_chat():
    """Return all staff chat messages"""
    try:
        with open(CHAT_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/api/chat")
async def save_staff_chat(data: list = Body(...)):
    """Save all staff chat messages"""
    try:
        with open(CHAT_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        return {"status": "ok"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# ---------------------------
# Run server
# ---------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api_main:app", host="0.0.0.0", port=2010, reload=True)
