from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.API.Core.auth import require_permission
from backend.API.Core.models import Container
from backend.API.Core.database import SessionLocal
import os
import json
from pathlib import Path

router = APIRouter(tags=["FTP/FileManager"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_modix_config():
    config_path = Path(__file__).parent.parent.parent / "modix_config" / "modix_config.json"
    with open(config_path) as f:
        return json.load(f)

def get_container_mount_path(container: Container):
    # This should be replaced with actual logic to get the mount path for the container
    # For now, assume /home/container/<container.name> as the mount point
    return f"/home/container/{container.name}"

def get_root_path(container: Container):
    config = get_modix_config()
    enable_root_fs = config.get("MODIX_ENABLE_ROOT_FS", False)
    if enable_root_fs:
        return "/"  # Full root of the container
    return get_container_mount_path(container)

def safe_join(base: str, *paths: str) -> str:
    # Prevent path traversal
    final_path = os.path.abspath(os.path.join(base, *paths))
    if not final_path.startswith(os.path.abspath(base)):
        raise HTTPException(status_code=403, detail="Path traversal detected.")
    return final_path

class FileWriteRequest(BaseModel):
    content: str

@router.get("/ftp/{container_id}/list", dependencies=[Depends(require_permission("container_filemanager_access"))])
def list_files(container_id: int, path: str = "", db: Session = Depends(get_db), current_user=Depends(require_permission("container_filemanager_access"))):
    container = db.query(Container).filter_by(id=container_id).first()
    if not container:
        raise HTTPException(status_code=404, detail="Container not found")
    root = get_root_path(container)
    abs_path = safe_join(root, path)
    if not os.path.exists(abs_path):
        raise HTTPException(status_code=404, detail="Path not found")
    if not os.path.isdir(abs_path):
        raise HTTPException(status_code=400, detail="Not a directory")
    files = []
    for entry in os.scandir(abs_path):
        files.append({
            "name": entry.name,
            "is_dir": entry.is_dir(),
            "size": entry.stat().st_size,
        })
    return {"files": files}

@router.get("/ftp/{container_id}/read", dependencies=[Depends(require_permission("container_file_read"))])
def read_file(container_id: int, path: str, db: Session = Depends(get_db), current_user=Depends(require_permission("container_file_read"))):
    container = db.query(Container).filter_by(id=container_id).first()
    if not container:
        raise HTTPException(status_code=404, detail="Container not found")
    root = get_root_path(container)
    abs_path = safe_join(root, path)
    if not os.path.exists(abs_path) or not os.path.isfile(abs_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(abs_path)

@router.post("/ftp/{container_id}/write", dependencies=[Depends(require_permission("container_file_write"))])
def write_file(container_id: int, path: str, req: FileWriteRequest, db: Session = Depends(get_db), current_user=Depends(require_permission("container_file_write"))):
    container = db.query(Container).filter_by(id=container_id).first()
    if not container:
        raise HTTPException(status_code=404, detail="Container not found")
    root = get_root_path(container)
    abs_path = safe_join(root, path)
    os.makedirs(os.path.dirname(abs_path), exist_ok=True)
    with open(abs_path, "w") as f:
        f.write(req.content)
    return {"status": "success"}

@router.delete("/ftp/{container_id}/delete", dependencies=[Depends(require_permission("container_file_delete"))])
def delete_file(container_id: int, path: str, db: Session = Depends(get_db), current_user=Depends(require_permission("container_file_delete"))):
    container = db.query(Container).filter_by(id=container_id).first()
    if not container:
        raise HTTPException(status_code=404, detail="Container not found")
    root = get_root_path(container)
    abs_path = safe_join(root, path)
    if not os.path.exists(abs_path):
        raise HTTPException(status_code=404, detail="File not found")
    if os.path.isdir(abs_path):
        os.rmdir(abs_path)
    else:
        os.remove(abs_path)
    return {"status": "deleted"}

# To use, include this router in your main FastAPI app:
# from backend.API.Core.ftp_api import router as ftp_router
# app.include_router(ftp_router, prefix="/api")
