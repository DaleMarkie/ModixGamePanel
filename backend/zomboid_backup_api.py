import os
import shutil
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# -----------------------------
# AUTO-DETECT USER ENVIRONMENT
# -----------------------------

BASE_DIR = os.path.expanduser("~")  # ALWAYS current user home

# Optional overrides via environment variables
ZOMBOID_PATH = os.getenv(
    "ZOMBOID_PATH",
    os.path.join(BASE_DIR, "Zomboid")
)

BACKUP_DIR = os.getenv(
    "ZOMBOID_BACKUP_DIR",
    os.path.join(BASE_DIR, "zomboid_backups")
)

# Ensure directories exist (safe now)
os.makedirs(BACKUP_DIR, exist_ok=True)


# -----------------------------
# REQUEST MODEL
# -----------------------------
class BackupRequest(BaseModel):
    name: str | None = None


# -----------------------------
# CREATE BACKUP
# -----------------------------
@router.post("/create")
def create_backup(req: BackupRequest):
    if not os.path.exists(ZOMBOID_PATH):
        raise HTTPException(
            status_code=404,
            detail=f"Zomboid folder not found at {ZOMBOID_PATH}"
        )

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_name = req.name or f"backup_{timestamp}"
    output_path = os.path.join(BACKUP_DIR, backup_name)

    try:
        archive_file = shutil.make_archive(
            output_path,
            "zip",
            ZOMBOID_PATH
        )

        size_mb = round(os.path.getsize(archive_file) / (1024 * 1024), 2)

        return {
            "success": True,
            "name": backup_name,
            "file": archive_file,
            "size_mb": size_mb,
            "date": timestamp,
            "source": ZOMBOID_PATH,
            "backup_dir": BACKUP_DIR,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------
# LIST BACKUPS
# -----------------------------
@router.get("/list")
def list_backups():
    if not os.path.exists(BACKUP_DIR):
        return []

    backups = []

    for f in os.listdir(BACKUP_DIR):
        if f.endswith(".zip"):
            path = os.path.join(BACKUP_DIR, f)

            backups.append({
                "name": f.replace(".zip", ""),
                "date": datetime.fromtimestamp(
                    os.path.getmtime(path)
                ).strftime("%Y-%m-%d %H:%M"),
                "size": f"{round(os.path.getsize(path) / (1024 * 1024), 2)} MB",
            })

    return sorted(backups, key=lambda x: x["date"], reverse=True)


# -----------------------------
# DELETE BACKUP
# -----------------------------
@router.delete("/delete/{name}")
def delete_backup(name: str):
    file_path = os.path.join(BACKUP_DIR, f"{name}.zip")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Backup not found")

    os.remove(file_path)
    return {"success": True}


# -----------------------------
# RESTORE BACKUP
# -----------------------------
@router.post("/restore/{name}")
def restore_backup(name: str):
    file_path = os.path.join(BACKUP_DIR, f"{name}.zip")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Backup not found")

    try:
        # WARNING: overwrites data
        shutil.rmtree(ZOMBOID_PATH, ignore_errors=True)
        shutil.unpack_archive(file_path, ZOMBOID_PATH)

        return {
            "success": True,
            "restored": name,
            "target": ZOMBOID_PATH
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))