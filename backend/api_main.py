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
# Game Server Ports Checker
# ---------------------------
DEFAULT_GAME_PORTS = {
    "Project Zomboid": 16261,
    "DayZ": 2302,
    "RimWorld": 27015,
}

def is_port_open(host: str, port: int, timeout: float = 1.0) -> bool:
    """Check if a TCP port is open on the given host."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False

@app.get("/api/server/game-ports")
async def check_game_ports(host: str = "127.0.0.1", custom_ports: str = None):
    """
    Check default game server ports (Project Zomboid, DayZ, RimWorld) 
    and optionally custom ports.
    Query params:
    - host: IP or hostname to check (default 127.0.0.1)
    - custom_ports: comma-separated ports, e.g., ?custom_ports=27016,27017
    """
    results = []

    # Check default game ports
    for game, port in DEFAULT_GAME_PORTS.items():
        status = "open" if is_port_open(host, port) else "closed"
        results.append({"name": game, "port": port, "status": status})

    # Check custom ports if provided
    if custom_ports:
        for p in custom_ports.split(","):
            try:
                port = int(p.strip())
                status = "open" if is_port_open(host, port) else "closed"
                results.append({"name": f"Custom Port {port}", "port": port, "status": status})
            except ValueError:
                continue

    return JSONResponse({"servers": results})

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