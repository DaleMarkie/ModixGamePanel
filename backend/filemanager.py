import os
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel

router = APIRouter()

STEAM_WORKSHOP = os.path.expanduser(
    "~/.local/share/Steam/steamapps/workshop/content/108600"
)

# -------------------------
# MODEL
# -------------------------
class SaveFile(BaseModel):
    path: str
    content: str


# -------------------------
# SAFE TREE BUILDER
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
# MODS
# -------------------------
@router.get("/workshop-mods")
def workshop_mods():
    try:
        if not os.path.exists(STEAM_WORKSHOP):
            return {
                "mods": [],
                "warning": "Steam workshop folder not found (no Steam install or no mods downloaded yet)"
            }

        mods = []

        for mod_id in os.listdir(STEAM_WORKSHOP):
            mod_path = os.path.join(STEAM_WORKSHOP, mod_id)

            if os.path.isdir(mod_path):
                mods.append({
                    "modId": mod_id,
                    "title": mod_id,
                    "files": build_tree(mod_path)
                })

        return {"mods": mods}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------
# OPEN FILE
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
@router.post("/file/save")
def save_file(data: SaveFile):
    try:
        os.makedirs(os.path.dirname(data.path), exist_ok=True)

        with open(data.path, "w", encoding="utf-8") as f:
            f.write(data.content)

        return {"ok": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))