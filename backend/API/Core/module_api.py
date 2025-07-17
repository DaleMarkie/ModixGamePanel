
# --- Move these lines to the very top of the file ---
from fastapi import APIRouter, Depends, HTTPException
from backend.API.Core.auth import require_permission
import os
import yaml
from typing import List, Dict, Any

router = APIRouter(tags=["ModuleAPI"])


@router.get("/modules/available/core")
def get_available_core_modules():
    """
    Returns a list of all available core modules (those that could be enabled as CORE_MODULES).
    """
    modules = []
    for root, dirs, files in os.walk(MODULE_ROOT):
        if 'Game_modules' in root.split(os.sep):
            continue
        for file in files:
            if file == "module.yaml":
                manifest_path = os.path.join(root, file)
                with open(manifest_path, "r") as f:
                    manifest = yaml.safe_load(f)
                if manifest.get("type", "core").lower() == "core":
                    modules.append({
                        "name": manifest.get("name"),
                        "frontend": manifest.get("frontend", {}),
                        "path": root
                    })
    return {"modules": modules}

@router.get("/modules/available/optional")
def get_available_optional_modules():
    """
    Returns a list of all available optional modules (those that could be enabled as OPTIONAL_MODULES).
    """
    modules = []
    for root, dirs, files in os.walk(MODULE_ROOT):
        if 'Game_modules' in root.split(os.sep):
            continue
        for file in files:
            if file == "module.yaml":
                manifest_path = os.path.join(root, file)
                with open(manifest_path, "r") as f:
                    manifest = yaml.safe_load(f)
                if manifest.get("type", "core").lower() == "optional":
                    modules.append({
                        "name": manifest.get("name"),
                        "frontend": manifest.get("frontend", {}),
                        "path": root
                    })
    return {"modules": modules}

@router.get("/modules/available/game")
def get_available_game_modules():
    """
    Returns a list of all available game-based modules (those under Game_modules directory).
    """
    modules = []
    for root, dirs, files in os.walk(MODULE_ROOT):
        if 'Game_modules' not in root.split(os.sep):
            continue
        for file in files:
            if file == "module.yaml":
                manifest_path = os.path.join(root, file)
                with open(manifest_path, "r") as f:
                    manifest = yaml.safe_load(f)
                modules.append({
                    "name": manifest.get("name"),
                    "frontend": manifest.get("frontend", {}),
                    "path": root
                })
    return {"modules": modules}

@router.get("/modules/enabled/{instance_name}")
def get_enabled_modules_for_instance(instance_name: str):
    """
    Returns a list of enabled modules for a specific server instance, based on a config file at backend/server_files/server_instances/[instance_name]/config.json.
    The config file should have a 'Modules' array structured like modix_config.
    """
    config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..", f"server_files/server_instances/{instance_name}/config.json"))
    if not os.path.exists(config_path):
        raise HTTPException(status_code=404, detail=f"Config for instance '{instance_name}' not found.")
    try:
        with open(config_path, "r") as f:
            instance_config = yaml.safe_load(f) if config_path.endswith(('.yaml', '.yml')) else json.load(f)
        modules = instance_config.get("Modules", [])
        enabled_modules = set(modules)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading instance config: {e}")
    manifests = []
    for root, dirs, files in os.walk(MODULE_ROOT):
        if 'Game_modules' in root.split(os.sep):
            continue
        for file in files:
            if file == "module.yaml":
                manifest_path = os.path.join(root, file)
                with open(manifest_path, "r") as f:
                    manifest = yaml.safe_load(f)
                if manifest.get("name") in enabled_modules:
                    frontend = manifest.get("frontend", {})
                    manifests.append({
                        "name": manifest.get("name"),
                        "frontend": frontend,
                        "path": root
                    })
    return {"modules": manifests}

MODULE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..", "module_system"))

@router.get("/modules/enabled")
def get_enabled_modules():
    """
    Returns a list of enabled modules and their frontend entry points (if available).
    """
    import json
    # Set config_path to backend/modix_config/modix_config.json
    config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../modix_config/modix_config.json"))
    if not os.path.exists(config_path):
        raise HTTPException(status_code=500, detail="Could not find modix_config.json at " + config_path)
    try:
        with open(config_path, "r") as f:
            config = json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading modix_config.json: {e}")
    enabled_modules = set(config.get("CORE_MODULES", []) + config.get("OPTIONAL_MODULES", []))
    manifests = []
    for root, dirs, files in os.walk(MODULE_ROOT):
        if 'Game_modules' in root.split(os.sep):
            continue
        # Only include modules that are enabled in config
        # and are not under folders with '!' in any of their last two parent folders
        path_parts = root.split(os.sep)
        if len(path_parts) >= 3 and ('!' in path_parts[-1] or '!' in path_parts[-2]):
            continue
        for file in files:
            if file == "module.yaml":
                manifest_path = os.path.join(root, file)
                with open(manifest_path, "r") as f:
                    manifest = yaml.safe_load(f)
                name = manifest.get("name")
                # Only include if enabled in config and name does not start with '!'
                if name and not name.startswith('!') and name in enabled_modules:
                    frontend = manifest.get("frontend", {})
                    # Calculate path relative to project root
                    rel_path = os.path.relpath(root, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))
                    manifests.append({
                        "name": name,
                        "frontend": frontend,
                        "path": rel_path
                    })
    return {"modules": manifests}
