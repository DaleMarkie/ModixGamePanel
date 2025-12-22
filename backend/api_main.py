import os
import subprocess
import asyncio
import json
from typing import Optional

from fastapi import FastAPI, Request, Body, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ---------------------------
# Routers (your other routers)
# ---------------------------
from backend.API.Core.auth import auth_router
from backend.API.Console.terminal_api import router as terminal_router
from backend.games_api import router as games_router
from backend.filemanager import router as filemanager_router
from backend.API.Core.workshop_api import workshop_api
from backend.modupdates_api import router as modupdates_router

from backend.API.Core.games_api.projectzomboid import (
    PlayersBannedAPI,
    all_players_api,
    steam_notes_api,
    steam_search_player_api,
    api_chatlogs
)
from backend.API.Core.tools_api import ddos_manager_api
from backend.API.Core.tools_api.performance_api import router as performance_router
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
# Local Users
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
# Auth
# ---------------------------
app.include_router(auth_router, prefix="/api")

# ---------------------------
# Project Zomboid Server Settings Router (self-contained)
# ---------------------------
server_settings_router = APIRouter()

SERVER_FOLDER = os.path.expanduser("~/Zomboid/Server")
os.makedirs(SERVER_FOLDER, exist_ok=True)

@server_settings_router.get("/list-inis")
async def list_inis():
    """Return all .ini files in the server folder"""
    try:
        files = [f for f in os.listdir(SERVER_FOLDER) if f.endswith(".ini")]
        return {"inis": files}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# Include router
app.include_router(server_settings_router, prefix="/api/server_settings")

# ---------------------------
# Other Routers
# ---------------------------
app.include_router(terminal_router, prefix="/api/projectzomboid")
app.include_router(games_router, prefix="/api/games", tags=["Games"])
app.include_router(filemanager_router, prefix="/api/filemanager", tags=["FileManager"])
app.include_router(workshop_api.router, prefix="/workshop")
app.include_router(modupdates_router, prefix="/api", tags=["Mod Updates"])
app.include_router(PlayersBannedAPI.router, prefix="/api/projectzomboid/banned")
app.include_router(all_players_api.router, prefix="/api/projectzomboid/players")
app.include_router(steam_notes_api.router, prefix="/api/projectzomboid/steam-notes")
app.include_router(steam_search_player_api.router, prefix="/api/projectzomboid/steam-search")
app.include_router(api_chatlogs.chat_bp, prefix="/api/projectzomboid/chat")
app.include_router(ddos_manager_api.router, prefix="/api/ddos")
app.include_router(performance_router, prefix="/api")
app.include_router(updater_router, prefix="/api/updater", tags=["Updater"])
app.include_router(discord_router, prefix="/api", tags=["Discord"])
app.include_router(sidebar_router, prefix="/api/sidebar", tags=["Sidebar"])

# ---------------------------
# Run Server
# ---------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api_main:app", host="0.0.0.0", port=2010, reload=True)
