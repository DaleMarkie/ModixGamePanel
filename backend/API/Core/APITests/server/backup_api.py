import os
import shutil
import subprocess
from datetime import datetime
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List

router = APIRouter()

# Directory to store volume backups on the host
BACKUP_DIR = "/project/workspace/docker_volume_backups"
os.makedirs(BACKUP_DIR, exist_ok=True)

class BackupInfo(BaseModel):
    name: str
    volume_name: str
    created_at: datetime
    filename: str

def list_backup_files() -> List[BackupInfo]:
    backups = []
    for file in os.listdir(BACKUP_DIR):
        if file.endswith(".tar.gz"):
            parts = file.split("__")
            if len(parts) == 2:
                volume_name = parts[0]
                timestamp_str = parts[1].replace(".tar.gz", "")
                try:
                    created_at = datetime.strptime(timestamp_str, "%Y%m%d%H%M%S")
                except Exception:
                    created_at = datetime.fromtimestamp(os.path.getctime(os.path.join(BACKUP_DIR, file)))
                backups.append(
                    BackupInfo(
                        name=f"{volume_name} backup {created_at.strftime('%Y-%m-%d %H:%M:%S')}",
                        volume_name=volume_name,
                        created_at=created_at,
                        filename=file,
                    )
                )
    backups.sort(key=lambda b: b.created_at, reverse=True)
    return backups

def run_command(cmd: List[str]):
    # Runs a shell command, raises on failure
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Command '{' '.join(cmd)}' failed: {result.stderr.strip()}")
    return result.stdout.strip()

@router.get("/backups", response_model=List[BackupInfo])
def get_backups():
    """List all volume backups."""
    return list_backup_files()

class CreateBackupRequest(BaseModel):
    volume_name: str

@router.post("/backups")
def create_backup(request: CreateBackupRequest, background_tasks: BackgroundTasks):
    """Create a backup of a Docker volume."""

    volume = request.volume_name
    # Check if volume exists
    try:
        volumes = run_command(["docker", "volume", "ls", "-q"]).splitlines()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list Docker volumes: {e}")

    if volume not in volumes:
        raise HTTPException(status_code=404, detail=f"Docker volume '{volume}' not found.")

    # Prepare backup filename
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    backup_filename = f"{volume}__{timestamp}.tar.gz"
    backup_path = os.path.join(BACKUP_DIR, backup_filename)

    def backup_volume():
        try:
            # Run a temporary container to archive volume contents
            cmd = [
                "docker",
                "run",
                "--rm",
                "-v", f"{volume}:/volume",
                "-v", f"{BACKUP_DIR}:/backup",
                "busybox",
                "tar",
                "czf",
                f"/backup/{backup_filename}",
                "-C",
                "/volume",
                ".",
            ]
            run_command(cmd)
        except Exception as e:
            print(f"Backup failed: {e}")
            # Could add logging or notification here

    # Run backup in background
    background_tasks.add_task(backup_volume)

    return {"message": f"Backup started for volume '{volume}', saved as '{backup_filename}'"}

class RestoreBackupRequest(BaseModel):
    backup_filename: str
    volume_name: str

@router.post("/backups/restore")
def restore_backup(request: RestoreBackupRequest, background_tasks: BackgroundTasks):
    """Restore a Docker volume from a backup archive."""

    backup_path = os.path.join(BACKUP_DIR, request.backup_filename)
    if not os.path.isfile(backup_path):
        raise HTTPException(status_code=404, detail="Backup file not found.")

    # Check if volume exists, create if not
    try:
        volumes = run_command(["docker", "volume", "ls", "-q"]).splitlines()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list Docker volumes: {e}")

    if request.volume_name not in volumes:
        # Create volume if missing
        try:
            run_command(["docker", "volume", "create", request.volume_name])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create volume: {e}")

    def restore_volume():
        try:
            # Clear existing volume data by running a tmp container to delete contents
            run_command([
                "docker", "run", "--rm",
                "-v", f"{request.volume_name}:/volume",
                "busybox",
                "sh", "-c", "rm -rf /volume/* /volume/.* || true"
            ])
            # Extract backup archive into the volume
            run_command([
                "docker", "run", "--rm",
                "-v", f"{request.volume_name}:/volume",
                "-v", f"{BACKUP_DIR}:/backup",
                "busybox",
                "sh", "-c", f"tar xzf /backup/{request.backup_filename} -C /volume"
            ])
        except Exception as e:
            print(f"Restore failed: {e}")

    background_tasks.add_task(restore_volume)

    return {"message": f"Restore started for volume '{request.volume_name}' from backup '{request.backup_filename}'"}

@router.delete("/backups/{backup_filename}")
def delete_backup(backup_filename: str):
    """Delete a backup file."""
    backup_path = os.path.join(BACKUP_DIR, backup_filename)
    if not os.path.isfile(backup_path):
        raise HTTPException(status_code=404, detail="Backup file not found.")

    try:
        os.remove(backup_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete backup file: {e}")

    return {"message": f"Backup '{backup_filename}' deleted successfully."}

@router.get("/backups/download/{backup_filename}")
def download_backup(backup_filename: str):
    """Download a backup archive file."""
    backup_path = os.path.join(BACKUP_DIR, backup_filename)
    if not os.path.isfile(backup_path):
        raise HTTPException(status_code=404, detail="Backup file not found.")

    return FileResponse(backup_path, filename=backup_filename, media_type="application/gzip")
