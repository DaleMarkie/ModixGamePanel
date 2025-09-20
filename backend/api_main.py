import sys
import os
import shutil
import subprocess
import socket
import asyncio
from typing import Optional, Dict, Any
from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import configparser
from datetime import datetime
import psutil
import re


# === Project root path fix ===
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# === Core Imports ===
from backend.API.Core.database import init_db, create_base_users_from_config, register_module_permissions
from backend.API.Core.module_api import router as module_api_router
from backend.API.Core.auth import auth_router
from backend.API.Core.steam_search_player_api import router as steam_search_router
# === Player Management ===
from steam_notes_api import router as steam_notes_router
from all_players_api import router as all_players_router
from api_chatlogs import router as chatlogs_router
from PlayersBannedAPI import router as players_banned_router

from backend.API.Core.tools_api.portcheck_api import router as portcheck_router


# === Game Specific APIs (raw routers) ===
from backend.API.Core.mod_debugger_api import router as mod_debugger_router
from backend.backend_module_loader import register_modules

from backend.ddos_api import router as ddos_router
from backend.ddos_api import set_server_status

# ---------------------------
# FastAPI App
# ---------------------------
app = FastAPI(title="Game Server Backend")

# === Core Routers ===
app.include_router(auth_router, prefix="/api/auth")
app.include_router(module_api_router, prefix="/api")
app.include_router(steam_search_router, prefix="/api")
app.include_router(mod_debugger_router, prefix="/api/debugger")
app.include_router(ddos_router)
# === Player Management ===
app.include_router(steam_notes_router)
app.include_router(all_players_router)
app.include_router(chatlogs_router)
app.include_router(players_banned_router)
# === Tools ===
app.include_router(portcheck_router, prefix="/api")

# === Project Zomboid APIs ===

register_modules(app)

# === CORS ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Error Codes
# ---------------------------
ERROR_CODES = {
    "NET_001": "Could not reach backend API",
    "NET_002": "CORS blocked request",
    "GAME_001": "Unknown game selected",
    "GAME_002": "Game files missing or corrupted",
    "GAME_003": "Server process crashed",
    "BACKEND_001": "Backend crashed or not responding",
    "PORT_004": "Port already in use",
}

def error_response(code: str, http_status: int = 500, detail: Optional[str] = None):
    return JSONResponse(
        status_code=http_status,
        content={
            "success": False,
            "code": code,
            "message": ERROR_CODES.get(code, "Unknown error"),
            "detail": detail,
        },
    )

# ---------------------------
# Health & Diagnostics
# ---------------------------
@app.get("/health")
def health_check():
    return {"success": True, "status": "ok"}

@app.get("/check-port")
def check_port(port: int):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        in_use = s.connect_ex(("127.0.0.1", port)) == 0
    return {"port": port, "inUse": in_use}

# ---------------------------
# Global Server Process + Log Queue
# ---------------------------
running_process = None
log_queue: asyncio.Queue = asyncio.Queue()

def check_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0

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
# Project Zomboid Server Start/Stop + Logs
# ---------------------------
@app.post("/api/projectzomboid/start")
async def start_pz_server(request: Request):
    global running_process
    if running_process:
        return error_response("BACKEND_001", 400, "Server already running")

    try:
        data = await request.json()
        port = data.get("port", 16261)
        batch_file = data.get(
            "batchFile",
            r"C:\Program Files (x86)\Steam\steamapps\common\Project Zomboid Dedicated Server\StartServer32.bat"
        )

        if not os.path.isfile(batch_file):
            return error_response("GAME_002", 404, f"Batch file not found: {batch_file}")

        if check_port_in_use(port):
            return error_response("PORT_004", 409, f"Port {port} already in use")

        running_process = subprocess.Popen(
            f'cmd /c "{batch_file}"',
            cwd=os.path.dirname(batch_file),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True,
            text=True,
            bufsize=1
        )

        asyncio.create_task(stream_subprocess_output(running_process.stdout, "OUT"))
        asyncio.create_task(stream_subprocess_output(running_process.stderr, "ERR"))
        asyncio.create_task(monitor_process_exit(running_process))

        # Update DDoS API server status
        set_server_status("running")

        return {"status": "running", "message": "Server started successfully"}
    except Exception as e:
        running_process = None
        set_server_status("stopped")
        return error_response("BACKEND_001", 500, str(e))

