# backend/filemanager.py
import os
import json
import shutil
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

router = APIRouter()

# ----------------------------
# Config
# ----------------------------
BASE_STEAM_PATH = r"C:\Program Files (x86)\Steam\steamapps\workshop\content"
ACTIVE_GAME_FILE = os.path.expanduser("~/Games/active_game.json")  # stores selected game

# ----------------------------
# Helpers
# ----------------------------
def get_active_game():
    """Read the currently active game ID"""
    if not os.path.exists(ACTIVE_GAME_FILE):
        return None
    with open(ACTIVE_GAME_FILE, "r") as f:
        data = json.load(f)
        return data.get("active_game_id")


def set_active_game(game_id: str):
    """Set the currently active game ID"""
    os.makedirs(os.path.dirname(ACTIVE_GAME_FILE), exist_ok=True)
    with open(ACTIVE_GAME_FILE, "w") as f:
        json.dump({"active_game_id": game_id}, f)


def list_mods(game_id: str):
    """Scan mods for the active game"""
    game_path = os.path.join(BASE_STEAM_PATH, str(game_id))
    if not os.path.exists(game_path):
        return []
    mods = []
    for mod_id in os.listdir(game_path):
        mod_path = os.path.join(game_path, mod_id)
        if os.path.isdir(mod_path):
            mod_name_file = os.path.join(mod_path, "mod.info")
            title = mod_id
            if os.path.exists(mod_name_file):
                try:
                    with open(mod_name_file, "r", encoding="utf-8") as f:
                        title = f.read().strip()
                except:
                    pass
            mods.append({"modId": mod_id, "title": title, "path": mod_path})
    return mods


def build_file_tree(root_path: str):
    """Recursively build file tree"""
    items = []
    for name in os.listdir(root_path):
        path = os.path.join(root_path, name)
        if os.path.isdir(path):
            items.append({
                "type": "folder",
                "name": name,
                "path": path.replace("\\", "/"),
                "children": build_file_tree(path)
            })
        else:
            items.append({
                "type": "file",
                "name": name,
                "path": path.replace("\\", "/")
            })
    return items

# ----------------------------
# Routes
# ----------------------------
@router.get("/filemanager/workshop-mods")
async def get_workshop_mods():
    """Get mods for the active game"""
    active_game = get_active_game()
    if not active_game:
        return {"mods": []}
    mods_list = list_mods(active_game)
    mods = []
    for m in mods_list:
        files = build_file_tree(m["path"])
        mods.append({"modId": m["modId"], "title": m["title"], "files": files})
    return {"mods": mods}


@router.get("/filemanager/file")
async def get_file(path: str = Query(...)):
    if not path or not os.path.exists(path):
        return {"content": ""}
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    return {"content": content}


@router.post("/filemanager/file/save")
async def save_file(payload: dict):
    path = payload.get("path")
    content = payload.get("content")
    if not path or not os.path.exists(path):
        raise HTTPException(status_code=400, detail="File not found")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return {"status": "ok"}


@router.post("/filemanager/file/delete")
async def delete_file(payload: dict):
    path = payload.get("path")
    if not path or not os.path.exists(path):
        raise HTTPException(status_code=400, detail="File not found")
    if os.path.isdir(path):
        shutil.rmtree(path)
    else:
        os.remove(path)
    return {"status": "ok"}


@router.post("/filemanager/file/move")
async def move_file(payload: dict):
    src = payload.get("source")
    dest = payload.get("destination")
    if not src or not os.path.exists(src):
        raise HTTPException(status_code=400, detail="Source not found")
    os.renames(src, dest)
    return {"status": "ok"}


@router.post("/filemanager/file/new")
async def new_file(payload: dict):
    mod_id = payload.get("modId")
    folder_path = payload.get("folderPath", "")
    name = payload.get("name")
    active_game = get_active_game()
    if not active_game or not mod_id or not name:
        raise HTTPException(status_code=400, detail="Missing parameters")
    base_path = os.path.join(BASE_STEAM_PATH, str(active_game), mod_id)
    os.makedirs(os.path.join(base_path, folder_path), exist_ok=True)
    path = os.path.join(base_path, folder_path, name)
    with open(path, "w", encoding="utf-8") as f:
        f.write("")
    return {"status": "ok"}


@router.post("/filemanager/folder/new")
async def new_folder(payload: dict):
    mod_id = payload.get("modId")
    folder_path = payload.get("folderPath", "")
    folder_name = payload.get("folderName")
    active_game = get_active_game()
    if not active_game or not mod_id or not folder_name:
        raise HTTPException(status_code=400, detail="Missing parameters")
    base_path = os.path.join(BASE_STEAM_PATH, str(active_game), mod_id)
    path = os.path.join(base_path, folder_path, folder_name)
    os.makedirs(path, exist_ok=True)
    return {"status": "ok"}


# ----------------------------
# Active game management
# ----------------------------
@router.get("/filemanager/active-game")
async def get_active_game_endpoint():
    active_game = get_active_game()
    return {"active_game": active_game}


@router.post("/filemanager/active-game")
async def set_active_game_endpoint(payload: dict):
    game_id = payload.get("game_id")
    if not game_id:
        raise HTTPException(status_code=400, detail="Missing game_id")
    set_active_game(game_id)
    return {"status": "ok", "active_game": game_id}
