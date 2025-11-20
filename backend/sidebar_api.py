import os
import requests
from fastapi import APIRouter
import subprocess

router = APIRouter()

GITHUB_REPO = "DaleMarkie/ModixGamePanel"  # replace if needed
LOCAL_REPO_PATH = "/home/modix/ModixGamePanel"  # your local repo path

def get_local_commit():
    """
    Get the current local commit SHA from your local git repo
    """
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=LOCAL_REPO_PATH,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        return result.stdout.strip()[:7]  # short SHA
    except Exception:
        return None

def get_remote_commit():
    """
    Get the latest commit SHA from GitHub
    """
    url = f"https://api.github.com/repos/{GITHUB_REPO}/commits/main"
    try:
        res = requests.get(url, timeout=10)
        if res.status_code == 200:
            return res.json()["sha"][:7]
    except Exception:
        return None
    return None

@router.get("/latest-commit")
def latest_commit():
    local_commit = get_local_commit()
    remote_commit = get_remote_commit()
    if not local_commit or not remote_commit:
        return {"error": True, "message": "Failed to fetch commits"}
    
    fully_updated = local_commit == remote_commit
    return {
        "error": False,
        "local_commit": local_commit,
        "remote_commit": remote_commit,
        "fully_updated": fully_updated
    }

@router.get("/latest-commit-files")
def latest_commit_files(commit_sha: str):
    url = f"https://api.github.com/repos/{GITHUB_REPO}/commits/{commit_sha}"
    try:
        res = requests.get(url, timeout=10)
        if res.status_code == 200:
            data = res.json()
            files = [
                {
                    "filename": f["filename"],
                    "status": f["status"],
                    "additions": f.get("additions", 0),
                    "deletions": f.get("deletions", 0),
                }
                for f in data.get("files", [])
            ]
            return {"error": False, "files": files}
    except Exception:
        pass
    return {"error": True, "files": []}
