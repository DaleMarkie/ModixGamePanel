from fastapi import APIRouter, WebSocket, Depends
import docker
import logging
from backend.API.Core.auth import require_permission, get_current_user_ws, get_db

router = APIRouter(tags=["Terminal"])

logger = logging.getLogger("terminal_api")


@router.websocket("/ws/terminal/{container_id}")
async def websocket_terminal(
    websocket: WebSocket,
    container_id: str,
    db=Depends(get_db),
):
    print(f"[DEBUG] ALL HEADERS (terminal): {websocket.headers}")
    # Authenticate user
    try:
        current_user = get_current_user_ws(websocket, db)
        print(f"[DEBUG] Current user: {getattr(current_user, 'username', None)} (ID: {getattr(current_user, 'id', None)})")
        # Permission check for root or normal users
        require_permission("container_terminal_access", container_id)(current_user=current_user, db=db)
    except Exception as e:
        print(f"[DEBUG] Auth or permission error: {e}")
        await websocket.accept()
        await websocket.send_json({"error": f"Authentication or permission denied: {str(e)}"})
        await websocket.close()
        return
    await websocket.accept()
    # logger.info(f"[TEST] WebSocket opened for container {container_id} by user {getattr(current_user, 'username', None)}")
    dockerClient = docker.from_env()
    try:
        container = dockerClient.containers.get(container_id)
    except docker.errors.NotFound:
        print(f"[DEBUG] Container not found: {container_id}")
        await websocket.send_json({"error": "Container not found"})
        await websocket.close()
        return
    if container.status != "running":
        print(f"[DEBUG] Container not running: {container_id} (status: {container.status})")
        await websocket.send_json(
            {"error": "Container is not running. Start the container before opening a terminal session."}
        )
        await websocket.close()
        return
    print(f"[DEBUG] WebSocket connection established to container: {container_id}")
    await websocket.send_json({"status": "WebSocket connection established to container."})
    await websocket.close()
    # logger.info(f"[TEST] WebSocket closed for container {container_id} by user {getattr(current_user, 'username', None)}")


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
