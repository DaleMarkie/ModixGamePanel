from fastapi import APIRouter, Depends, HTTPException, Query
from backend.API.Core.auth import require_permission
from sqlalchemy.orm import Session
from backend.API.Core.database import SessionLocal
import docker
import logging
import json
import os
import sys
from backend.API.Linux_runners.container_create import create_container
from pydantic import BaseModel
from typing import Dict, Any, Optional
from pathlib import Path

router = APIRouter(tags=["ContainerManager"])

logger = logging.getLogger("container_manager_api")
logging.basicConfig(level=logging.INFO)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ContainerCreateConfig(BaseModel):
    BaseSettings: Dict[str, Any]
    ServerSettings: Dict[str, Any]
    # Add more fields as needed based on your merged schema

# --- Create Container ---
@router.post("/containers/create", dependencies=[Depends(require_permission("modix_server_create"))])
def create_container(config: ContainerCreateConfig, template_path: str = Query(None), db: Session = Depends(get_db)):
    dockerClient = docker.from_env()
    try:
        deploy_id, container_name = create_container(dockerClient, config.dict(), template_path)
        if not container_name:
            raise HTTPException(status_code=500, detail="Failed to create container.")
        logger.info(f"Created container {container_name} (Deploy ID: {deploy_id})")
        return {"deploy_id": deploy_id, "container_name": container_name}
    except Exception as e:
        logger.error(f"Error creating container: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating container: {e}")

# --- Edit (Update) Container ---
@router.post("/containers/{container_id}/edit", dependencies=[Depends(require_permission("modix_server_edit"))])
def edit_container(container_id: str, config: ContainerCreateConfig, template_path: str = Query(None), db: Session = Depends(get_db)):
    dockerClient = docker.from_env()
    try:
        # Remove the old container
        try:
            container = dockerClient.containers.get(container_id)
            container.remove(force=True)
            logger.info(f"Removed old container {container_id} for update")
        except docker.errors.NotFound:
            logger.warning(f"Container {container_id} not found, proceeding to create new one.")
        # Create a new container with the updated config
        deploy_id, container_name = create_container(dockerClient, config.dict(), template_path)
        if not container_name:
            raise HTTPException(status_code=500, detail="Failed to update container.")
        logger.info(f"Updated container {container_name} (Deploy ID: {deploy_id})")
        return {"deploy_id": deploy_id, "container_name": container_name}
    except Exception as e:
        logger.error(f"Error updating container: {e}")
        raise HTTPException(status_code=500, detail=f"Error updating container: {e}")

# --- Delete Container ---
@router.delete("/containers/{container_id}", dependencies=[Depends(require_permission("modix_server_delete"))])
def delete_container(container_id: str, db: Session = Depends(get_db)):
    dockerClient = docker.from_env()
    try:
        container = dockerClient.containers.get(container_id)
        container.remove(force=True)
        logger.info(f"Deleted container {container_id}")
        return {"status": "deleted", "id": container_id}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Container not found")
    except Exception as e:
        logger.error(f"Error deleting container: {e}")
        raise HTTPException(status_code=500, detail=f"Error deleting container: {e}")

SCHEMA_INDEX_PATH = Path(__file__).parent.parent.parent / "server_files" / "game_server_game_schema" / "schemas_index.json"
SCHEMA_DIR = Path(__file__).parent.parent.parent / "server_files" / "game_server_game_schema"

# --- List Docker Containers API ---
@router.get("/docker/containers", dependencies=[Depends(require_permission("modix_get_containers"))])
def list_accessible_containers(db: Session = Depends(get_db), current_user=Depends(require_permission("modix_get_containers"))):
    #print("[DEBUG] /docker/containers endpoint called")
    dockerClient = docker.from_env()
    containers = dockerClient.containers.list(all=True)
    result = []
    for c in containers:
        result.append({
            "id": c.id,
            "name": c.name,
            "status": c.status,
            "image": c.image.tags,
        })
    return {"containers": result}

@router.get("/schemas", dependencies=[Depends(require_permission("modix_schemas"))])
def list_schemas():
    """List all available game/server schemas."""
    try:
        logger.info(f"Resolved SCHEMA_INDEX_PATH: {SCHEMA_INDEX_PATH}")
        if not SCHEMA_INDEX_PATH.exists():
            logger.error(f"Schema index file does not exist at: {SCHEMA_INDEX_PATH}")
            raise HTTPException(status_code=404, detail=f"Schema index file not found at: {SCHEMA_INDEX_PATH}")
        with open(SCHEMA_INDEX_PATH, "r", encoding="utf-8") as f:
            index = json.load(f)
        # Validate that each entry has required fields
        for entry in index:
            if "id" not in entry or "file" not in entry:
                logger.error(f"Malformed schema index entry: {entry}")
                raise HTTPException(status_code=500, detail="Malformed schema index entry.")
        logger.info(f"Loaded {len(index)} schemas from index.")
        return index
    except Exception as e:
        logger.error(f"Exception in list_schemas: {e}")
        raise HTTPException(status_code=500, detail=f"Could not load schema index: {e}")

@router.get("/schemas/{schema_id}", dependencies=[Depends(require_permission("modix_schemas"))])
def get_schema(schema_id: str):
    """Get the full JSON schema for a given schema_id."""
    try:
        with open(SCHEMA_INDEX_PATH, "r", encoding="utf-8") as f:
            index = json.load(f)
        entry = next((s for s in index if s["id"] == schema_id), None)
        if not entry:
            raise HTTPException(status_code=404, detail="Schema not found")
        schema_file = SCHEMA_DIR / entry["file"]
        if not schema_file.exists():
            raise HTTPException(status_code=404, detail="Schema file not found")
        with open(schema_file, "r", encoding="utf-8") as sf:
            schema = json.load(sf)
        return schema
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not load schema: {e}")
