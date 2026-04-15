import asyncio
import os
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Body
from fastapi.responses import JSONResponse
from typing import Dict

router = APIRouter()

# Store running processes per game
running_processes: Dict[str, asyncio.subprocess.Process] = {}


# ---------------------------
# EXECUTE COMMAND
# ---------------------------
@router.post("/api/terminal/execute")
async def execute_command(data: dict = Body(...)):
    game_id = data.get("gameId")
    command = data.get("command", "").lower()
    batch_path = data.get("batchPath")

    if not game_id:
        return JSONResponse({"error": "Missing gameId"}, status_code=400)

    try:
        # ---------------------------
        # START
        # ---------------------------
        if command == "start":
            if not batch_path or not os.path.exists(batch_path):
                return {"error": f"Invalid script path: {batch_path}"}

            if game_id in running_processes:
                return {"error": "Server already running"}

            process = await asyncio.create_subprocess_exec(
                "bash",
                batch_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT
            )

            running_processes[game_id] = process

            return {"output": f"Started server using: {batch_path}"}

        # ---------------------------
        # STOP
        # ---------------------------
        elif command == "stop":
            process = running_processes.get(game_id)

            if not process:
                return {"error": "Server not running"}

            process.terminate()
            await process.wait()

            del running_processes[game_id]

            return {"output": "Server stopped"}

        # ---------------------------
        # RESTART
        # ---------------------------
        elif command == "restart":
            process = running_processes.get(game_id)

            if process:
                process.terminate()
                await process.wait()
                del running_processes[game_id]

            if not batch_path or not os.path.exists(batch_path):
                return {"error": "Invalid script path"}

            process = await asyncio.create_subprocess_exec(
                "bash",
                batch_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT
            )

            running_processes[game_id] = process

            return {"output": "Server restarted"}

        # ---------------------------
        # STATUS
        # ---------------------------
        elif command == "status":
            return {
                "output": "RUNNING" if game_id in running_processes else "STOPPED"
            }

        # ---------------------------
        # SAFE COMMANDS (optional)
        # ---------------------------
        allowed_commands = ["save", "backup"]

        if command in allowed_commands:
            proc = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT
            )

            stdout, _ = await proc.communicate()

            return {"output": stdout.decode()}

        return {"error": f"Command not allowed: {command}"}

    except Exception as e:
        return {"error": str(e)}


# ---------------------------
# WEBSOCKET (LIVE LOGS)
# ---------------------------
@router.websocket("/api/terminal/ws/{game_id}")
async def websocket_logs(websocket: WebSocket, game_id: str):
    await websocket.accept()

    try:
        while True:
            process = running_processes.get(game_id)

            if not process or not process.stdout:
                await asyncio.sleep(1)
                continue

            line = await process.stdout.readline()

            if not line:
                await asyncio.sleep(0.1)
                continue

            await websocket.send_json({
                "type": "output",
                "text": line.decode(errors="ignore").strip()
            })

    except WebSocketDisconnect:
        print(f"WebSocket disconnected: {game_id}")