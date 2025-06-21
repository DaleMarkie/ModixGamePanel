from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import docker
from sqlalchemy.orm import Session
from backend.API.database import SessionLocal
from backend.API.models import Container

class ContainerCreateConfig(BaseModel):
    BaseSettings: Dict[str, Any]
    ServerSettings: Dict[str, Any]
    # Add more fields as needed based on your merged schema

def create_container_from_config(client: docker.DockerClient, config: dict, template_path: Optional[str] = None):
    base = config.get("BaseSettings", {})
    image = base.get("DOCKER_IMAGE", "steamcmd/steamcmd")
    steam_id = base.get("GAME_STEAM_ID")
    use_named_volume = base.get("DOCKER_VOLUME_NAME", f"modix_{base.get('name', 'server').replace(' ', '_').lower()}_data")
    volume_path = base.get("DOCKER_VOLUME_PATH", "/home/steam/pzserver")
    steamappdir = volume_path
    bind_mount_path = base.get("BIND_MOUNT_PATH")
    server_name = config["ServerSettings"].get("name", base.get('name', 'server'))
    if steam_id:
        container_name = f"modix_{steam_id}_{server_name.replace(' ', '_').lower()}"
    else:
        container_name = f"modix_{server_name.replace(' ', '_').lower()}"
    deploy_id = server_name.replace(' ', '_').lower()
    # ...existing logic from your original create_container_from_config...
    # This is a stub. You can copy the full logic from your original function here.
    return deploy_id, container_name
