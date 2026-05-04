import os
import re
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel

router = APIRouter()

# -------------------------
# GAME → APPID MAP
# -------------------------
GAME_APPIDS = {
    "projectzomboid": "108600",
    "rust": "252490",
    "dayz": "221100",
    "ark_se": "346110",
    "gmod": "4000",
    "cs2": "730",
    "arma3": "107410",
    "squad": "393380",
    "valheim": "892970",
}

# -------------------------
# FIND STEAM LIBRARIES (MULTI-DRIVE)
# -------------------------
def get_steam_libraries():
    paths = []

    default = os.path.expanduser("~/.local/share/Steam")
    vdf_path = os.path.join(default, "steamapps/libraryfolders.vdf")

    if os.path.exists(vdf_path):
        try:
            with open(vdf_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            # crude but reliable path extraction
            matches = re.findall(r'"path"\s+"([^"]+)"', content)

            for m in matches:
                steamapps = os.path.join(m, "steamapps/workshop/content")
                paths.append(steamapps)

        except Exception:
            pass

    # fallback default install
    paths.append(os.path.join(default, "steamapps/workshop/content"))

    # remove duplicates
    return list(set(paths))


# -------------------------
# SAFE TREE
# -------------------------
def build_tree(path):
    items = []

    try:
        if not os.path.exists(path):
            return items

        for name in os.listdir(path):
            full = os.path.join(path, name)

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
        return []

    return items


# -------------------------
# FIND WORKSHOP MODS ACROSS ALL DRIVES
# -------------------------
@router.get("/workshop")
def workshop_mods(game: str = Query(None)):
    try:
        if not game:
            return {"mods": []}

        appid = GAME_APPIDS.get(game)

        if not appid:
            return {
                "mods": [],
                "warning": f"No AppID mapping for {game}"
            }

        libraries = get_steam_libraries()

        mods = []

        # search ALL steam libraries
        for base in libraries:
            workshop_path = os.path.join(base, appid)

            if not os.path.exists(workshop_path):
                continue

            for mod_id in os.listdir(workshop_path):
                mod_path = os.path.join(workshop_path, mod_id)

                if os.path.isdir(mod_path):
                    mods.append({
                        "id": mod_id,
                        "name": f"Mod {mod_id}",
                        "path": mod_path,
                        "files": build_tree(mod_path)
                    })

        return {
            "game": game,
            "appid": appid,
            "libraries_found": len(libraries),
            "mods": mods
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------
# FILE OPEN
# -------------------------
@router.get("/file")
def open_file(path: str = Query(...)):
    try:
        if not os.path.exists(path):
            return {"content": ""}

        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return {"content": f.read()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------
# SAVE FILE
# -------------------------
class SaveFile(BaseModel):
    path: str
    content: str


@router.post("/file/save")
def save_file(data: SaveFile):
    try:
        os.makedirs(os.path.dirname(data.path), exist_ok=True)

        with open(data.path, "w", encoding="utf-8") as f:
            f.write(data.content)

        return {"ok": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))