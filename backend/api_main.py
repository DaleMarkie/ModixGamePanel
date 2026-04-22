import os
import subprocess
import asyncio
import signal
import secrets
from threading import Thread
from collections import deque

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ---------------- APP ----------------
app = FastAPI(title="Modix Panel Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- ADMIN AUTH ----------------
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "changeme")
active_admin_tokens: set[str] = set()

def require_admin(token: str | None):
    if not token or token not in active_admin_tokens:
        raise HTTPException(status_code=403, detail="Not authorized")

@app.post("/api/admin/login")
def admin_login(payload: dict):
    if payload.get("password") != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")

    token = secrets.token_hex(32)
    active_admin_tokens.add(token)
    return {"token": token}

# ---------------- LOG STORAGE (NEW) ----------------
LOG_BUFFER = deque(maxlen=5000)  # store last logs for search
log_clients: set[WebSocket] = set()

def add_log(line: str):
    LOG_BUFFER.append(line)

# ---------------- SERVER STATE ----------------
ZOMBOID_DIR = "/home/ritchiedale72/ZomboidServer"
START_SCRIPT = "./start-server.sh"
PID_FILE = os.path.join(ZOMBOID_DIR, "server.pid")

EVENT_LOOP = None

@app.on_event("startup")
async def startup():
    global EVENT_LOOP
    EVENT_LOOP = asyncio.get_running_loop()

# ---------------- STREAM ----------------
def _stream(proc: subprocess.Popen):
    global log_clients

    for line in proc.stdout:
        line = line.strip()
        add_log(line)

        dead = set()

        for ws in list(log_clients):
            try:
                asyncio.run_coroutine_threadsafe(
                    ws.send_text(line),
                    EVENT_LOOP
                )
            except:
                dead.add(ws)

        for d in dead:
            log_clients.discard(d)

        if proc.poll() is not None:
            break

def start_stream(proc):
    Thread(target=_stream, args=(proc,), daemon=True).start()

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
def start_server():
    if not os.path.exists(ZOMBOID_DIR):
        return "Server folder missing"

    pid = read_pid()
    if pid:
        try:
            os.kill(pid, 0)
            return f"Already running ({pid})"
        except:
            clear_pid()

    proc = subprocess.Popen(
        ["bash", START_SCRIPT],
        cwd=ZOMBOID_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )

    write_pid(proc.pid)
    start_stream(proc)

    return f"Started {proc.pid}"

def stop_server():
    pid = read_pid()

    if not pid:
        return "Not running"

    if kill_pid(pid):
        clear_pid()
        return f"Stopped {pid}"

    clear_pid()
    return "Stopped (forced)"

def restart_server():
    stop_server()
    return start_server()

# ---------------- API ----------------
@app.post("/api/terminal")
async def terminal_api(payload: dict, x_admin_token: str = Header(None)):
    require_admin(x_admin_token)

    action = payload.get("action")

    if action == "start":
        return {"output": start_server()}

    if action == "stop":
        return {"output": stop_server()}

    if action == "restart":
        return {"output": restart_server()}

    return {"error": "invalid action"}

# ---------------- CLEAR LOGS ----------------
@app.post("/api/terminal/clear")
async def clear_logs(x_admin_token: str = Header(None)):
    require_admin(x_admin_token)

    LOG_BUFFER.clear()

    for ws in list(log_clients):
        try:
            await ws.send_text("__CLEAR__")
        except:
            log_clients.discard(ws)

    return {"success": True}

# ---------------- SEARCH LOGS (NEW FEATURE) ----------------
@app.get("/api/terminal/search")
def search_logs(q: str, x_admin_token: str = Header(None)):
    require_admin(x_admin_token)

    if not q:
        return {"results": []}

    q_lower = q.lower()

    results = [
        line for line in LOG_BUFFER
        if q_lower in line.lower()
    ][-200:]  # last 200 matches

    return {
        "query": q,
        "count": len(results),
        "results": results
    }

# ---------------- WEBSOCKET ----------------
@app.websocket("/ws/terminal")
async def ws_terminal(websocket: WebSocket):
    await websocket.accept()

    token = websocket.headers.get("x-admin-token")

    if token not in active_admin_tokens:
        await websocket.send_text("Unauthorized")
        await websocket.close()
        return

    log_clients.add(websocket)

    try:
        while True:
            msg = await websocket.receive_text()

            if msg.startswith("/"):
                continue

            try:
                import json
                data = json.loads(msg)

                if data.get("type") == "rcon":
                    await websocket.send_text(f"RCON: {data.get('command')}")
            except:
                pass

    except WebSocketDisconnect:
        log_clients.discard(websocket)

# ---------------- ROOT ----------------
@app.get("/")
def root():
    return {"status": "ok"}