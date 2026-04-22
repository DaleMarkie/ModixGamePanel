import os
import subprocess
import asyncio
import signal
from threading import Thread
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

# ---------------- SERVER STATE ----------------
ZOMBOID_DIR = "/home/ritchiedale72/ZomboidServer"
START_SCRIPT = "./start-server.sh"
PID_FILE = os.path.join(ZOMBOID_DIR, "server.pid")

log_clients: set[WebSocket] = set()


# ---------------- LOG STREAM ----------------
def _stream_logs_sync(proc: subprocess.Popen):
    global log_clients

    try:
        for line in proc.stdout:
            dead = set()

            for ws in list(log_clients):
                try:
                    asyncio.run_coroutine_threadsafe(
                        ws.send_text(line.strip()),
                        asyncio.get_event_loop()
                    )
                except Exception:
                    dead.add(ws)

            for d in dead:
                log_clients.discard(d)

            if proc.poll() is not None:
                break
    except Exception:
        pass


def start_log_stream(proc: subprocess.Popen):
    Thread(target=_stream_logs_sync, args=(proc,), daemon=True).start()


# ---------------- PID HELPERS ----------------
def read_pid():
    if not os.path.exists(PID_FILE):
        return None
    try:
        with open(PID_FILE, "r") as f:
            return int(f.read().strip())
    except:
        return None


def write_pid(pid: int):
    with open(PID_FILE, "w") as f:
        f.write(str(pid))


def clear_pid():
    if os.path.exists(PID_FILE):
        os.remove(PID_FILE)


def kill_process(pid: int):
    try:
        os.kill(pid, signal.SIGTERM)
        return True
    except Exception:
        return False


# ---------------- SERVER CONTROL ----------------
def start_zomboid():
    if not os.path.exists(ZOMBOID_DIR):
        return "Zomboid directory not found"

    existing = read_pid()
    if existing:
        try:
            os.kill(existing, 0)
            return f"Server already running (PID {existing})"
        except:
            clear_pid()

    proc = subprocess.Popen(
        ["bash", START_SCRIPT],
        cwd=ZOMBOID_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    write_pid(proc.pid)
    start_log_stream(proc)

    return f"Started PID {proc.pid}"


def stop_zomboid():
    pid = read_pid()

    if not pid:
        return "Server not running"

    if kill_process(pid):
        clear_pid()
        return f"Stopped PID {pid}"

    clear_pid()
    return "Failed to stop (cleaned stale PID)"


def restart_zomboid():
    stop_zomboid()
    return start_zomboid()


# ---------------- RCON ----------------
async def execute_rcon(command: str):
    try:
        if hasattr(rcon_pool, "execute"):
            return await rcon_pool.execute(command)
        if hasattr(rcon_pool, "send"):
            return await rcon_pool.send(command)
        return "RCON not configured"
    except Exception as e:
        return f"RCON error: {str(e)}"


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

    if action == "rcon":
        cmd = payload.get("command")
        return {"output": await execute_rcon(cmd)}

    return {"error": "invalid action"}


# ---------------- WEBSOCKET ----------------
@app.websocket("/ws/terminal")
async def terminal_ws(websocket: WebSocket):
    await websocket.accept()
    log_clients.add(websocket)

    try:
        while True:
            msg = await websocket.receive_text()

            # direct rcon (/command)
            if msg.startswith("/"):
                cmd = msg.lstrip("/")
                result = await execute_rcon(cmd)
                await websocket.send_text(f"RCON: {result}")
                continue

            # json rcon
            try:
                import json
                data = json.loads(msg)

                if data.get("type") == "rcon":
                    result = await execute_rcon(data.get("command", ""))
                    await websocket.send_text(f"RCON: {result}")
            except:
                pass

    except WebSocketDisconnect:
        log_clients.discard(websocket)


# ---------------- ROUTERS ----------------
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


# ---------------- FALLBACK ----------------
@app.get("/api/modules/enabled")
def modules_enabled():
    return {"modules": []}

@app.get("/api/docker/containers")
def docker_containers():
    return {"containers": []}

@app.get("/")
def root():
    return {"status": "running", "service": "Modix Panel Backend"}


# ---------------- START ----------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.api_main:app",
        host="0.0.0.0",
        port=2010,
        reload=True
    )