from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import subprocess
import os
import platform
import threading
import signal

app = FastAPI()

# Track running processes per game
running_processes: dict[str, subprocess.Popen] = {}
process_locks: dict[str, threading.Lock] = {}

# Track active WebSocket connections per game
ws_connections: dict[str, list[WebSocket]] = {}


class CommandRequest(BaseModel):
    gameId: str
    command: str | None = None
    batchPath: str | None = None


# -------------------- WEBSOCKET --------------------

def broadcast_ws(game_id: str, message: dict):
    for ws in ws_connections.get(game_id, [])[:]:
        try:
            ws.send_json(message)
        except Exception:
            ws_connections[game_id].remove(ws)


def stream_process(proc: subprocess.Popen, game_id: str):
    def reader(pipe, out_type):
        for line in iter(pipe.readline, ""):
            if line:
                broadcast_ws(game_id, {
                    "type": out_type,
                    "text": line.rstrip()
                })
        pipe.close()

    threading.Thread(target=reader, args=(proc.stdout, "output"), daemon=True).start()
    threading.Thread(target=reader, args=(proc.stderr, "error"), daemon=True).start()


@app.websocket("/api/terminal/ws/{game_id}")
async def terminal_ws(websocket: WebSocket, game_id: str):
    await websocket.accept()
    ws_connections.setdefault(game_id, []).append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        ws_connections[game_id].remove(websocket)


# -------------------- EXECUTION --------------------

def stop_process(game_id: str):
    proc = running_processes.pop(game_id, None)
    if not proc:
        return

    try:
        if platform.system().lower() == "windows":
            proc.send_signal(signal.CTRL_BREAK_EVENT)
        else:
            proc.terminate()
        proc.wait(timeout=10)
    except Exception:
        proc.kill()


@app.post("/api/terminal/execute")
def execute_command(req: CommandRequest):
    game_id = req.gameId
    cmd = req.command
    batch_path = req.batchPath
    system_os = platform.system().lower()

    if game_id not in process_locks:
        process_locks[game_id] = threading.Lock()

    with process_locks[game_id]:

        # ---------------- CONTROL COMMANDS ----------------

        if cmd in {"start", "stop", "restart"}:
            if not batch_path:
                raise HTTPException(400, "Batch path not provided")

            batch_path = os.path.abspath(batch_path)

            if not os.path.isfile(batch_path):
                raise HTTPException(400, f"Batch file not found: {batch_path}")

            work_dir = os.path.dirname(batch_path)

            # STOP
            if cmd == "stop":
                stop_process(game_id)
                return {"output": f"Server {game_id} stopped."}

            # RESTART = stop first
            if cmd == "restart":
                stop_process(game_id)

            try:
                if system_os == "windows":
                    # REQUIRED for paths with spaces
                    proc = subprocess.Popen(
                        ["cmd.exe", "/c", batch_path],
                        cwd=work_dir,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True,
                        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
                    )
                else:
                    # Always run via bash (no chmod issues)
                    proc = subprocess.Popen(
                        ["bash", batch_path],
                        cwd=work_dir,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True,
                        preexec_fn=os.setsid,
                    )

                running_processes[game_id] = proc
                stream_process(proc, game_id)

                return {
                    "output": f"Server {game_id} started",
                    "batch": batch_path,
                    "cwd": work_dir,
                }

            except Exception as e:
                raise HTTPException(500, str(e))

        # ---------------- ARBITRARY COMMANDS ----------------

        if game_id not in running_processes:
            raise HTTPException(400, "No running server for this game")

        work_dir = os.path.dirname(batch_path) if batch_path else None

        try:
            if system_os == "windows":
                result = subprocess.run(
                    cmd,
                    shell=True,
                    cwd=work_dir,
                    capture_output=True,
                    text=True,
                )
            else:
                result = subprocess.run(
                    cmd,
                    shell=True,
                    executable="/bin/bash",
                    cwd=work_dir,
                    capture_output=True,
                    text=True,
                )

            return {
                "output": result.stdout.strip(),
                "error": result.stderr.strip(),
            }

        except Exception as e:
            raise HTTPException(500, str(e))
