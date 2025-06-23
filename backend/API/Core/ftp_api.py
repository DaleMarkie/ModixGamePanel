from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import json
from pathlib import Path
from backend.API.Core.auth import require_permission
import subprocess
import logging

router = APIRouter(tags=["FTP/FileManager"])
logger = logging.getLogger("uvicorn.error")
logger.info("Native FastAPI logger is active. If you see this, logging is working.")

def get_modix_config():
    config_path = Path(__file__).parent.parent.parent / "modix_config" / "modix_config.json"
    with open(config_path) as f:
        return json.load(f)

def get_docker_inspect(container_id: str):
    try:
        result = subprocess.run([
            "docker", "inspect", container_id
        ], capture_output=True, text=True, check=True)
        return json.loads(result.stdout)[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Docker inspect failed: {e}")

def get_container_root_and_mounts(container_id: str):
    inspect = get_docker_inspect(container_id)
    merged_dir = None
    mounts = []
    # Robustly check for MergedDir
    graphdriver = inspect.get("GraphDriver")
    if graphdriver:
        data = graphdriver.get("Data")
        if data and isinstance(data, dict):
            merged_dir = data.get("MergedDir")
    if "Mounts" in inspect:
        mounts = [m["Source"] for m in inspect["Mounts"] if "Source" in m]
    return merged_dir, mounts

def get_root_paths(container_id: str):
    config = get_modix_config()
    enable_root_fs = config.get("MODIX_ENABLE_ROOT_FS", False)
    merged_dir, mounts = get_container_root_and_mounts(container_id)
    if enable_root_fs:
        if merged_dir:
            return [merged_dir]
        elif mounts:
            # Fallback to mounts if root is not available (container stopped)
            # Optionally, you could log or return a warning here
            return mounts
        else:
            raise HTTPException(status_code=500, detail="Container root (MergedDir) not found and no mounts available.")
    if not mounts:
        raise HTTPException(status_code=500, detail="No mounts found for container.")
    return mounts

def safe_join(base_or_bases, *paths: str) -> str:
    # Support single or multiple allowed roots
    if isinstance(base_or_bases, str):
        bases = [base_or_bases]
    else:
        bases = base_or_bases
    final_path = os.path.abspath(os.path.join(bases[0], *paths))
    for base in bases:
        if final_path.startswith(os.path.abspath(base)):
            return final_path
    raise HTTPException(status_code=403, detail="Path traversal detected.")

class FileWriteRequest(BaseModel):
    content: str

def is_path_in_mounts(container_path: str, mounts: list) -> bool:
    # Check if the container_path is within any mount destination
    for mount in mounts:
        dest = mount.get("Destination")
        if dest and os.path.abspath(container_path).startswith(os.path.abspath(dest)):
            return True
    return False

def get_container_name(container_id: str):
    inspect = get_docker_inspect(container_id)
    return inspect.get("Name", "").lstrip("/")

def is_container_running(container_id: str) -> bool:
    inspect = get_docker_inspect(container_id)
    return inspect.get("State", {}).get("Running", False)

def resolve_host_path(container_id: str, user_path: str, require_root_fs: bool, current_user):
    merged_dir, mounts = get_container_root_and_mounts(container_id)
    config = get_modix_config()
    enable_root_fs = config.get("MODIX_ENABLE_ROOT_FS", False)
    inspect = get_docker_inspect(container_id)
    # Find the main mount (first mount with a Destination)
    main_mount = None
    for mount in inspect.get("Mounts", []):
        dest = mount.get("Destination")
        src = mount.get("Source")
        if dest and src:
            main_mount = mount
            break
    if not main_mount:
        logger.info(f"[resolve_host_path] No valid mount found for container {container_id}")
        raise HTTPException(status_code=403, detail={
            "error": "No valid mount found for this container.",
            "permitted_mounts": [m.get("Destination") for m in inspect.get("Mounts", []) if m.get("Destination")],
            "root_fs": merged_dir if merged_dir else None
        })
    # User path is always relative to the mount root
    user_path = user_path.lstrip("/")
    host_path = os.path.join(main_mount.get("Source"), user_path)
    logger.info(f"[resolve_host_path] container_id={container_id}, user_path={user_path}, main_mount_dest={main_mount.get('Destination')}, main_mount_src={main_mount.get('Source')}, host_path={host_path}")
    return host_path

@router.api_route("/ftp/{container_id}/{path:path}", methods=["GET", "POST", "DELETE"], tags=["FTP/FileManager"])
def ftp_catch_all(
    container_id: str,
    path: str = "",
    request: Request = None,
    current_user=Depends(require_permission("container_filemanager_access"))
):
    method = request.method if request else "GET"
    abs_path = resolve_host_path(container_id, path, require_root_fs=True, current_user=current_user)
    if method == "GET":
        if not os.path.exists(abs_path):
            raise HTTPException(status_code=404, detail="Path not found")
        if os.path.isdir(abs_path):
            # List directory
            files = []
            for entry in os.scandir(abs_path):
                files.append({
                    "name": entry.name,
                    "is_dir": entry.is_dir(),
                    "size": entry.stat().st_size,
                })
            return {"files": files}
        elif os.path.isfile(abs_path):
            # Read file
            require_permission("container_file_read")(current_user)
            return FileResponse(abs_path)
        else:
            raise HTTPException(status_code=400, detail="Not a file or directory")
    elif method == "POST":
        require_permission("container_file_write")(current_user)
        req = None
        try:
            req = FileWriteRequest(**(request.json() if request else {}))
        except Exception:
            req = FileWriteRequest(content=(request.body().decode() if request else ""))
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        with open(abs_path, "w") as f:
            f.write(req.content)
        return {"status": "success"}
    elif method == "DELETE":
        require_permission("container_file_delete")(current_user)
        if not os.path.exists(abs_path):
            raise HTTPException(status_code=404, detail="File not found")
        if os.path.isdir(abs_path):
            os.rmdir(abs_path)
        else:
            os.remove(abs_path)
        return {"status": "deleted"}
    else:
        raise HTTPException(status_code=405, detail="Method not allowed")

# Remove old /list, /read, /write, /delete endpoints
