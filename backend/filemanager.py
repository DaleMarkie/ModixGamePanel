import os
from fastapi import APIRouter, HTTPException
from typing import List, Dict

router = APIRouter()

# ---------------------------
# STEAM WORKSHOP PATHS
# ---------------------------
POSSIBLE_STEAM_PATHS = [
    os.path.expanduser("~/.steam/steam/steamapps/workshop/content"),
    os.path.expanduser("~/.local/share/Steam/steamapps/workshop/content"),
    "/mnt/chromeos/MyFiles/Steam/steamapps/workshop/content",
]

def get_workshop_root():
    for path in POSSIBLE_STEAM_PATHS:
        if os.path.exists(path):
            return path
    return None


# ---------------------------
# SAFE PATH CHECK
# ---------------------------
def is_safe_path(base, path):
    return os.path.realpath(path).startswith(os.path.realpath(base))


# ---------------------------
# BUILD TREE
# ---------------------------
def build_tree(base_path: str) -> List[Dict]:
    items = []

    try:
        for name in sorted(os.listdir(base_path)):
            full = os.path.join(base_path, name)

            if os.path.isdir(full):
                items.append({
                    "type": "folder",
                    "name": name,
                    "path": full,
                    "children": build_tree(full)
                })
            else:
                items.append({
                    "type": "file",
                    "name": name,
                    "path": full
                })
    except Exception:
        pass

    return items


# ---------------------------
# GET MODS
# ---------------------------
@router.get("/workshop-mods")
def get_workshop_mods(appId: str):
    root = get_workshop_root()
    if not root:
        raise HTTPException(500, "Steam workshop not found")

    game_path = os.path.join(root, appId)

    if not os.path.exists(game_path):
        return {"mods": []}

    mods = []

    for mod_id in os.listdir(game_path):
        mod_path = os.path.join(game_path, mod_id)

        if not os.path.isdir(mod_path):
            continue

        mods.append({
            "modId": mod_id,
            "title": mod_id,
            "files": build_tree(mod_path)
        })

    return {"mods": mods}


# ---------------------------
# READ FILE
# ---------------------------
@router.get("/file")
def read_file(path: str):
    if not os.path.exists(path):
        raise HTTPException(404, "File not found")

    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return {"content": f.read()}
    except Exception as e:
        raise HTTPException(500, str(e))


# ---------------------------
# SAVE FILE
# ---------------------------
@router.post("/file/save")
def save_file(data: dict):
    path = data.get("path")
    content = data.get("content", "")

    if not path:
        raise HTTPException(400, "Missing path")

    try:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return {"status": "saved"}
    except Exception as e:
        raise HTTPException(500, str(e))


# ---------------------------
# CREATE FILE
# ---------------------------
@router.post("/file/new")
def create_file(data: dict):
    mod_id = data.get("modId")
    name = data.get("name")
    folder = data.get("folderPath")

    root = get_workshop_root()
    if not root:
        raise HTTPException(500, "Steam not found")

    base = folder if folder else os.path.join(root, mod_id)
    path = os.path.join(base, name)

    if not is_safe_path(root, path):
        raise HTTPException(403, "Unsafe path")

    try:
        open(path, "w").close()
        return {"status": "created"}
    except Exception as e:
        raise HTTPException(500, str(e))


# ---------------------------
# CREATE FOLDER
# ---------------------------
@router.post("/folder/new")
def create_folder(data: dict):
    mod_id = data.get("modId")
    name = data.get("folderName")
    folder = data.get("folderPath")

    root = get_workshop_root()
    if not root:
        raise HTTPException(500, "Steam not found")

    base = folder if folder else os.path.join(root, mod_id)
    path = os.path.join(base, name)

    if not is_safe_path(root, path):
        raise HTTPException(403, "Unsafe path")

    try:
        os.makedirs(path, exist_ok=True)
        return {"status": "created"}
    except Exception as e:
        raise HTTPException(500, str(e))


# ---------------------------
# DELETE
# ---------------------------
@router.post("/file/delete")
def delete_file(data: dict):
    path = data.get("path")

    if not path or not os.path.exists(path):
        raise HTTPException(404, "Not found")

    try:
        if os.path.isdir(path):
            import shutil
            shutil.rmtree(path)
        else:
            os.remove(path)
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(500, str(e))


# ---------------------------
# MOVE / RENAME
# ---------------------------
@router.post("/file/move")
def move_file(data: dict):
    src = data.get("source")
    dst = data.get("destination")

    if not src or not dst:
        raise HTTPException(400, "Missing paths")

    try:
        os.rename(src, dst)
        return {"status": "moved"}
    except Exception as e:
        raise HTTPException(500, str(e))