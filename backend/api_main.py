import os
import subprocess
import socket
import asyncio
import json
import configparser
from typing import Optional

from fastapi import FastAPI, Request, Query, Body, APIRouter
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
from backend.modupdates_api import router as modupdates_router
from backend.discord_api import router as discord_router
from backend.API.Core.auth import auth_router

# ---------------------------
# FastAPI App
# ---------------------------
app = FastAPI(title="Modix Panel Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
# Local Users File & Helpers
# ---------------------------
LOCAL_USERS_FILE = os.path.expanduser("~/modix_local_users.json")

if not os.path.exists(LOCAL_USERS_FILE):
    test_users = [
        {"username": "1", "password": "1", "role": "Owner", "roles": ["Owner"], "pages": []},
        {"username": "admin", "password": "admin123", "role": "Admin", "roles": ["Admin"], "pages": []},
        {"username": "subuser1", "password": "password1", "role": "SubUser", "roles": ["SubUser"], "pages": []},
    ]
    with open(LOCAL_USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(test_users, f, indent=2)

def load_local_users():
    try:
        with open(LOCAL_USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_local_users(users):
    with open(LOCAL_USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)

# ---------------------------
# Auth Router Already Included
# ---------------------------
app.include_router(auth_router, prefix="/api")

# ---------------------------
# Owner Permissions API
# ---------------------------
@app.post("/api/update_pages")
async def update_pages(data: dict = Body(...)):
    """
    Owner updates pages a user can access.
    JSON Body:
    {
        "target_username": "subuser1",
        "pages": ["Dashboard", "Settings"],
        "requester": "owner_username"
    }
    """
    try:
        target_username = data.get("target_username")
        new_pages = data.get("pages", [])
        requester_username = data.get("requester")

        if not target_username or not requester_username:
            return JSONResponse({"error": "target_username and requester required"}, status_code=400)

        users = load_local_users()
        requester = next((u for u in users if u["username"] == requester_username), None)
        target_user = next((u for u in users if u["username"] == target_username), None)

        if not requester or requester.get("role") != "Owner":
            return JSONResponse({"error": "Only the Owner can update user permissions"}, status_code=403)
        if not target_user:
            return JSONResponse({"error": "Target user not found"}, status_code=404)

        # Update pages
        target_user["pages"] = new_pages
        save_local_users(users)
        return {"success": True, "message": f"{target_username}'s pages updated", "pages": new_pages}

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# ---------------------------
# Mount Other Routers
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
app.include_router(modupdates_router, prefix="/api", tags=["Mod Updates"])
app.include_router(discord_router, prefix="/api", tags=["Discord"])

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
# Project Zomboid Mod Creation & Asset Management
# ---------------------------
from fastapi import File, UploadFile, Form, Body, Query
from fastapi.responses import JSONResponse
import os
import shutil

# Default mods folder
DEFAULT_MODS_PATH = os.path.expanduser("~/Zomboid/mods")
os.makedirs(DEFAULT_MODS_PATH, exist_ok=True)


def ensure_mod_structure(mod_name: str, base_path: str = None):
    """Create base mod structure if missing"""
    folder = base_path or DEFAULT_MODS_PATH
    base_mod_path = os.path.join(folder, mod_name)
    media_path = os.path.join(base_mod_path, "media")
    os.makedirs(media_path, exist_ok=True)
    return base_mod_path


def write_mod_info(mod_name: str, description: str = "", poster: str = "", base_path: str = None):
    """Generate mod.info for a new mod"""
    base_mod_path = ensure_mod_structure(mod_name, base_path)
    mod_info_path = os.path.join(base_mod_path, "mod.info")
    with open(mod_info_path, "w", encoding="utf-8") as f:
        f.write(f"name={mod_name}\n")
        f.write(f"id={mod_name}\n")
        f.write(f"description={description}\n")
        if poster:
            f.write(f"poster={poster}\n")
    return mod_info_path


@app.get("/api/projectzomboid/mods")
async def list_local_mods(savePath: str = Query(None)):
    """List locally created mods in default or custom folder"""
    mods_folder = savePath or DEFAULT_MODS_PATH
    mods = []
    if not os.path.isdir(mods_folder):
        return {"mods": []}

    for name in os.listdir(mods_folder):
        mod_folder = os.path.join(mods_folder, name)
        if not os.path.isdir(mod_folder):
            continue
        info_file = os.path.join(mod_folder, "mod.info")
        desc, poster = "", ""
        if os.path.isfile(info_file):
            with open(info_file, "r", encoding="utf-8") as f:
                lines = f.readlines()
            for line in lines:
                if line.startswith("description="):
                    desc = line.split("=", 1)[1].strip()
                elif line.startswith("poster="):
                    poster = line.split("=", 1)[1].strip()
        mods.append({
            "name": name,
            "description": desc,
            "poster": poster,
            "path": mod_folder,
        })
    return {"mods": mods}


@app.post("/api/projectzomboid/mods/create")
async def create_mod(
    modName: str = Form(...),
    description: str = Form(""),
    poster: UploadFile = File(None),
    savePath: str = Form(None)
):
    """Create a new mod folder with mod.info and optional poster in custom folder"""
    base_path = savePath or DEFAULT_MODS_PATH
    mod_path = ensure_mod_structure(modName, base_path)
    poster_name = ""

    if poster:
        poster_name = "poster.png"
        poster_path = os.path.join(mod_path, poster_name)
        with open(poster_path, "wb") as f:
            f.write(await poster.read())

    write_mod_info(modName, description, poster_name, base_path)
    return {"success": True, "message": f"Mod '{modName}' created at '{mod_path}'."}


@app.post("/api/projectzomboid/mods/upload")
async def upload_mod_asset(
    modName: str = Form(...),
    folder: str = Form("media"),
    file: UploadFile = File(...),
    savePath: str = Form(None)
):
    """Upload an asset to a mod's subfolder in default or custom folder"""
    base_path = savePath or DEFAULT_MODS_PATH
    mod_path = ensure_mod_structure(modName, base_path)
    dest_folder = os.path.join(mod_path, folder)
    os.makedirs(dest_folder, exist_ok=True)

    dest_path = os.path.join(dest_folder, file.filename)
    with open(dest_path, "wb") as f:
        f.write(await file.read())

    return {"success": True, "message": f"File '{file.filename}' uploaded to {folder}/"}


@app.post("/api/projectzomboid/mods/update-info")
async def update_mod_info(data: dict = Body(...)):
    """Update description or poster reference in mod.info (supports custom folder)"""
    mod_name = data.get("modName")
    new_description = data.get("description", "")
    new_poster = data.get("poster", "")
    save_path = data.get("savePath", None)

    if not mod_name:
        return JSONResponse({"error": "modName is required"}, status_code=400)

    base_path = save_path or DEFAULT_MODS_PATH
    info_file = os.path.join(ensure_mod_structure(mod_name, base_path), "mod.info")

    if not os.path.isfile(info_file):
        write_mod_info(mod_name, new_description, new_poster, base_path)
    else:
        lines = []
        with open(info_file, "r", encoding="utf-8") as f:
            lines = f.readlines()
        updated = []
        found_desc = found_poster = False
        for line in lines:
            if line.startswith("description="):
                updated.append(f"description={new_description}\n")
                found_desc = True
            elif line.startswith("poster="):
                updated.append(f"poster={new_poster}\n")
                found_poster = True
            else:
                updated.append(line)
        if not found_desc:
            updated.append(f"description={new_description}\n")
        if new_poster and not found_poster:
            updated.append(f"poster={new_poster}\n")
        with open(info_file, "w", encoding="utf-8") as f:
            f.writelines(updated)

    return {"success": True, "message": f"Mod '{mod_name}' info updated."}


@app.delete("/api/projectzomboid/mods/delete")
async def delete_mod(modName: str = Query(...), savePath: str = Query(None)):
    """Delete a local mod folder in default or custom folder"""
    mods_folder = savePath or DEFAULT_MODS_PATH
    mod_path = os.path.join(mods_folder, modName)
    if not os.path.isdir(mod_path):
        return JSONResponse({"error": "Mod not found"}, status_code=404)
    shutil.rmtree(mod_path)
    return {"success": True, "message": f"Mod '{modName}' deleted from '{mods_folder}'."}

# ---------------------------
# Staff Chat Persistence
# ---------------------------
CHAT_FILE = "/home/modix/modix-app/data/staff_chat.json"
os.makedirs(os.path.dirname(CHAT_FILE), exist_ok=True)

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
    try:
        with open(CHAT_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@app.post("/api/chat")
async def save_staff_chat(data: list = Body(...)):
    try:
        with open(CHAT_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        return {"status": "ok"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# ---------------------------
# Project Zomboid Map / World State API
# ---------------------------
import os
import json
from fastapi import FastAPI
from fastapi.responses import JSONResponse, FileResponse

app = FastAPI()

WORLD_SAVE_PATH = os.path.expanduser("~/Zomboid/Saves")  # adjust to your server save path

def list_latest_save():
    """Find latest Project Zomboid world save folder"""
    if not os.path.exists(WORLD_SAVE_PATH):
        return None
    saves = [d for d in os.listdir(WORLD_SAVE_PATH) if os.path.isdir(os.path.join(WORLD_SAVE_PATH, d))]
    if not saves:
        return None
    saves.sort(key=lambda x: os.path.getmtime(os.path.join(WORLD_SAVE_PATH, x)), reverse=True)
    return os.path.join(WORLD_SAVE_PATH, saves[0])

@app.get("/api/projectzomboid/map/players")
async def get_players():
    """Return active players' positions for frontend map"""
    save_folder = list_latest_save()
    if not save_folder:
        return {"players": []}

    players_file = os.path.join(save_folder, "players.json")
    if not os.path.isfile(players_file):
        return {"players": []}

    with open(players_file, "r", encoding="utf-8") as f:
        try:
            players = json.load(f)
        except json.JSONDecodeError:
            players = []
    return {"players": players}


@app.get("/api/projectzomboid/map/map-image")
async def get_map_image():
    """Return static map image (pre-rendered or generated from saves)"""
    map_image_path = os.path.join(WORLD_SAVE_PATH, "latest_map.png")
    if not os.path.isfile(map_image_path):
        return JSONResponse({"error": "Map image not found"}, status_code=404)
    return FileResponse(map_image_path, media_type="image/png")


@app.get("/api/projectzomboid/map/state")
async def get_world_state():
    """Return combined world state: players, zombies, loot"""
    save_folder = list_latest_save()
    if not save_folder:
        return {"players": [], "zombies": [], "loot": []}

    # For demo purposes, this can later be loaded from actual save files
    world_state = {
        "players": [
            {"name": "Alice", "x": 1024, "y": 2048, "health": 85},
            {"name": "Bob", "x": 1200, "y": 1980, "health": 92}
        ],
        "zombies": [
            {"x": 500, "y": 1200, "type": "walker"},
            {"x": 550, "y": 1250, "type": "runner"}
        ],
        "loot": [
            {"id": "loot1", "x": 1500, "y": 3000, "name": "Medkit", "type": "Medical"},
            {"id": "loot2", "x": 1600, "y": 3100, "name": "Pistol", "type": "Weapon"},
            {"id": "loot3", "x": 1700, "y": 3200, "name": "Canned Food", "type": "Food"}
        ]
    }

    return world_state



# ---------------------------
# Mount Remaining Routers
# ---------------------------
app.include_router(workshop_api.router, prefix="/workshop")
app.include_router(performance_router, prefix="/api")
app.include_router(ddos_manager_api.router, prefix="/api/ddos")
app.include_router(server_settings.router, prefix="/api/server_settings")
app.include_router(pz_server_settings.router, prefix="/api/projectzomboid/settings")
app.include_router(PlayersBannedAPI.router, prefix="/api/projectzomboid/banned")
app.include_router(all_players_api.router, prefix="/api/projectzomboid/players")
app.include_router(steam_notes_api.router, prefix="/api/projectzomboid/steam-notes")
app.include_router(steam_search_player_api.router, prefix="/api/projectzomboid/steam-search")
app.include_router(api_chatlogs.chat_bp, prefix="/api/projectzomboid/chat")
app.include_router(terminal_router, prefix="/api/projectzomboid")
app.include_router(filemanager_router, prefix="/api/filemanager", tags=["FileManager"])
app.include_router(updater_router, prefix="/api/updater", tags=["Updater"])
app.include_router(modupdates_router, prefix="/api", tags=["Mod Updates"])
app.include_router(discord_router, prefix="/api", tags=["Discord"])

# ---------------------------
# Run serve
# ---------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api_main:app", host="0.0.0.0", port=2010, reload=True)
