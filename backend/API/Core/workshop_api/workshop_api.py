# ---------------------------
# Project Zomboid Workshop Mods API
# ---------------------------
import os
import json
from fastapi import APIRouter, Request, Query
from fastapi.responses import JSONResponse
from datetime import datetime

router = APIRouter()

# Default Steam Workshop folder for Project Zomboid
WORKSHOP_PATH_WIN = r"C:\Program Files (x86)\Steam\steamapps\workshop\content\108600"
WORKSHOP_PATH_UNIX = os.path.expanduser("~/Steam/steamapps/workshop/content/108600")

def get_workshop_path() -> str:
    """Return the correct Workshop path depending on OS."""
    if os.name == "nt":
        return WORKSHOP_PATH_WIN
    return WORKSHOP_PATH_UNIX

def scan_workshop_mods() -> list[dict]:
    """Scan the local Workshop folder for Project Zomboid mods."""
    workshop_path = get_workshop_path()
    mods = []
    if not os.path.isdir(workshop_path):
        return mods
    for mod_id in os.listdir(workshop_path):
        mod_folder = os.path.join(workshop_path, mod_id)
        if not os.path.isdir(mod_folder):
            continue
        mod_info_path = os.path.join(mod_folder, "mod.info.json")
        if os.path.isfile(mod_info_path):
            try:
                with open(mod_info_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    mods.append({
                        "modId": mod_id,
                        "title": data.get("name", f"Mod {mod_id}"),
                        "version": data.get("version"),
                        "dependencies": data.get("dependencies", []),
                        "path": mod_folder,
                    })
            except Exception:
                mods.append({"modId": mod_id, "title": f"Mod {mod_id}", "path": mod_folder})
        else:
            mods.append({"modId": mod_id, "title": f"Mod {mod_id}", "path": mod_folder})
    return mods

def error_response(code: str, status: int, message: str):
    return JSONResponse({"success": False, "error": code, "message": message}, status_code=status)

@router.get("/projectzomboid/workshop-mods")
async def get_workshop_mods():
    """Return list of installed Project Zomboid Workshop mods."""
    workshop_path = get_workshop_path()
    if not os.path.isdir(workshop_path):
        return JSONResponse({
            "success": False,
            "message": "Workshop folder not found. Steam may not be installed or no mods downloaded.",
            "mods": [],
        })

    mods = scan_workshop_mods()
    if not mods:
        return JSONResponse({
            "success": True,
            "message": "No mods found in the Workshop folder.",
            "mods": [],
        })

    return JSONResponse({
        "success": True,
        "message": f"Found {len(mods)} mods in Workshop folder.",
        "mods": mods,
    })

@router.get("/projectzomboid/workshop-mods/file")
async def get_mod_file(path: str = Query(..., description="Full path to the file in a mod folder")):
    """Read content of a specific file in a mod folder."""
    if not os.path.isfile(path):
        return error_response("GAME_002", 404, f"File not found: {path}")
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        return {"success": True, "content": content}
    except Exception as e:
        return error_response("BACKEND_001", 500, str(e))

@router.post("/projectzomboid/workshop-mods/file/save")
async def save_mod_file(request: Request):
    """Save content to a specific file in a mod folder."""
    data = await request.json()
    path = data.get("path")
    content = data.get("content", "")
    if not path or not os.path.isfile(path):
        return error_response("GAME_002", 404, f"File not found: {path}")
    try:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return {"success": True, "message": f"File saved: {path}"}
    except Exception as e:
        return error_response("BACKEND_001", 500, str(e))
