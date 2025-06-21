from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from backend.API.auth import require_permission
from backend.API.models import Container
from sqlalchemy.orm import Session
from backend.API.database import SessionLocal
import docker
import asyncio
import json
import logging
from typing import List, Dict
import threading

router = APIRouter(tags=["Terminal"])

# Setup logger for terminal sessions
logger = logging.getLogger("terminal_api")
logging.basicConfig(level=logging.INFO)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- WebSocket Terminal Session ---
@router.websocket("/ws/terminal/{container_id}")
async def websocket_terminal(
    websocket: WebSocket,
    container_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("container_terminal_access"))
):
    await websocket.accept()
    logger.info(f"Terminal session started for container {container_id} by user {getattr(current_user, 'username', None)}")
    dockerClient = docker.from_env()
    try:
        container = dockerClient.containers.get(container_id)
    except docker.errors.NotFound:
        await websocket.send_json({"error": "Container not found"})
        await websocket.close()
        return
    # Check if container is running
    if container.status != "running":
        await websocket.send_json({"error": "Container is not running. Start the container before opening a terminal session."})
        await websocket.close()
        return
    # Start an interactive shell session
    exec_id = dockerClient.api.exec_create(
        container.id,
        cmd=["/bin/sh"],
        tty=True,
        stdin=True,
        stdout=True,
        stderr=True
    )["Id"]
    sock = dockerClient.api.exec_start(exec_id, tty=True, detach=False, stream=True, socket=True)
    async def read_from_docker():
        try:
            while True:
                data = await asyncio.get_event_loop().run_in_executor(None, sock.recv, 4096)
                if not data:
                    break
                await websocket.send_bytes(data)
        except Exception:
            pass
    async def read_from_websocket():
        try:
            while True:
                msg = await websocket.receive_text()
                sock.send(msg.encode())
        except WebSocketDisconnect:
            pass
    await asyncio.gather(read_from_docker(), read_from_websocket())
    sock.close()
    logger.info(f"Terminal session closed for container {container_id} by user {getattr(current_user, 'username', None)}")

# --- Run Command in Container ---
@router.post("/terminal/{container_id}/exec", dependencies=[Depends(require_permission("container_terminal_exec"))])
def exec_command(container_id: str, command: str = Query(...), db: Session = Depends(get_db)):
    dockerClient = docker.from_env()
    try:
        container = dockerClient.containers.get(container_id)
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Container not found")
    # Check if container is running
    if container.status != "running":
        raise HTTPException(status_code=409, detail="Container is not running. Start the container before executing commands.")
    # TODO: Check whitelist/blacklist here
    logger.info(f"Running command in container {container_id}: {command}")
    exec_result = container.exec_run(command, stdout=True, stderr=True, stdin=False, tty=False)
    logger.info(f"Command result in container {container_id}: exit_code={exec_result.exit_code}, output={exec_result.output.decode()}")
    return {"exit_code": exec_result.exit_code, "output": exec_result.output.decode()}

# --- Stream Container Logs ---
@router.websocket("/ws/terminal/{container_id}/logs")
async def websocket_logs(
    websocket: WebSocket,
    container_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("container_terminal_access"))
):
    await websocket.accept()
    logger.info(f"Log stream session started for container {container_id} by user {getattr(current_user, 'username', None)}")
    dockerClient = docker.from_env()
    try:
        container = dockerClient.containers.get(container_id)
    except docker.errors.NotFound:
        await websocket.send_json({"error": "Container not found"})
        await websocket.close()
        return
    try:
        for log in container.logs(stream=True, follow=True):
            await websocket.send_text(log.decode())
    except Exception:
        pass
    await websocket.close()
    logger.info(f"Log stream session closed for container {container_id} by user {getattr(current_user, 'username', None)}")

# --- List Active Sessions (stub, for future) ---
# List Docker containers that the user can access terminals for
@router.get("/terminal/containers", dependencies=[Depends(require_permission("container_terminal_access"))])
def list_accessible_containers(db: Session = Depends(get_db), current_user=Depends(require_permission("container_terminal_access"))):
    dockerClient = docker.from_env()
    containers = dockerClient.containers.list(all=True)
    # Optionally, filter containers based on user permissions or DB records
    result = []
    for c in containers:
        result.append({
            "id": c.id,
            "name": c.name,
            "status": c.status,
            "image": c.image.tags,
        })
    return {"containers": result}

# --- Close Session (stub, for future) ---
@router.post("/terminal/{session_id}/close", dependencies=[Depends(require_permission("modix_manage_permissions"))])
def close_session(session_id: str):
    # This would require session tracking and management
    return {"status": "not_implemented"}

# --- Audit Logging (stub, for future) ---
def audit_log_terminal_action(user, action, container_id=None, command=None, status=None):
    # This is a simple stub. In production, log to DB or file with timestamp, user, action, etc.
    print(f"[AUDIT] user={getattr(user, 'username', None)} action={action} container_id={container_id} command={command} status={status}")

# --- Debug: List Running Processes in Container ---
@router.get("/terminal/{container_id}/processes", dependencies=[Depends(require_permission("container_terminal_exec"))])
def list_processes(container_id: str, db: Session = Depends(get_db)):
    dockerClient = docker.from_env()
    try:
        container = dockerClient.containers.get(container_id)
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Container not found")
    if container.status != "running":
        raise HTTPException(status_code=409, detail="Container is not running. Start the container before listing processes.")
    # Try common commands to list processes
    for cmd in ["ps aux", "ps -ef", "top -b -n 1"]:
        exec_result = container.exec_run(cmd, stdout=True, stderr=True, stdin=False, tty=False)
        output = exec_result.output.decode()
        if exec_result.exit_code == 0 and output.strip():
            logger.info(f"Listed processes in container {container_id} using '{cmd}'")
            return {"command": cmd, "output": output}
    logger.warning(f"Could not list processes in container {container_id}")
    return {"error": "Could not list processes. No supported command found."}

# Example usage: call audit_log_terminal_action() in your endpoints where needed.
# To use, include this router in your main FastAPI app:
# from backend.API.terminal_api import router as terminal_router
# app.include_router(terminal_router, prefix="/api")
