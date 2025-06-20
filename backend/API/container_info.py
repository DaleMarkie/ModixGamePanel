from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
import docker

app = FastAPI()
router = APIRouter()

@router.get("/container-info")
def container_info(container_id: str = Query(..., description="Docker container ID")):
    dockerClient = docker.from_env()
    try:
        container = dockerClient.containers.get(container_id)
        return {
            "id": container.id,
            "name": container.name,
            "status": container.status,
            "image": str(container.image),
            "created": container.attrs.get("Created"),
            "state": container.attrs.get("State"),
            "ports": container.attrs.get("NetworkSettings", {}).get("Ports"),
            "labels": container.labels,
            "mounts": container.attrs.get("Mounts"),
            "env": container.attrs.get("Config", {}).get("Env"),
        }
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Container not found")

app.include_router(router, prefix="/api")