@app.post("/api/projectzomboid/stop")
async def stop_pz_server():
    global running_process
    if not running_process:
        return {"status": "stopped", "message": "Server not running"}

    running_process.terminate()
    running_process = None

    await log_queue.put("[SYSTEM] Server stopped manually")

    # Update DDoS API server status
    set_server_status("stopped")

    return {"status": "stopped", "message": "Server terminated"}

@app.get("/api/projectzomboid/terminal/log-stream")
async def terminal_log_stream():
    async def event_generator():
        while True:
            log = await log_queue.get()
            yield f"data: {log}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")

# ---------------------------
# Project Zomboid Settings
# ---------------------------
def get_pz_server_folder() -> str:
    home = os.path.expanduser("~")
    return os.path.join(home, "Zomboid", "Server")

def resolve_ini_path(ini_name: str) -> str:
    folder = get_pz_server_folder()
    return os.path.join(folder, ini_name)

def cast_value(value: str) -> Any:
    if isinstance(value, bool) or isinstance(value, int) or isinstance(value, float):
        return value
    v = str(value).strip()
    low = v.lower()
    if low in ("true", "false"):
        return low == "true"
    try:
        if "." in v:
            return float(v)
        return int(v)
    except ValueError:
        return v

@app.get("/api/projectzomboid/settings/list")
async def list_pz_ini_files():
    folder = get_pz_server_folder()
    if not os.path.isdir(folder):
        return JSONResponse(content={"folder": folder, "files": []})
    files = [f for f in os.listdir(folder) if f.lower().endswith(".ini")]
    return JSONResponse(content={"folder": folder, "files": files})

@app.get("/api/projectzomboid/settings")
async def get_pz_server_settings(ini: str = Query("servertest.ini", description="INI filename inside ~/Zomboid/Server")):
    ini_path = resolve_ini_path(ini)
    if not os.path.isfile(ini_path):
        return error_response("GAME_002", 404, f"INI not found: {ini_path}")

    config = configparser.ConfigParser()
    config.optionxform = str
    config.read(ini_path, encoding="utf-8")

    result: Dict[str, Dict[str, Any]] = {}
    for section in config.sections():
        result[section] = {}
        for key, value in config.items(section):
            result[section][key] = cast_value(value)

    return JSONResponse(content={"folder": get_pz_server_folder(), "ini": ini, "settings": result})

@app.post("/api/projectzomboid/settings")
async def save_pz_server_settings(request: Request):
    data = await request.json()
    ini_name: str = data.get("ini", "servertest.ini")
    updates: Dict[str, Dict[str, Any]] = data.get("updates", {})
    do_backup: bool = data.get("backup", True)

    ini_path = resolve_ini_path(ini_name)
    folder = get_pz_server_folder()
    os.makedirs(folder, exist_ok=True)

    if not os.path.isfile(ini_path):
        with open(ini_path, "w", encoding="utf-8") as f:
            f.write("")

    if do_backup:
        ts = datetime.now().strftime("%Y%m%d-%H%M%S")
        backup_path = f"{ini_path}.bak.{ts}"
        try:
            shutil.copy2(ini_path, backup_path)
        except Exception:
            pass

    config = configparser.ConfigParser()
    config.optionxform = str
    config.read(ini_path, encoding="utf-8")

    for section, kv in (updates or {}).items():
        if not config.has_section(section):
            config.add_section(section)
        for key, value in (kv or {}).items():
            config.set(section, key, str(value))

    with open(ini_path, "w", encoding="utf-8") as f:
        config.write(f)

    return {"status": "success", "ini": ini_name, "path": ini_path}

# ---------------------------
# Modcards (in-memory storage)
# ---------------------------
saved_mod_notes = {}

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
# Project Zomboid Mod Alerts
# ---------------------------
import json

