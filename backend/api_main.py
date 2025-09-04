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

# === Project root path fix ===
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# === Core Imports ===
from backend.API.Core.database import init_db, create_base_users_from_config, register_module_permissions
from backend.API.Core.module_api import router as module_api_router
from backend.API.Core.auth import auth_router
from backend.API.Core.steam_search_player_api import router as steam_search_router


# === Game Specific APIs (raw routers) ===
from backend.API.Core.mod_debugger_api import router as mod_debugger_router
from backend.backend_module_loader import register_modules

# ---------------------------
# FastAPI App
# ---------------------------
app = FastAPI(title="Game Server Backend")

# === Core Routers ===
app.include_router(auth_router, prefix="/api/auth")
app.include_router(module_api_router, prefix="/api")
app.include_router(steam_search_router, prefix="/api")
app.include_router(mod_debugger_router, prefix="/api/debugger")

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

        return {"status": "running", "message": "Server started successfully"}
    except Exception as e:
        running_process = None
        return error_response("BACKEND_001", 500, str(e))

@app.post("/api/projectzomboid/stop")
async def stop_pz_server():
    global running_process
    if not running_process:
        return {"status": "stopped", "message": "Server not running"}

    running_process.terminate()
    running_process = None
    await log_queue.put("[SYSTEM] Server stopped manually")
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
