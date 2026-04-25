import os
import subprocess
import asyncio
import signal
from threading import Thread, Lock

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse

from backend.rcon_pool import rcon_pool

router = APIRouter()

# ---------------- STATE ----------------
ZOMBOID_DIR = "/home/ritchiedale72/ZomboidServer"
START_SCRIPT = "./start-server.sh"
PID_FILE = os.path.join(ZOMBOID_DIR, "server.pid")

log_clients = set()
log_lock = Lock()
EVENT_LOOP = None

current_proc = None  # 👈 IMPORTANT: live process reference

# auto admin password (set in environment or fallback)
ADMIN_PASSWORD = os.getenv("ZOMBOID_ADMIN_PASSWORD", "admin")


# ---------------- STARTUP HOOK ----------------
def set_event_loop(loop):
    global EVENT_LOOP
    EVENT_LOOP = loop


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
    global current_proc

    pid = read_pid()

    if pid:
        try:
            os.kill(pid, 0)
            return f"Server already running (PID {pid})"
        except:
            clear_pid()

    # 🔥 CRITICAL CHANGE: stdin=PIPE so we can answer prompts
    current_proc = subprocess.Popen(
        ["bash", START_SCRIPT],
        cwd=ZOMBOID_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        stdin=subprocess.PIPE,   # 👈 REQUIRED
        text=True,
        bufsize=1
    )

    write_pid(current_proc.pid)
    start_log_stream(current_proc)

    return f"Started PID {current_proc.pid}"


def stop_zomboid():
    global current_proc

    pid = read_pid()

    if not pid:
        return "Server not running"

    kill_pid(pid)

    try:
        if current_proc and current_proc.stdin:
            current_proc.stdin.close()
    except:
        pass

    current_proc = None
    clear_pid()

    return f"Stopped PID {pid}"


def restart_zomboid():
    stop_zomboid()
    return start_zomboid()


# ---------------- LOG STREAM ----------------
def stream_logs(proc):
    global log_clients

    try:
        for line in iter(proc.stdout.readline, ""):
            if not line:
                continue

            # 🔥 AUTO PASSWORD DETECTION
            if "Enter new administrator password" in line:
                try:
                    proc.stdin.write(ADMIN_PASSWORD + "\n")
                    proc.stdin.flush()
                except:
                    pass

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
@router.post("/api/terminal")
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


# ---------------- TERMINAL WEBSOCKET ----------------
@router.websocket("/ws/terminal")
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


# ---------------- OPTIONAL STREAM ----------------
@router.get("/api/terminal/logs")
async def terminal_logs():
    async def event_generator():
        while True:
            yield "data: heartbeat\n\n"
            await asyncio.sleep(5)

    return StreamingResponse(event_generator(), media_type="text/event-stream")