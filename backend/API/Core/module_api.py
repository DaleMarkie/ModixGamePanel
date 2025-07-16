
# --- Move these lines to the very top of the file ---
from fastapi import APIRouter, Depends, HTTPException
from backend.API.Core.auth import require_permission
import os
import yaml
from typing import List, Dict, Any

router = APIRouter(tags=["ModuleAPI"])


@router.get("/modules/available/core", dependencies=[Depends(require_permission("modix_dashboard_access"))])
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

@router.get("/modules/available/optional", dependencies=[Depends(require_permission("modix_dashboard_access"))])
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

@router.get("/modules/available/game", dependencies=[Depends(require_permission("modix_dashboard_access"))])
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

@router.get("/modules/enabled/{instance_name}", dependencies=[Depends(require_permission("modix_dashboard_access"))])
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

@router.get("/modules/enabled", dependencies=[Depends(require_permission("modix_dashboard_access"))])
def get_enabled_modules():
    """
    Returns a list of enabled modules and their frontend entry points (if available).
    """
    from backend.modix_config.modix_config import load_modix_config
    config = load_modix_config()
    if not config:
        raise HTTPException(status_code=500, detail="Could not load modix_config.json")
    enabled_modules = set(config.get("CORE_MODULES", []) + config.get("OPTIONAL_MODULES", []))
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
