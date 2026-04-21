import os
import subprocess
import asyncio

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# ---------------- CORE ROUTES ----------------
from backend.API.Core.auth import auth_router
from backend.terminal import router as terminal_router
from backend.games_api import router as games_router
from backend.filemanager import router as filemanager_router
from backend.API.Core.workshop_api import workshop_api
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


# ---------------- OPTIONAL SERVER STATE ----------------
ZOMBOID_DIR = "/home/ritchiedale72/ZomboidServer"
START_SCRIPT = "./start-server.sh"

zomboid_process = None
log_clients = set()


# ---------------- SAFE TASK RUNNER ----------------
def run_async_task(coro):
    loop = asyncio.get_event_loop()
    loop.create_task(coro)


# ---------------- SERVER CONTROL ----------------
def start_zomboid():
    global zomboid_process

    if zomboid_process and zomboid_process.poll() is None:
        return "Server already running"

    if not os.path.exists(ZOMBOID_DIR):
        return "Zomboid directory not found"

    zomboid_process = subprocess.Popen(
        ["bash", START_SCRIPT],
        cwd=ZOMBOID_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    run_async_task(stream_logs())

    return f"Started PID {zomboid_process.pid}"


def stop_zomboid():
    global zomboid_process

    if zomboid_process:
        try:
            zomboid_process.terminate()
        except Exception:
            pass

    zomboid_process = None
    return "Stopped"


def restart_zomboid():
    stop_zomboid()
    return start_zomboid()


# ---------------- LOG STREAM ----------------
async def stream_logs():
    global zomboid_process

    if not zomboid_process or not zomboid_process.stdout:
        return

    try:
        for line in zomboid_process.stdout:
            dead = set()

            for ws in list(log_clients):
                try:
                    await ws.send_text(line.strip())
                except Exception:
                    dead.add(ws)

            for d in dead:
                log_clients.discard(d)

            if zomboid_process.poll() is not None:
                break

    except Exception:
        pass


# ---------------- TERMINAL API ----------------
@app.post("/api/terminal")
async def terminal_api(payload: dict):
    action = payload.get("action")

    if action == "start":
        return {"output": start_zomboid()}

    if action == "stop":
        return {"output": stop_zomboid()}

    if action == "restart":
        return {"output": restart_zomboid()}

    return {"error": "invalid action"}


# ---------------- WEBSOCKET ----------------
@app.websocket("/ws/terminal")
async def terminal_ws(websocket: WebSocket):
    await websocket.accept()
    log_clients.add(websocket)

    try:
        while True:
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        log_clients.discard(websocket)


# ---------------- ROUTER MOUNTING ----------------
app.include_router(auth_router, prefix="/api")
app.include_router(games_router, prefix="/api/games")

app.include_router(filemanager_router, prefix="/api/filemanager")

app.include_router(workshop_api.router, prefix="/api/workshop")

app.include_router(modupdates_router, prefix="/api/mods")
app.include_router(modupdates_router, prefix="/api/updater")

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


# ---------------- SAFE FALLBACK ROUTES (FIX 404 SPAM) ----------------
@app.get("/api/modules/enabled")
def modules_enabled():
    return {"modules": []}


@app.get("/api/docker/containers")
def docker_containers():
    return {"containers": []}


# ---------------- ROOT ----------------
@app.get("/")
def root():
    return {
        "status": "running",
        "service": "Modix Panel Backend"
    }


# ---------------- START ----------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.api_main:app",
        host="0.0.0.0",
        port=2010,
        reload=True
    )