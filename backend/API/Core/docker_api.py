from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from backend.API.Core.auth import require_permission
from sqlalchemy.orm import Session
from backend.API.Core.database import SessionLocal
import docker
import logging

router = APIRouter(tags=["DockerAPI"])

logger = logging.getLogger("docker_api")
logging.basicConfig(level=logging.INFO)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Container Statistics API ---
@router.get("/docker/{container_id}/stats", dependencies=[Depends(require_permission("container_metrics_view"))])
def get_container_stats(container_id: str, db: Session = Depends(get_db)):
    dockerClient = docker.from_env()
    try:
        container = dockerClient.containers.get(container_id)
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Container not found")
    stats = container.stats(stream=False)
    cpu_stats = stats.get("cpu_stats", {})
    mem_stats = stats.get("memory_stats", {})
    blkio_stats = stats.get("blkio_stats", {})
    net_stats = stats.get("networks", {})
    temp = None
    try:
        exec_result = container.exec_run("cat /sys/class/thermal/thermal_zone0/temp", stdout=True, stderr=True, stdin=False, tty=False)
        if exec_result.exit_code == 0:
            temp = int(exec_result.output.decode().strip()) / 1000.0
    except Exception:
        pass
    return {
        "cpu": cpu_stats,
        "memory": mem_stats,
        "blkio": blkio_stats,
        "network": net_stats,
        "temperature_c": temp,
        "raw": stats
    }

# --- Container Inspect API ---
@router.get("/docker/{container_id}/inspect", dependencies=[Depends(require_permission("container_metrics_view"))])
def inspect_container(container_id: str, db: Session = Depends(get_db)):
    dockerClient = docker.from_env()
    try:
        container = dockerClient.containers.get(container_id)
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Container not found")
    return container.attrs

# --- Container Top (Processes) API ---
@router.get("/docker/{container_id}/top", dependencies=[Depends(require_permission("container_metrics_view"))])
def container_top(container_id: str, db: Session = Depends(get_db)):
    dockerClient = docker.from_env()
    try:
        container = dockerClient.containers.get(container_id)
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Container not found")
    try:
        top = container.top()
        return top
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting top: {e}")

# --- Debug: List Running Processes in Container ---
@router.get("/docker/{container_id}/processes", dependencies=[Depends(require_permission("container_terminal_exec"))])
def list_processes(container_id: str, db: Session = Depends(get_db)):
    dockerClient = docker.from_env()
    try:
        container = dockerClient.containers.get(container_id)
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Container not found")
    if container.status != "running":
        raise HTTPException(status_code=409, detail="Container is not running. Start the container before listing processes.")
    for cmd in ["ps aux", "ps -ef", "top -b -n 1"]:
        exec_result = container.exec_run(cmd, stdout=True, stderr=True, stdin=False, tty=False)
        output = exec_result.output.decode()
        if exec_result.exit_code == 0 and output.strip():
            logger.info(f"Listed processes in container {container_id} using '{cmd}'")
            return {"command": cmd, "output": output}
    logger.warning(f"Could not list processes in container {container_id}")
    return {"error": "Could not list processes. No supported command found."}
