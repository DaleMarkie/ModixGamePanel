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
    mounts = []
    if "Mounts" in inspect:
        mounts = [m["Source"] for m in inspect["Mounts"] if "Source" in m]
    return mounts

def get_root_paths(container_id: str):
    mounts = get_container_root_and_mounts(container_id)
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
    mounts = get_container_root_and_mounts(container_id)
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
        })
    # User path is always relative to the mount root
    user_path = user_path.lstrip("/")
    host_path = os.path.join(main_mount.get("Source"), user_path)
    logger.info(f"[resolve_host_path] container_id={container_id}, user_path={user_path}, main_mount_dest={main_mount.get('Destination')}, main_mount_src={main_mount.get('Source')}, host_path={host_path}")
    return host_path

def get_container_mounts_dict(container_id: str):
    inspect = get_docker_inspect(container_id)
    mounts = {}
    if "Mounts" in inspect:
        for m in inspect["Mounts"]:
            if "Source" in m and "Destination" in m:
                parts = m["Source"].split(os.sep)
                mount_name = None
                if "volumes" in parts:
                    idx = parts.index("volumes")
                    if len(parts) > idx + 2 and parts[idx+2] == "_data":
                        mount_name = parts[idx+1]
                if not mount_name:
                    mount_name = os.path.basename(m["Source"])
                mounts[mount_name] = m["Source"]
    return mounts

def resolve_host_path_by_mount(container_id: str, mount_name: str, user_path: str):
    mounts = get_container_mounts_dict(container_id)
    if mount_name not in mounts:
        logger.info(f"[resolve_host_path_by_mount] Invalid mount name '{mount_name}' for container {container_id}. Available: {list(mounts.keys())}")
        raise HTTPException(status_code=404, detail=f"Mount '{mount_name}' not found for this container.")
    base = mounts[mount_name]
    user_path = user_path.lstrip("/")
    abs_path = os.path.abspath(os.path.join(base, user_path))
    if not abs_path.startswith(os.path.abspath(base)):
        raise HTTPException(status_code=403, detail="Path traversal detected.")
    logger.info(f"[resolve_host_path_by_mount] container_id={container_id}, mount_name={mount_name}, user_path={user_path}, abs_path={abs_path}")
    return abs_path

@router.api_route("/ftp/{container_id}/{mount_name}/{path:path}", methods=["GET", "POST", "DELETE"], tags=["FTP/FileManager"])
async def ftp_catch_all(
    container_id: str,
    mount_name: str,
    path: str = "",
    request: Request = None,
    current_user=Depends(require_permission("container_filemanager_access"))
):
    method = request.method if request else "GET"
    abs_path = resolve_host_path_by_mount(container_id, mount_name, path)
    if method == "POST":
        parent_dir = os.path.dirname(abs_path)
        if not os.path.exists(parent_dir):
            raise HTTPException(status_code=404, detail="Parent directory does not exist. The volume may not be initialized. Try starting the container at least once.")
    elif not os.path.exists(abs_path):
        if path.strip() == "":
            raise HTTPException(status_code=404, detail="Root directory for this mount does not exist. The volume may not be initialized. Try starting the container at least once.")
        else:
            raise HTTPException(status_code=404, detail="Path not found")
    if method == "GET":
        if os.path.isdir(abs_path):
            files = []
            for entry in os.scandir(abs_path):
                files.append({
                    "name": entry.name,
                    "is_dir": entry.is_dir(),
                    "size": entry.stat().st_size,
                })
            return {"files": files}
        elif os.path.isfile(abs_path):
            require_permission("container_file_read")(current_user)
            return FileResponse(abs_path)
        else:
            raise HTTPException(status_code=400, detail="Not a file or directory")
    elif method == "POST":
        require_permission("container_file_write")(current_user)
        req = None
        content = None
        try:
            req = FileWriteRequest(**(await request.json() if request else {}))
            content = req.content
            logger.info(f"[POST] Received JSON content for {abs_path}")
        except Exception as e:
            logger.warning(f"[POST] Failed to parse JSON: {e}. Trying raw body.")
            try:
                content = (await request.body()).decode() if request else ""
                logger.info(f"[POST] Received raw body for {abs_path}")
            except Exception as e2:
                logger.error(f"[POST] Failed to parse body: {e2}")
                raise HTTPException(status_code=400, detail="Invalid request body")
        if not content:
            logger.error(f"[POST] No content provided for file write to {abs_path}")
            raise HTTPException(status_code=400, detail="No content provided")
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        with open(abs_path, "w") as f:
            f.write(content)
        logger.info(f"[POST] Wrote file {abs_path}")
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

@router.get("/ftp/{container_id}/mounts", tags=["FTP/FileManager"])
def list_mounts(container_id: str, current_user=Depends(require_permission("container_filemanager_access"))):
    mounts = get_container_mounts_dict(container_id)
    # Return a list of mount names and their source paths
    return {"mounts": [{"name": name, "source": path} for name, path in mounts.items()]}
