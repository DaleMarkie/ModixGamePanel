# module_system/Core/FileBrowser/backend/ftp_api.py
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import logging
from backend.API.Core.auth import require_permission

router = APIRouter(tags=["FTP/FileManager"])
logger = logging.getLogger("uvicorn.error")
logger.info("Local FileBrowser API ready.")

# Allowed roots for browsing (adjust as needed)
ALLOWED_ROOTS = [os.path.expanduser("~"), "/data"]

class FileWriteRequest(BaseModel):
    content: str

def safe_join(base_or_bases, *paths: str) -> str:
    """Prevent path traversal outside allowed roots."""
    if isinstance(base_or_bases, str):
        bases = [base_or_bases]
    else:
        bases = base_or_bases
    final_path = os.path.abspath(os.path.join(bases[0], *paths))
    for base in bases:
        if final_path.startswith(os.path.abspath(base)):
            return final_path
    raise HTTPException(status_code=403, detail="Path traversal detected")

@router.api_route(
    "/{root_name}/{path:path}",
    methods=["GET", "POST", "DELETE"]
)
async def ftp_catch_all(
    root_name: str,
    path: str = "",
    request: Request = None,
    current_user=Depends(require_permission("container_filemanager_access"))
):
    method = request.method if request else "GET"

    # Resolve root
    root_paths = {os.path.basename(r.rstrip("/")): r for r in ALLOWED_ROOTS}
    if root_name not in root_paths:
        raise HTTPException(status_code=404, detail=f"Root '{root_name}' not found.")
    root_path = root_paths[root_name]

    # Compute absolute path safely
    abs_path = safe_join(root_path, path)

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
            raise HTTPException(status_code=404, detail="Path not found")

    elif method == "POST":
        require_permission("container_file_write")(current_user)
        try:
            req = FileWriteRequest(**(await request.json() if request else {}))
            content = req.content
        except Exception:
            content = (await request.body()).decode() if request else ""
        if not content:
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
        logger.info(f"[DELETE] Removed {abs_path}")
        return {"status": "deleted"}

    else:
        raise HTTPException(status_code=405, detail="Method not allowed")

@router.get("/roots")
def list_roots(current_user=Depends(require_permission("container_filemanager_access"))):
    """List allowed root directories"""
    return {"roots": [{"name": os.path.basename(r.rstrip("/")), "path": r} for r in ALLOWED_ROOTS]}
