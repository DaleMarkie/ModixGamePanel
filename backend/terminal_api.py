from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import subprocess
import os
import platform
import threading

app = FastAPI()

# Track running processes per game
running_processes = {}
process_locks = {}

# Track active WebSocket connections per game
ws_connections = {}

class CommandRequest(BaseModel):
    gameId: str
    command: str = None
    batchPath: str = None


def broadcast_ws(game_id: str, message: dict):
    """Send a message to all connected websockets for this game."""
    connections = ws_connections.get(game_id, [])
    for ws in connections[:]:
        try:
            ws.send_json(message)
        except Exception:
            connections.remove(ws)


def stream_process(proc: subprocess.Popen, game_id: str):
    """Continuously read stdout/stderr and broadcast to WS."""
    def reader(pipe, out_type):
        for line in iter(pipe.readline, ""):
            line = line.rstrip()
            if line:
                print(f"[{game_id}][{out_type}] {line}")
                broadcast_ws(game_id, {"type": out_type, "text": line})
        pipe.close()

    threading.Thread(target=reader, args=(proc.stdout, "output"), daemon=True).start()
    threading.Thread(target=reader, args=(proc.stderr, "error"), daemon=True).start()


@app.websocket("/api/terminal/ws/{game_id}")
async def terminal_ws(websocket: WebSocket, game_id: str):
    await websocket.accept()
    if game_id not in ws_connections:
        ws_connections[game_id] = []
    ws_connections[game_id].append(websocket)
    try:
        while True:
            await websocket.receive_text()  # keep alive
    except WebSocketDisconnect:
        pass
    finally:
        ws_connections[game_id].remove(websocket)


@app.post("/api/terminal/execute")
def execute_command(req: CommandRequest):
    game_id = req.gameId
    cmd = req.command
    batch_path = req.batchPath
    system_os = platform.system().lower()

    if game_id not in process_locks:
        process_locks[game_id] = threading.Lock()

    with process_locks[game_id]:
        # CONTROL COMMANDS
        if cmd in ["start", "stop", "restart"]:
            if not batch_path:
                raise HTTPException(status_code=400, detail="Batch path not provided.")
            if not os.path.isfile(batch_path):
                raise HTTPException(status_code=400, detail=f"Batch file not found: {batch_path}")

            # STOP
            if cmd == "stop":
                if game_id in running_processes:
                    proc = running_processes.pop(game_id)
                    proc.terminate()
                    proc.wait(timeout=10)
                    return {"output": f"Server {game_id} stopped."}
                return {"output": f"No running server for {game_id}."}

            # START or RESTART
            if cmd in ["start", "restart"]:
                # Stop existing process first
                if game_id in running_processes:
                    proc = running_processes.pop(game_id)
                    proc.terminate()
                    proc.wait(timeout=10)

                try:
                    if system_os == "windows":
                        proc = subprocess.Popen(
                            batch_path,
                            shell=True,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            text=True,
                            cwd=os.path.dirname(batch_path) or None
                        )
                    else:
                        proc = subprocess.Popen(
                            ["bash", batch_path],
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            text=True,
                            cwd=os.path.dirname(batch_path) or None
                        )

                    running_processes[game_id] = proc
                    stream_process(proc, game_id)
                    return {"output": f"Server {game_id} started with {batch_path}"}
                except Exception as e:
                    raise HTTPException(status_code=500, detail=str(e))

        # ARBITRARY COMMANDS
        if game_id not in running_processes:
            raise HTTPException(status_code=400, detail="No running server for this game.")

        proc = running_processes[game_id]
        try:
            if system_os == "windows":
                result = subprocess.run(
                    cmd,
                    shell=True,
                    capture_output=True,
                    text=True,
                    cwd=os.path.dirname(batch_path) if batch_path else None
                )
            else:
                result = subprocess.run(
                    cmd,
                    shell=True,
                    executable="/bin/bash",
                    capture_output=True,
                    text=True,
                    cwd=os.path.dirname(batch_path) if batch_path else None
                )
            return {"output": result.stdout.strip(), "error": result.stderr.strip()}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
