from fastapi import APIRouter, Depends, HTTPException, Query
from backend.API.Core.auth import require_permission
from sqlalchemy.orm import Session
from backend.API.Core.database import SessionLocal
import docker
import logging
import json
import os
import sys
from backend.container_create import create_container
from pydantic import BaseModel
from typing import Dict, Any, Optional

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
