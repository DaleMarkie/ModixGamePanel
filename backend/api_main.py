# Ensure project root is in sys.path for direct script execution
import sys
import os
import shutil
import subprocess
import socket
from typing import Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

# === Project root path fix ===
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# === Core Imports ===
from backend.API.Core.database import init_db, create_base_users_from_config, register_module_permissions
from backend.API.Core.container_manager_api import router as container_manager_router
from backend.API.Core.docker_api import router as docker_api_router
from backend.API.Core.module_api import router as module_api_router
from backend.API.Core.auth import auth_router
from backend.API.Core.steam_search_player_api import router as steam_search_router

# === Game Specific APIs (raw routers) ===
from module_system.Core.Terminal.backend.games.projectzomboid.terminal_api import router as projectzomboid_terminal_router
from backend.API.Core.pz_server_api import router as projectzomboid_server_router   # server control
from backend.API.Core.dayz_server_api import router as dayz_server_router

from backend.backend_module_loader import register_modules


# ---------------------------
# FastAPI App
# ---------------------------
app = FastAPI(title="Game Server Backend")

# === Core Routers ===
app.include_router(docker_api_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(container_manager_router, prefix="/api")
app.include_router(module_api_router, prefix="/api")
app.include_router(steam_search_router, prefix="/api")

# === Project Zomboid APIs ===
app.include_router(projectzomboid_terminal_router, prefix="/api/terminal/projectzomboid")

# ⚡️ We will wrap these instead of directly exposing them
# app.include_router(projectzomboid_server_router, prefix="/api/projectzomboid")
# app.include_router(dayz_server_router, prefix="/api/dayz")

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
    """Return a structured JSON error with code + message."""
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
# Health & Diagnostics Endpoints
# ---------------------------
@app.get("/health")
def health_check():
    return {"success": True, "status": "ok"}

@app.get("/check-port")
def check_port(port: int):
    """Check if a port is already bound on localhost."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        in_use = s.connect_ex(("127.0.0.1", port)) == 0
    return {"port": port, "inUse": in_use}


# ---------------------------
# Game Server Wrappers
# ---------------------------
def check_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0

@app.post("/api/projectzomboid/start")
async def start_pz_server(request: Request):
    try:
        data = await request.json()
        port = data.get("port", 16261)

        # port check
        if check_port_in_use(port):
            return error_response("PORT_004", 409, f"Port {port} already in use")

        # call underlying router
        return await projectzomboid_server_router.routes[0].endpoint(request)
    except FileNotFoundError as e:
        return error_response("GAME_002", 404, str(e))
    except subprocess.SubprocessError as e:
        return error_response("GAME_003", 500, f"Server crashed: {e}")
    except Exception as e:
        return error_response("BACKEND_001", 500, str(e))

@app.post("/api/dayz/start")
async def start_dayz_server(request: Request):
    try:
        data = await request.json()
        port = data.get("port", 2302)

        # port check
        if check_port_in_use(port):
            return error_response("PORT_004", 409, f"Port {port} already in use")

        # call underlying router
        return await dayz_server_router.routes[0].endpoint(request)
    except FileNotFoundError as e:
        return error_response("GAME_002", 404, str(e))
    except subprocess.SubprocessError as e:
        return error_response("GAME_003", 500, f"Server crashed: {e}")
    except Exception as e:
        return error_response("BACKEND_001", 500, str(e))


# ---------------------------
# Project Zomboid Mods API
# ---------------------------
STEAM_WORKSHOP_DIR = os.path.expanduser("~/Zomboid/steamapps/workshop/content/108600")

def read_mod_name_from_info(mod_dir: str) -> str:
    info_file = os.path.join(mod_dir, "mod.info")
    if os.path.isfile(info_file):
        try:
            with open(info_file, encoding="utf-8", errors="ignore") as f:
                for line in f:
                    if line.lower().startswith("name="):
                        return line.split("=", 1)[1].strip()
        except:
            pass

    mods_subdir = os.path.join(mod_dir, "mods")
    if os.path.isdir(mods_subdir):
        for sub in os.scandir(mods_subdir):
            if sub.is_dir():
                nested_info = os.path.join(sub.path, "mod.info")
                if os.path.isfile(nested_info):
                    try:
                        with open(nested_info, encoding="utf-8", errors="ignore") as f:
                            for line in f:
                                if line.lower().startswith("name="):
                                    return line.split("=", 1)[1].strip()
                    except:
                        pass
    return os.path.basename(mod_dir)

@app.get("/api/mods")
def list_mods():
    if not os.path.exists(STEAM_WORKSHOP_DIR):
        return error_response("GAME_002", 404, "Workshop folder not found.")

    mods = []
    for entry in os.scandir(STEAM_WORKSHOP_DIR):
        if entry.is_dir():
            mod_name = read_mod_name_from_info(entry.path)
            poster_path = None
            for root, _, files in os.walk(entry.path):
                if "poster.png" in files:
                    poster_path = os.path.join(root, "poster.png")
                    break
            mods.append({
                "id": entry.name,
                "name": mod_name,
                "path": os.path.abspath(entry.path),
                "poster": f"/api/mods/{entry.name}/poster" if poster_path else None,
                "enabled": True,
            })

    return {"success": True, "mods": mods}

@app.get("/api/mods/{mod_id}/poster")
def get_mod_poster(mod_id: str):
    mod_path = os.path.join(STEAM_WORKSHOP_DIR, mod_id)
    if not os.path.exists(mod_path):
        return error_response("GAME_002", 404, "Mod not found.")
    for root, _, files in os.walk(mod_path):
        if "poster.png" in files:
            return FileResponse(os.path.join(root, "poster.png"))
    return error_response("GAME_002", 404, "Poster not found.")

@app.post("/api/mods/{mod_id}/toggle")
def toggle_mod(mod_id: str):
    mod_path = os.path.join(STEAM_WORKSHOP_DIR, mod_id)
    if not os.path.exists(mod_path):
        return error_response("GAME_002", 404, "Mod not found.")
    return {"success": True, "status": "ok", "message": f"Mod {mod_id} toggled"}

@app.delete("/api/mods/{mod_id}")
def delete_mod(mod_id: str):
    mod_path = os.path.join(STEAM_WORKSHOP_DIR, mod_id)
    if not os.path.exists(mod_path):
        return error_response("GAME_002", 404, "Mod not found.")
    try:
        shutil.rmtree(mod_path)
        return {"success": True, "status": "ok", "message": f"Mod {mod_id} deleted"}
    except Exception as e:
        return error_response("BACKEND_001", 500, str(e))

@app.post("/api/mods/open")
def open_mod_folder(data: dict):
    path: Optional[str] = data.get("path")
    if not path or not os.path.exists(path):
        return error_response("GAME_002", 400, "Invalid path")
    try:
        if sys.platform.startswith("linux"):
            subprocess.Popen(["xdg-open", path])
        elif sys.platform == "win32":
            os.startfile(path)
        elif sys.platform == "darwin":
            subprocess.Popen(["open", path])
        else:
            return error_response("BACKEND_001", 500, "Unsupported OS")
        return {"success": True, "status": "ok", "message": f"Opened {path}"}
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
    uvicorn.run(
        "backend.api_main:app",
        host="0.0.0.0",
        port=2010,
    )