WORKSHOP_PATH = os.path.expanduser("~/Steam/steamapps/workshop/content/108600")
SERVER_INI_PATH = os.path.join(os.path.expanduser("~"), "Zomboid", "Server", "servertest.ini")

def read_installed_mods_from_ini() -> list[str]:
    """Read the Mods= line from server.ini and return a list of mod IDs"""
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
    """Scan local Workshop folder for installed mods"""
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

@app.get("/api/projectzomboid/mod-alerts")
async def get_mod_alerts():
    """Generate alerts based on server.ini and local Workshop mods"""
    installed_mods = read_installed_mods_from_ini()
    local_mods = scan_local_workshop()

    alerts = []

    # Example conflict map (expand as needed)
    CONFLICTS = {
        "Better Zombies": ["Zombie Enhancer"],
        "Survivor Tools": ["Advanced Tools Mod"]
    }

    for mod_id in installed_mods:
        mod = next((m for m in local_mods if m["modId"] == mod_id), None)
        if not mod:
            # Missing mod
            alerts.append({
                "id": f"{mod_id}-missing",
                "modName": mod_id,
                "message": "Mod listed in server.ini but not found in Workshop folder",
                "type": "error",
                "timestamp": datetime.now().isoformat()
            })
            continue

        title = mod.get("title", mod_id)
        version = mod.get("version")
        dependencies = mod.get("dependencies", [])

        # Conflicts
        conflicts = CONFLICTS.get(title, [])
        for conflict_name in conflicts:
            conflict_installed = any(
                m["title"] == conflict_name for m in local_mods if m["modId"] in installed_mods
            )
            if conflict_installed:
                alerts.append({
                    "id": f"{mod_id}-conflict-{conflict_name}",
                    "modName": title,
                    "message": f"This mod conflicts with '{conflict_name}'",
                    "type": "warning",
                    "timestamp": datetime.now().isoformat()
                })

        # Missing dependencies
        for dep in dependencies or []:
            dep_installed = any(
                m["title"] == dep for m in local_mods if m["modId"] in installed_mods
            )
            if not dep_installed:
                alerts.append({
                    "id": f"{mod_id}-missingdep-{dep}",
                    "modName": title,
                    "message": f"Missing dependency: '{dep}'",
                    "type": "error",
                    "timestamp": datetime.now().isoformat()
                })

    return JSONResponse({"alerts": alerts})

# ---------------------------
# Project Zomboid Workshop Mods API
# ---------------------------
import json

# Default Steam Workshop folder for Project Zomboid
WORKSHOP_PATH_WIN = r"C:\Program Files (x86)\Steam\steamapps\workshop\content\108600"
WORKSHOP_PATH_UNIX = os.path.expanduser("~/Steam/steamapps/workshop/content/108600")

def get_workshop_path() -> str:
    """Return the correct Workshop path depending on OS."""
    if os.name == "nt":
        return WORKSHOP_PATH_WIN
    return WORKSHOP_PATH_UNIX

def scan_workshop_mods() -> list[dict]:
    """Scan the local Workshop folder for Project Zomboid mods."""
    workshop_path = get_workshop_path()
    mods = []
    if not os.path.isdir(workshop_path):
        return mods
    for mod_id in os.listdir(workshop_path):
        mod_folder = os.path.join(workshop_path, mod_id)
        if not os.path.isdir(mod_folder):
            continue
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
                        "path": mod_folder,
                    })
            except Exception:
                mods.append({"modId": mod_id, "title": f"Mod {mod_id}", "path": mod_folder})
        else:
            mods.append({"modId": mod_id, "title": f"Mod {mod_id}", "path": mod_folder})
    return mods

