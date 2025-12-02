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

# ---------------------------
# Routers
# ---------------------------

# ---------------------------
# Account
# ---------------------------
from backend.API.Core.auth import auth_router
# ---------------------------
# Conesole
# ---------------------------
from backend.API.Console.terminal_api import router as terminal_router
# ---------------------------
# My Server
# ---------------------------
from backend.games_api import router as games_router
from backend.API.Core.settings_api import server_settings
# ---------------------------
# Mods 
# ---------------------------
from backend.filemanager import router as filemanager_router
from backend.API.Core.workshop_api import workshop_api
from backend.modupdates_api import router as modupdates_router

# ---------------------------
# Players 
# ---------------------------
from backend.API.Core.games_api.projectzomboid import (
    pz_server_settings,
    PlayersBannedAPI,
    all_players_api,
    steam_notes_api,
    steam_search_player_api,
    api_chatlogs
)
# ---------------------------
# Security
# ---------------------------
from backend.API.Core.tools_api import ddos_manager_api
# ---------------------------
# Monitoring
# ---------------------------
from backend.API.Core.tools_api.performance_api import router as performance_router

# ---------------------------
# Network
# ---------------------------

# ---------------------------
# Automation 
# ---------------------------

# ---------------------------
# Game Tools 
# ---------------------------

# ---------------------------
# Panel Settings 
# ---------------------------

# ---------------------------
# Staff Chat
# ---------------------------


# Routers
from backend.updater_api import router as updater_router
from backend.discord_api import router as discord_router
from backend.sidebar_api import router as sidebar_router

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

# ---------------------------
# Account
# ---------------------------

# ---------------------------
# Conesole
# ---------------------------

app.include_router(terminal_router, prefix="/api/projectzomboid")


# ---------------------------
# My Server
# ---------------------------

app.include_router(games_router, prefix="/api/games", tags=["Games"])
app.include_router(server_settings.router, prefix="/api/server_settings")



# ---------------------------
# Mods 
# ---------------------------

app.include_router(filemanager_router, prefix="/api/filemanager", tags=["FileManager"])
app.include_router(workshop_api.router, prefix="/workshop")
app.include_router(modupdates_router, prefix="/api", tags=["Mod Updates"])


# ---------------------------
# Players 
# ---------------------------

app.include_router(PlayersBannedAPI.router, prefix="/api/projectzomboid/banned")
app.include_router(all_players_api.router, prefix="/api/projectzomboid/players")
app.include_router(steam_notes_api.router, prefix="/api/projectzomboid/steam-notes")
app.include_router(steam_search_player_api.router, prefix="/api/projectzomboid/steam-search")
# ---------------------------
# Security
# ---------------------------

app.include_router(ddos_manager_api.router, prefix="/api/ddos")


# ---------------------------
# Monitoring
# ---------------------------

app.include_router(performance_router, prefix="/api")


# ---------------------------
# Network
# ---------------------------

# ---------------------------
# Automation 
# ---------------------------

# ---------------------------
# Game Tools 
# ---------------------------

# ---------------------------
# Panel Settings 
# ---------------------------

# ---------------------------
# Staff Chat
# ---------------------------
app.include_router(api_chatlogs.chat_bp, prefix="/api/projectzomboid/chat")

# Project Zomboid APIs

app.include_router(terminal_router, prefix="/api/projectzomboid")
app.include_router(updater_router, prefix="/api/updater", tags=["Updater"])
app.include_router(modupdates_router, prefix="/api", tags=["Mod Updates"])
app.include_router(discord_router, prefix="/api", tags=["Discord"])
app.include_router(server_settings.router, prefix="/api/server_settings")
app.include_router(sidebar_router, prefix="/api/sidebar", tags=["Sidebar"])

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
# Games API Router
# ---------------------------
from fastapi import APIRouter, Query, Body, UploadFile, File, Form
import os
import json
import shutil

games_router = APIRouter(prefix="/api/games", tags=["Games"])

# Paths
DEFAULT_MODS_PATH = os.path.expanduser("~/Zomboid/mods")
os.makedirs(DEFAULT_MODS_PATH, exist_ok=True)


# ---------------------------
# Run serve
# ---------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api_main:app", host="0.0.0.0", port=2010, reload=True)
