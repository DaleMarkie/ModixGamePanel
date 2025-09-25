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
from backend.API.Core.workshop_api.workshop_api import router as workshop_router
# === Player Management ===
from steam_notes_api import router as steam_notes_router
from all_players_api import router as all_players_router
from api_chatlogs import router as chatlogs_router
from PlayersBannedAPI import router as players_banned_router

from backend.API.Core.tools_api.portcheck_api import router as portcheck_router
from backend.API.Core.user_permissions_api.user_permissions_api import router as user_permissions_router


# === Game Specific APIs (raw routers) ===
from backend.backend_module_loader import register_modules
from backend.API.Core.games_api.projectzomboid.pz_server_settings import router as pz_settings_router
from backend.API.Core.tools_api.ddos_manager_api import router as ddos_router
from backend.API.Core.support_api.support_api import router as support_router
from backend.API.Core.tools_api.performance_api import router as performance_router
from backend.API.Core.tools_api.debugger_api import router as debugger_router
# ---------------------------
# FastAPI App
# ---------------------------
app = FastAPI(title="Game Server Backend")

# === Core Routers ===
app.include_router(auth_router, prefix="/api/auth")
app.include_router(module_api_router, prefix="/api")
app.include_router(steam_search_router, prefix="/api")
app.include_router(ddos_router)
app.include_router(user_permissions_router, prefix="/api")
app.include_router(support_router, prefix="/api/support")
app.include_router(performance_router, prefix="/api")
app.include_router(debugger_router, prefix="/api")
app.include_router(ddos_router, prefix="/api")

# === Player Management ===
app.include_router(steam_notes_router)
app.include_router(all_players_router)
app.include_router(chatlogs_router)
app.include_router(players_banned_router)

# === Tools ===
app.include_router(portcheck_router, prefix="/api")
app.include_router(workshop_router, prefix="/api")
# === Games ===
app.include_router(pz_settings_router, prefix="/api/projectzomboid")

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

import httpx

# ---------------------------
# Remote License Verification
# ---------------------------
REMOTE_LICENSE_SERVER = "http://REMOTE_FLASK_SERVER_IP:5000"  # replace with your remote Flask server IP

@app.post("/api/licenses/verify-remote")
async def verify_remote_license(request: Request):
    """
    Verify a license code by querying the remote Flask license server.
    Expects JSON: { "license_code": "CODE123" }
    """
    data = await request.json()
    code = data.get("license_code", "").upper()

    if not code:
        return JSONResponse({"success": False, "detail": "Missing license code"}, status_code=400)

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"{REMOTE_LICENSE_SERVER}/api/licenses/verify",
                json={"license_code": code}
            )
            license_data = response.json()

        if response.status_code == 200 and license_data.get("success"):
            return {"success": True, "license": license_data.get("license")}
        else:
            return JSONResponse({
                "success": False,
                "detail": license_data.get("detail", "Invalid or expired license")
            }, status_code=404)

    except httpx.RequestError as e:
        return JSONResponse({
            "success": False,
            "detail": f"Could not reach remote license server: {str(e)}"
        }, status_code=502)

# ---------------------------
# Startup Hooks
# ---------------------------
@app.on_event("startup")
def on_startup():
    init_db()
    create_base_users_from_config()
    register_module_permissions()

# ---------------------------
# Project Zomboid Server Start/Stop (Windows/Linux Support)
# ---------------------------
running_pz_process: Optional[subprocess.Popen] = None
pz_log_queue: asyncio.Queue = asyncio.Queue()

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0

async def stream_pz_output(stream, prefix: str):
    loop = asyncio.get_event_loop()
    while True:
        line = await loop.run_in_executor(None, stream.readline)
        if not line:
            break
        log_text = line.strip()
        await pz_log_queue.put(f"[{prefix}] {log_text}")

        # Update connected players in real-time
        parse_pz_log_for_players(log_text)

async def monitor_pz_exit(process: subprocess.Popen):
    global running_pz_process
    await asyncio.get_event_loop().run_in_executor(None, process.wait)
    await pz_log_queue.put("[SYSTEM] Server stopped")
    running_pz_process = None

@app.post("/api/projectzomboid/start")
async def start_project_zomboid(request: Request):
    global running_pz_process
    if running_pz_process:
        return error_response("BACKEND_001", 400, "Server already running")

    data = await request.json()
    os_type = data.get("os", "windows").lower()  # 'windows' or 'linux'
    batch_file = data.get("batchFile")
    port = data.get("port", 16261)

    if not batch_file or not os.path.isfile(batch_file):
        return error_response("GAME_002", 404, f"Batch/sh file not found: {batch_file}")

    if is_port_in_use(port):
        return error_response("PORT_004", 409, f"Port {port} already in use")

    try:
        if os_type == "windows":
            running_pz_process = subprocess.Popen(
                f'cmd /c "{batch_file}"',
                cwd=os.path.dirname(batch_file),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                shell=True,
                text=True,
                bufsize=1
            )
        elif os_type == "linux":
            running_pz_process = subprocess.Popen(
                ["bash", batch_file],
                cwd=os.path.dirname(batch_file),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1
            )
        else:
            return error_response("GAME_001", 400, f"Unknown OS: {os_type}")

        asyncio.create_task(stream_pz_output(running_pz_process.stdout, "OUT"))
        asyncio.create_task(stream_pz_output(running_pz_process.stderr, "ERR"))
        asyncio.create_task(monitor_pz_exit(running_pz_process))

        return {"status": "running", "message": f"Project Zomboid ({os_type}) server started"}
    except Exception as e:
        running_pz_process = None
        return error_response("BACKEND_001", 500, str(e))

@app.post("/api/projectzomboid/stop")
async def stop_project_zomboid():
    global running_pz_process
    if not running_pz_process:
        return {"status": "stopped", "message": "Server not running"}

    running_pz_process.terminate()
    running_pz_process = None
    await pz_log_queue.put("[SYSTEM] Server stopped manually")
    return {"status": "stopped", "message": "Server terminated"}

@app.get("/api/projectzomboid/terminal/log-stream")
async def pz_terminal_log_stream():
    async def event_generator():
        while True:
            log = await pz_log_queue.get()
            yield f"data: {log}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")


# ---------------------------
# Entrypoint
# ---------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api_main:app", host="0.0.0.0", port=2010, reload=True)