@app.get("/api/projectzomboid/workshop-mods")
async def get_workshop_mods():
    """
    Return the list of Project Zomboid Workshop mods installed locally.
    - If Steam/Workshop folder is missing, returns an error message.
    - Each mod includes modId, title, version, dependencies, and path.
    """
    workshop_path = get_workshop_path()
    if not os.path.isdir(workshop_path):
        return JSONResponse({
            "success": False,
            "message": "Workshop folder not found. Steam may not be installed or no mods downloaded.",
            "mods": [],
        })
    
    mods = scan_workshop_mods()
    if not mods:
        return JSONResponse({
            "success": True,
            "message": "No mods found in the Workshop folder.",
            "mods": [],
        })
    
    return JSONResponse({
        "success": True,
        "message": f"Found {len(mods)} mods in Workshop folder.",
        "mods": mods,
    })

@app.get("/api/projectzomboid/workshop-mods/file")
async def get_mod_file(path: str = Query(..., description="Full path to the file in a mod folder")):
    """Read the content of a specific file in a mod folder."""
    if not os.path.isfile(path):
        return error_response("GAME_002", 404, f"File not found: {path}")
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        return {"success": True, "content": content}
    except Exception as e:
        return error_response("BACKEND_001", 500, str(e))

@app.post("/api/projectzomboid/workshop-mods/file/save")
async def save_mod_file(request: Request):
    """Save content to a specific file in a mod folder."""
    data = await request.json()
    path = data.get("path")
    content = data.get("content", "")
    if not path or not os.path.isfile(path):
        return error_response("GAME_002", 404, f"File not found: {path}")
    try:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return {"success": True, "message": f"File saved: {path}"}
    except Exception as e:
        return error_response("BACKEND_001", 500, str(e))


# ---------------------------
# MODIX Config & Account Management
# ---------------------------

import json

MODIX_CONFIG_FILE = os.path.join(os.path.dirname(__file__), "modix_config", "modix_config.json")

