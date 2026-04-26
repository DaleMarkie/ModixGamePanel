import os
import json
import shutil
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

BASE_DIR = os.path.expanduser("~")

ZOMBOID_PATH = os.getenv(
    "ZOMBOID_PATH",
    os.path.join(BASE_DIR, "Zomboid")
)

BACKUP_DIR = os.getenv(
    "ZOMBOID_BACKUP_DIR",
    os.path.join(BASE_DIR, "zomboid_backups")
)

META_FILE = os.path.join(BACKUP_DIR, "backups.json")

os.makedirs(BACKUP_DIR, exist_ok=True)


# -----------------------------
# LOAD / SAVE METADATA
# -----------------------------
def load_meta():
    if not os.path.exists(META_FILE):
        return {}
    with open(META_FILE, "r") as f:
        return json.load(f)


def save_meta(data):
    with open(META_FILE, "w") as f:
        json.dump(data, f, indent=2)


# -----------------------------
class BackupRequest(BaseModel):
    name: str | None = None


class RenameRequest(BaseModel):
    label: str


# -----------------------------
# CREATE BACKUP
# -----------------------------
@router.post("/create")
def create_backup(req: BackupRequest):
    if not os.path.exists(ZOMBOID_PATH):
        raise HTTPException(404, "Zomboid folder not found")

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_id = req.name or f"backup_{timestamp}"

    output_path = os.path.join(BACKUP_DIR, backup_id)

    archive_file = shutil.make_archive(
        output_path,
        "zip",
        ZOMBOID_PATH
    )

    meta = load_meta()

    meta[backup_id] = {
        "label": backup_id,
        "date": timestamp,
        "file": archive_file
    }

    save_meta(meta)

    return {
        "id": backup_id,
        "label": backup_id,
        "date": timestamp,
        "size_mb": round(os.path.getsize(archive_file) / (1024 * 1024), 2)
    }


# -----------------------------
# LIST BACKUPS
# -----------------------------
@router.get("/list")
def list_backups():
    meta = load_meta()

    results = []

    for backup_id, data in meta.items():
        if os.path.exists(data["file"]):
            results.append({
                "id": backup_id,
                "name": data.get("label", backup_id),
                "date": data["date"],
                "size": f"{round(os.path.getsize(data['file']) / (1024 * 1024), 2)} MB"
            })

    return sorted(results, key=lambda x: x["date"], reverse=True)


# -----------------------------
# RENAME BACKUP (NEW)
# -----------------------------
@router.put("/rename/{backup_id}")
def rename_backup(backup_id: str, req: RenameRequest):
    meta = load_meta()

    if backup_id not in meta:
        raise HTTPException(404, "Backup not found")

    meta[backup_id]["label"] = req.label

    save_meta(meta)

    return {"success": True}


# -----------------------------
# DELETE
# -----------------------------
@router.delete("/delete/{backup_id}")
def delete_backup(backup_id: str):
    meta = load_meta()

    if backup_id not in meta:
        raise HTTPException(404, "Backup not found")

    file_path = meta[backup_id]["file"]

    if os.path.exists(file_path):
        os.remove(file_path)

    del meta[backup_id]
    save_meta(meta)

    return {"success": True}


# -----------------------------
# RESTORE
# -----------------------------
@router.post("/restore/{backup_id}")
def restore_backup(backup_id: str):
    meta = load_meta()

    if backup_id not in meta:
        raise HTTPException(404, "Backup not found")

    file_path = meta[backup_id]["file"]

    shutil.rmtree(ZOMBOID_PATH, ignore_errors=True)
    shutil.unpack_archive(file_path, ZOMBOID_PATH)

    return {"success": True}