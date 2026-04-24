import os
import subprocess
import asyncio
import signal
import json
import re
from threading import Thread, Lock

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uvicorn

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
from backend.steam_installer import router as steam_installer_router

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
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- STATE ----------------
ZOMBOID_DIR = "/home/ritchiedale72/ZomboidServer"
START_SCRIPT = "./start-server.sh"
PID_FILE = os.path.join(ZOMBOID_DIR, "server.pid")

log_clients = set()
log_lock = Lock()
EVENT_LOOP = None

banned_clients = set()

# ---------------- STARTUP ----------------
@app.on_event("startup")
async def startup_event():
    global EVENT_LOOP
    EVENT_LOOP = asyncio.get_running_loop()

# ---------------- LOG STREAM ----------------
def stream_logs(proc: subprocess.Popen):
    global log_clients

    try:
        for line in iter(proc.stdout.readline, ""):
            if not line:
                continue

            dead = []

            with log_lock:
                clients = list(log_clients)

            for ws in clients:
                try:
                    asyncio.run_coroutine_threadsafe(
                        ws.send_text(line.strip()),
                        EVENT_LOOP
                    )
                except:
                    dead.append(ws)

            if dead:
                with log_lock:
                    for d in dead:
                        log_clients.discard(d)

            if proc.poll() is not None:
                break

    except Exception:
        pass


def start_log_stream(proc):
    Thread(target=stream_logs, args=(proc,), daemon=True).start()

# ---------------- PID ----------------
def read_pid():
    if not os.path.exists(PID_FILE):
        return None
    try:
        return int(open(PID_FILE).read().strip())
    except:
        return None


def write_pid(pid):
    with open(PID_FILE, "w") as f:
        f.write(str(pid))


def clear_pid():
    if os.path.exists(PID_FILE):
        os.remove(PID_FILE)


def kill_pid(pid):
    try:
        os.kill(pid, signal.SIGTERM)
        return True
    except:
        return False

# ---------------- SERVER CONTROL ----------------
def start_zomboid():
    pid = read_pid()

    if pid:
        try:
            os.kill(pid, 0)
            return f"Server already running (PID {pid})"
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

    kill_pid(pid)
    clear_pid()
    return f"Stopped PID {pid}"


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
        return str(e)

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
        return {"output": await execute_rcon(payload.get("command", ""))}

    if action == "status":
        pid = read_pid()
        return {"output": f"PID {pid}" if pid else "Stopped"}

    return {"error": "invalid action"}

# ---------------- TERMINAL WS ----------------
@app.websocket("/ws/terminal")
async def terminal_ws(websocket: WebSocket):
    await websocket.accept()
    log_clients.add(websocket)

    try:
        while True:
            msg = await websocket.receive_text()

            if msg.startswith("/"):
                result = await execute_rcon(msg[1:])
                await websocket.send_text(str(result))

    except WebSocketDisconnect:
        log_clients.discard(websocket)

# ---------------- PLAYERS STREAM ----------------
@app.get("/api/projectzomboid/players-stream")
async def players_stream():
    async def event_generator():
        while True:
            try:
                raw = await execute_rcon("players")

                players = []

                if raw:
                    for line in raw.splitlines():
                        line = line.strip()
                        if not line or "players" in line.lower():
                            continue

                        name = line.split(" ")[0]

                        players.append({
                            "name": name,
                            "lastSeen": "Now",
                            "totalHours": 0
                        })

                yield f"data: {json.dumps(players)}\n\n"

            except:
                yield f"data: {json.dumps([])}\n\n"

            await asyncio.sleep(2)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# ---------------- BAN SYSTEM (REAL RCON ONLY) ----------------

async def get_bans_from_server():
    try:
        raw = await execute_rcon("getuserbanlist")

        if not raw:
            return []

        bans = []

        for line in raw.splitlines():
            line = line.strip()
            if not line:
                continue

            parts = re.split(r"[-:]", line, maxsplit=1)

            bans.append({
                "player": parts[0].strip(),
                "message": parts[1].strip() if len(parts) > 1 else "",
                "timestamp": "live"
            })

        return bans

    except:
        return []


@app.get("/api/projectzomboid/banned")
async def get_banned_players():
    return {"banned": await get_bans_from_server()}


@app.post("/api/projectzomboid/ban")
async def ban_player(payload: dict):
    player = payload.get("player")
    reason = payload.get("reason", "No reason")

    await execute_rcon(f"adduserban {player} {reason}")

    for ws in list(banned_clients):
        try:
            await ws.send_json({"event": "refresh"})
        except:
            banned_clients.discard(ws)

    return {"ok": True}


@app.post("/api/projectzomboid/unban")
async def unban_player(payload: dict):
    player = payload.get("player")

    await execute_rcon(f"removeuserban {player}")

    for ws in list(banned_clients):
        try:
            await ws.send_json({"event": "refresh"})
        except:
            banned_clients.discard(ws)

    return {"ok": True}


@app.websocket("/ws/banned")
async def banned_ws(websocket: WebSocket):
    await websocket.accept()
    banned_clients.add(websocket)

    try:
        while True:
            await websocket.receive_text()

            await websocket.send_json({
                "event": "full_list",
                "banned": await get_bans_from_server()
            })

    except WebSocketDisconnect:
        banned_clients.discard(websocket)

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
app.include_router(steam_installer_router, prefix="/api/steam")

# ---------------- ROOT ----------------
@app.get("/")
def root():
    return {"status": "running"}

# ---------------- RUN ----------------
if __name__ == "__main__":
    uvicorn.run(
        "backend.api_main:app",
        host="0.0.0.0",
        port=2010,
        reload=True,
        log_level="info"
    )