def read_modix_config() -> dict:
    if not os.path.isfile(MODIX_CONFIG_FILE):
        return {}
    with open(MODIX_CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def write_modix_config(data: dict):
    os.makedirs(os.path.dirname(MODIX_CONFIG_FILE), exist_ok=True)
    with open(MODIX_CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

@app.get("/api/modix/config")
async def get_modix_config():
    """Return the full MODIX configuration from JSON file."""
    config = read_modix_config()
    return JSONResponse({"success": True, "config": config})

@app.post("/api/modix/users/update")
async def update_user_details(request: Request):
    """
    Update a single user's details in MODIX_USERS.
    JSON body:
    {
      "username": "...",
      "oldPassword": "...",   # required if changing password
      "newPassword": "...",   # optional
      "email": "...",         # optional
      "roles": [...],         # optional
      "permissions": [...]    # optional
    }
    """
    try:
        data = await request.json()
    except Exception:
        return JSONResponse({"success": False, "message": "Invalid JSON"}, status_code=400)

    username = data.get("username")
    if not username:
        return JSONResponse({"success": False, "message": "Username is required"}, status_code=400)

    config = read_modix_config()
    users = config.get("MODIX_USERS", [])

    # Find the user
    user = next((u for u in users if u.get("username") == username), None)
    if not user:
        return JSONResponse({"success": False, "message": "User not found"}, status_code=404)

    # Password update
    old_password = data.get("oldPassword")
    new_password = data.get("newPassword")
    if new_password:
        if not old_password:
            return JSONResponse({"success": False, "message": "Current password required to change password"}, status_code=400)
        if old_password != user.get("password"):
            return JSONResponse({"success": False, "message": "Current password is incorrect"}, status_code=400)
        user["password"] = new_password

    # Update other fields
    for field in ["email", "roles", "permissions"]:
        if field in data:
            user[field] = data[field]

    # Save back
    config["MODIX_USERS"] = users
    write_modix_config(config)

    return JSONResponse({"success": True, "message": f"User '{username}' updated successfully", "user": user})

from fastapi import Body

# In-memory storage for demo, replace with DB
ko_fi_licenses = {}

@app.post("/api/kofi/webhook")
async def kofi_webhook(payload: dict = Body(...)):
    """
    Ko-fi sends a POST request here whenever someone donates.
    Payload example:
    {
        "id": "123456",
        "from_name": "John Doe",
        "message": "Great work!",
        "amount": "5.00",
        "currency": "USD",
        "ko_fi_fee": "0.50",
        "created_at": "2025-09-15T12:34:56Z",
        "custom": "username:test1"
    }
    """
    try:
        # Extract username from the "custom" field
        custom = payload.get("custom", "")
        if not custom.startswith("username:"):
            return {"success": False, "detail": "No username provided"}
        username = custom.split("username:")[1]

        # Mark the user as Pro
        ko_fi_licenses[username] = {
            "plan": "Pro",
            "status": "Active",
            "expires_at": None,
            "amount": payload.get("amount"),
            "currency": payload.get("currency"),
            "transaction_id": payload.get("id")
        }

        return {"success": True, "message": f"User {username} upgraded to Pro"}
    except Exception as e:
        return {"success": False, "detail": str(e)}

@app.post("/api/kofi/redeem")
async def redeem_kofi(data: dict):
    transaction_id = data.get("transaction_id")
    username = data.get("username")

    # Check in ko_fi_licenses
    license = ko_fi_licenses.get(username)
    if not license or license["transaction_id"] != transaction_id:
        return {"success": False, "detail": "Transaction not found or invalid"}

    return {"success": True, "license": license}


# ---------------------------
# MODIX RBAC User Management API
# ---------------------------

from fastapi import Body, Path
from fastapi.responses import JSONResponse

MODIX_CONFIG_FILE = os.path.join(os.path.dirname(__file__), "modix_config", "modix_config.json")

def read_modix_config() -> dict:
    if not os.path.isfile(MODIX_CONFIG_FILE):
        return {}
    with open(MODIX_CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def write_modix_config(data: dict):
    os.makedirs(os.path.dirname(MODIX_CONFIG_FILE), exist_ok=True)
    with open(MODIX_CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

@app.get("/api/rbac/users")
async def list_users():
    """Return all MODIX users."""
    config = read_modix_config()
    return config.get("MODIX_USERS", [])

@app.post("/api/rbac/users")
async def add_user(user: dict = Body(...)):
    """
    Add a new user.
    JSON body:
    {
        "username": str,
        "password": str,
        "email": str,
        "is_active": bool,
        "roles": list[str],
        "permissions": list[str]
    }
    """
    config = read_modix_config()
    users = config.get("MODIX_USERS", [])

    if any(u["username"] == user["username"] for u in users):
        return JSONResponse({"success": False, "message": "Username already exists"}, status_code=400)

    new_user = {
        "username": user["username"],
        "password": user["password"],
        "email": user.get("email", ""),
        "roles": user.get("roles", []),
        "permissions": user.get("permissions", []),
    }
    users.append(new_user)
    config["MODIX_USERS"] = users
    write_modix_config(config)

    return {"success": True, "message": "User added", "user": new_user}

@app.delete("/api/rbac/users/{username}")
async def delete_user(username: str = Path(...)):
    """Remove a user by username."""
    config = read_modix_config()
    users = config.get("MODIX_USERS", [])
    users = [u for u in users if u["username"] != username]
    config["MODIX_USERS"] = users
    write_modix_config(config)
    return {"success": True, "message": f"User '{username}' removed"}

@app.post("/api/rbac/users/{username}/roles")
async def add_role_to_user(username: str = Path(...), payload: dict = Body(...)):
    """
    Add a role to a user.
    Body: { "role_name": "Moderator" }
    """
    role_name = payload.get("role_name")
    if not role_name:
        return JSONResponse({"success": False, "message": "role_name required"}, status_code=400)

    config = read_modix_config()
    users = config.get("MODIX_USERS", [])
    user = next((u for u in users if u["username"] == username), None)
    if not user:
        return JSONResponse({"success": False, "message": "User not found"}, status_code=404)

    if role_name not in user.get("roles", []):
        user.setdefault("roles", []).append(role_name)
        write_modix_config(config)

    return {"success": True, "message": f"Role '{role_name}' added to {username}", "user": user}

@app.post("/api/rbac/users/{username}/permissions")
async def add_permission_to_user(username: str = Path(...), payload: dict = Body(...)):
    """
    Toggle a permission for a user.
    Body: { "permission": "terminal_access", "value": "allow" }
    """
    perm = payload.get("permission")
    value = payload.get("value", "allow")

    if not perm:
        return JSONResponse({"success": False, "message": "permission required"}, status_code=400)

    config = read_modix_config()
    users = config.get("MODIX_USERS", [])
    user = next((u for u in users if u["username"] == username), None)
    if not user:
        return JSONResponse({"success": False, "message": "User not found"}, status_code=404)

    perms = set(user.get("permissions", []))
    if value == "allow":
        perms.add(perm)
    else:
        perms.discard(perm)
    user["permissions"] = list(perms)
    write_modix_config(config)

    return {"success": True, "message": f"Permission '{perm}' updated for {username}", "user": user}

# ---------------------------
# Support Tickets API
# ---------------------------

from fastapi import Body
from typing import List, Dict
import uuid

# In-memory storage for demo; replace with database or VPS forwarding later
support_tickets: List[Dict] = []

@app.get("/api/support/tickets")
async def list_tickets(userId: str = None):
    """
    Get all support tickets.
    Optional query param:
    - userId: filter tickets by specific user
    """
    if userId:
        filtered = [t for t in support_tickets if t.get("userId") == userId]
        return {"success": True, "tickets": filtered}
    return {"success": True, "tickets": support_tickets}


@app.post("/api/support/tickets")
async def create_ticket(payload: dict = Body(...)):
    """
    Create a new support ticket.
    JSON body:
    {
        "userId": str,
        "subject": str,
        "category": str,        # optional
        "priority": str,        # optional
        "page": str             # optional
    }
    """
    user_id = payload.get("userId")
    subject = payload.get("subject")
    if not user_id or not subject:
        return JSONResponse({"success": False, "message": "userId and subject are required"}, status_code=400)

    ticket = {
        "id": f"TCK-{uuid.uuid4().hex[:8].upper()}",
        "userId": user_id,
        "subject": subject,
        "status": "open",
        "category": payload.get("category", "general"),
        "priority": payload.get("priority", "medium"),
        "page": payload.get("page", "dashboard"),
        "created": datetime.now().isoformat(),
        "updated": datetime.now().isoformat(),
    }

    support_tickets.append(ticket)

    # TODO: forward to VPS when IP is available
    # Example:
    # await requests.post("http://<VPS_IP>:2010/api/support/tickets", json=ticket)

    return {"success": True, "ticket": ticket}


@app.get("/api/support/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    """
    Get a single ticket by ID
    """
    ticket = next((t for t in support_tickets if t["id"] == ticket_id), None)
    if not ticket:
        return JSONResponse({"success": False, "message": "Ticket not found"}, status_code=404)
    return {"success": True, "ticket": ticket}


@app.post("/api/support/tickets/{ticket_id}/update")
async def update_ticket(ticket_id: str, payload: dict = Body(...)):
    """
    Update a ticket (status, priority, category, etc.)
    JSON body can include:
    - status
    - priority
    - category
    - page
    - subject
    """
    ticket = next((t for t in support_tickets if t["id"] == ticket_id), None)
    if not ticket:
        return JSONResponse({"success": False, "message": "Ticket not found"}, status_code=404)

    for key in ["status", "priority", "category", "page", "subject"]:
        if key in payload:
            ticket[key] = payload[key]
    ticket["updated"] = datetime.now().isoformat()

    return {"success": True, "ticket": ticket}


@app.delete("/api/support/tickets/{ticket_id}")
async def delete_ticket(ticket_id: str):
    """
    Delete a ticket by ID
    """
    global support_tickets
    support_tickets = [t for t in support_tickets if t["id"] != ticket_id]
    return {"success": True, "message": f"Ticket {ticket_id} deleted"}



# ---------------------------
# Startup Hooks
# ---------------------------
@app.on_event("startup")
def on_startup():
    init_db()
    create_base_users_from_config()
    register_module_permissions()

# ---------------------------
# Entrypoint
# ---------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api_main:app", host="0.0.0.0", port=2010, reload=True)