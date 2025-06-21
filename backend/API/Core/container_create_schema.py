from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, Type
import docker
from sqlalchemy.orm import Session
from backend.API.Core.database import SessionLocal
from backend.API.Core.models import Container
import json
from pathlib import Path
from pydantic import create_model

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

def load_game_schema_models() -> Dict[str, Type[BaseModel]]:
    """
    Dynamically load all JSON schema files in game_server_game_schema and convert to Pydantic models.
    Returns a dict mapping schema name to Pydantic model class.
    """
    schema_dir = Path(__file__).parent.parent / "server_files" / "game_server_game_schema"
    models = {}
    for schema_file in schema_dir.glob("*.json"):
        with open(schema_file) as f:
            schema = json.load(f)
        fields = {}
        for field in schema.get("fields", []):
            field_type = field.get("type", "string")
            # Map JSON type to Python type
            if isinstance(field_type, list):
                # e.g. ["string", "null"]
                if "string" in field_type:
                    py_type = (str, type(None))
                elif "number" in field_type:
                    py_type = (float, type(None))
                elif "boolean" in field_type:
                    py_type = (bool, type(None))
                else:
                    py_type = (str, type(None))
            elif field_type == "string":
                py_type = str
            elif field_type == "number":
                py_type = float
            elif field_type == "integer":
                py_type = int
            elif field_type == "boolean":
                py_type = bool
            else:
                py_type = str
            default = field.get("default", ...)
            description = field.get("description", "")
            fields[field["key"]] = (py_type, Field(default, description=description))
        model_name = schema_file.stem + "Schema"
        models[model_name] = create_model(model_name, **fields)
    return models
