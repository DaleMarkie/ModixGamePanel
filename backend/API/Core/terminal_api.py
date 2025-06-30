from fastapi import APIRouter, WebSocket, Depends
import docker
import logging
from backend.API.Core.auth import require_permission, get_current_user_ws, get_db
import asyncio
import aiofiles
from pathlib import Path
import aiohttp
import json

router = APIRouter(tags=["Terminal"])

logger = logging.getLogger("terminal_api")

TERMINAL_LOGS_BASE = Path(__file__).parent.parent.parent / "server_files" / "server_instances"


def get_terminal_log_path(container_id: str) -> Path:
    # You may want to map container_id to servername/deploy_id if needed
    # For now, search for the instance folder containing this container_id
    for instance_dir in TERMINAL_LOGS_BASE.iterdir():
        logs_dir = instance_dir / "terminal_logs"
        if logs_dir.exists():
            log_file = logs_dir / f"{container_id}.log"
            return log_file
    # Default fallback (will create in first instance folder)
    fallback = next(TERMINAL_LOGS_BASE.iterdir()) / "terminal_logs" / f"{container_id}.log"
    return fallback


async def stream_container_logs(container, log_path, websocket):
    # Attach to the container's stdout/stderr and stream output
    # This uses Docker's attach API for real-time logs
    loop = asyncio.get_event_loop()
    logs = container.attach(stream=True, stdout=True, stderr=True, logs=True)
    try:
        async for line in _aiter_lines(logs, loop):
            decoded = line.decode(errors="replace")
            # Append to persistent log
            async with aiofiles.open(log_path, mode="a") as f:
                await f.write(decoded)
            # Send to client
            await websocket.send_json({"output": decoded})
    except Exception as e:
        print(f"[DEBUG] Log streaming error: {e}")


async def _aiter_lines(logs, loop):
    # Helper to make Docker's blocking generator async
    for line in logs:
        yield line
        await asyncio.sleep(0)  # Yield control to event loop


@router.websocket("/ws/terminal/{container_id}")
async def websocket_terminal(
    websocket: WebSocket,
    container_id: str,
    db=Depends(get_db),
):
    print(f"[DEBUG] ALL HEADERS (terminal): {websocket.headers}")
    try:
        current_user = get_current_user_ws(websocket, db)
        print(f"[DEBUG] Current user: {getattr(current_user, 'username', None)} (ID: {getattr(current_user, 'id', None)})")
        require_permission("container_terminal_access", container_id)(current_user=current_user, db=db)
    except Exception as e:
        print(f"[DEBUG] Auth or permission error: {e}")
        await websocket.accept()
        await websocket.send_json({"error": f"Authentication or permission denied: {str(e)}"})
        await websocket.close()
        return
    await websocket.accept()
    dockerClient = docker.from_env()
    try:
        container = dockerClient.containers.get(container_id)
    except docker.errors.NotFound:
        print(f"[DEBUG] Container not found: {container_id}")
        await websocket.send_json({"error": "Container not found"})
        await websocket.close()
        return
    # Attach to the main process (stdin/stdout/stderr)
    try:
        sock = container.attach_socket(params={"stdin": 1, "stdout": 1, "stderr": 1, "stream": 1, "logs": 1})
        sock._sock.setblocking(False)
    except Exception as e:
        await websocket.send_json({"error": f"Failed to attach to container: {e}"})
        await websocket.close()
        return
    async def read_from_docker():
        try:
            while True:
                data = await asyncio.get_event_loop().run_in_executor(None, sock.recv, 4096)
                if not data:
                    break
                await websocket.send_json({"output": data.decode(errors="replace")})
        except Exception as e:
            print(f"[DEBUG] Docker read error: {e}")
    async def write_to_docker():
        try:
            while True:
                msg = await websocket.receive_text()
                await asyncio.get_event_loop().run_in_executor(None, sock.send, msg.encode() + b"\n")
        except Exception as e:
            print(f"[DEBUG] WebSocket closed or error: {e}")
    await asyncio.gather(read_from_docker(), write_to_docker())
    await websocket.close()


@router.websocket("/ws/debug")
async def debug_ws(websocket: WebSocket):
    print(f"[DEBUG] ALL HEADERS (debug): {websocket.headers}")
    await websocket.accept()
    await websocket.send_text("Connected to debug endpoint.")
    await websocket.close()


@router.websocket("/ws/debug-auth")
async def debug_auth_ws(websocket: WebSocket):
    print(f"[DEBUG] ALL HEADERS (debug-auth): {websocket.headers}")
    await websocket.accept()
    await websocket.send_text("Headers received. Check server logs for details.")
    await websocket.close()
