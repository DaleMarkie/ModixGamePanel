from backend.API.Core import container_io_service
from fastapi import APIRouter, WebSocket, Depends
import asyncio
import logging
from backend.API.Core.auth import get_db

router = APIRouter(tags=["Terminal"])
logger = logging.getLogger("terminal_api")

@router.websocket("/ws/terminal/{container_id}")
async def websocket_terminal(
    websocket: WebSocket,
    container_id: str,
    db=Depends(get_db),
):
    """
    WebSocket endpoint for live terminal access to a Docker container's main process.
    - Sends the last 100 lines of logs on connect.
    - Relays input/output between the client and the container process.
    - Ensures robust cleanup and error handling.
    """
    print(f"[DEBUG] ALL HEADERS (terminal): {websocket.headers}")
    await websocket.accept()
    sock = None
    try:
        # Fetch and send previous logs
        try:
            logs = await container_io_service.get_container_logs(container_id, tail=100)
            for line in logs:
                try:
                    await websocket.send_json({"output": line.decode(errors='replace')})
                except Exception as e:
                    print(f"[DEBUG] Failed to send previous log line: {e} | line: {line}")
        except Exception as e:
            print(f"[DEBUG] Failed to fetch/send previous logs: {e}")

        # Attach to the main process's stdin/stdout/stderr
        sock = await container_io_service.attach_container_socket(container_id)
    except Exception as e:
        await websocket.send_json({"error": f"Failed to attach to container: {e}"})
        await websocket.close()
        return

    try:
        # Start relays for container output and input
        await asyncio.gather(
            container_io_service.relay_container_output(sock, websocket),
            container_io_service.relay_container_input(sock, websocket)
        )
    except asyncio.CancelledError:
        print("[DEBUG] WebSocket handler cancelled (client disconnect or shutdown).")
    finally:
        # Ensure all resources are cleaned up
        try:
            if sock:
                sock.close()
                print("[DEBUG] Docker socket closed.")
        except Exception as e:
            print(f"[DEBUG] Exception closing Docker socket: {e}")
        try:
            if not websocket.client_state.name == "DISCONNECTED":
                await websocket.close()
                print("[DEBUG] WebSocket closed.")
        except Exception as e:
            print(f"[DEBUG] Exception closing WebSocket: {e}")
