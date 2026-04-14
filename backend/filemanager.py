import os
import time
import shutil
from typing import Dict, List

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

router = APIRouter()

# =========================================================
# ⚙️ CONFIG
# =========================================================

DEV_MODE = os.getenv("MODIX_DEV_MODE", "false").lower() == "true"

POSSIBLE_STEAM_PATHS = [
    os.path.expanduser("~/.steam/steam/steamapps/workshop/content"),
    os.path.expanduser("~/.local/share/Steam/steamapps/workshop/content"),
]

CACHE: Dict[str, dict] = {}
CACHE_TTL = 10

active_connections: List[WebSocket] = []

# =========================================================
# 🧪 DEV MODE DATA
# =========================================================

def fake_workshop():
    return {
        "mods": [
            {
                "modId": "123456",
                "title": "🔥 Dev Survival Mod",
                "icon": "🧟",
                "files": []
            },
            {
                "modId": "987654",
                "title": "⚔️ Weapon Pack (Dev)",
                "icon": "⚔️",
                "files": []
            }
        ]
    }

# =========================================================
# 🔍 STEAM PATH RESOLVER
# =========================================================

def resolve_workshop_path():
    if DEV_MODE:
        return None

    for path in POSSIBLE_STEAM_PATHS:
        if os.path.exists(path):
            return path

    return None

# =========================================================
# 🔐 SECURITY
# =========================================================

def is_safe_path(path: str, base: str):
    real_base = os.path.realpath(base)
    real_target = os.path.realpath(path)
    return real_target.startswith(real_base)

# =========================================================
# 📦 MODELS
# =========================================================

class SaveRequest(BaseModel):
    path: str
    content: str

class MoveRequest(BaseModel):
    source: str
    destination: str

class DeleteRequest(BaseModel):
    path: str

# =========================================================
# 🧠 CACHE TREE
# =========================================================

def build_tree(base_path: str):
    now = time.time()

    if base_path in CACHE:
        cached = CACHE[base_path]
        if now - cached["time"] < CACHE_TTL:
            return cached["data"]

    items = []

    try:
        for entry in sorted(os.listdir(base_path)):
            full = os.path.join(base_path, entry)

            if os.path.isdir(full):
                items.append({
                    "type": "folder",
                    "name": entry,
                    "path": full,
                    "children": build_tree(full)
                })
            else:
                items.append({
                    "type": "file",
                    "name": entry,
                    "path": full
                })
    except Exception:
        pass

    CACHE[base_path] = {"time": now, "data": items}
    return items

# =========================================================
# 🎮 MOD INFO PARSER
# =========================================================

def parse_mod_name(mod_path: str):
    try:
        for root, _, files in os.walk(mod_path):
            if "mod.info" in files:
                with open(os.path.join(root, "mod.info"), "r", encoding="utf-8", errors="ignore") as f:
                    for line in f:
                        if line.lower().startswith("name="):
                            return line.split("=", 1)[1].strip()
    except Exception:
        pass

    return None

# =========================================================
# 📊 WORKSHOP MODS
# =========================================================

@router.get("/workshop-mods")
def get_workshop_mods(appId: str):

    if DEV_MODE:
        return fake_workshop()

    base = resolve_workshop_path()

    if not base:
        raise HTTPException(
            status_code=500,
            detail="Steam Workshop not found (try DEV_MODE=true)"
        )

    game_path = os.path.join(base, appId)

    if not os.path.exists(game_path):
        raise HTTPException(status_code=404, detail="Game workshop not found")

    mods = []

    for mod_id in os.listdir(game_path):
        mod_path = os.path.join(game_path, mod_id)

        if os.path.isdir(mod_path):
            mods.append({
                "modId": mod_id,
                "title": parse_mod_name(mod_path) or f"Mod {mod_id}",
                "icon": "📦",
                "files": build_tree(mod_path)
            })

    return {"mods": mods}

# =========================================================
# 📄 READ FILE
# =========================================================

@router.get("/file")
def read_file(path: str):

    base = resolve_workshop_path()
    if not base:
        if DEV_MODE:
            return {"content": "// DEV MODE FILE"}
        raise HTTPException(500, "Steam not found")

    if not is_safe_path(path, base):
        raise HTTPException(403, "Access denied")

    if not os.path.exists(path):
        raise HTTPException(404, "File not found")

    if os.path.isdir(path):
        raise HTTPException(400, "Is folder")

    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return {"content": f.read()}

# =========================================================
# 💾 SAVE FILE + BROADCAST
# =========================================================

@router.post("/file/save")
async def save_file(data: SaveRequest):

    base = resolve_workshop_path()
    if not base:
        raise HTTPException(500, "Steam not found")

    if not is_safe_path(data.path, base):
        raise HTTPException(403, "Access denied")

    with open(data.path, "w", encoding="utf-8") as f:
        f.write(data.content)

    await broadcast({"event": "file_saved", "path": data.path})

    return {"status": "saved"}

# =========================================================
# 🗑️ DELETE FILE
# =========================================================

@router.post("/file/delete")
async def delete_file(data: DeleteRequest):

    base = resolve_workshop_path()
    if not base:
        raise HTTPException(500, "Steam not found")

    if not is_safe_path(data.path, base):
        raise HTTPException(403, "Access denied")

    if os.path.isdir(data.path):
        shutil.rmtree(data.path)
    else:
        os.remove(data.path)

    await broadcast({"event": "file_deleted", "path": data.path})

    return {"status": "deleted"}

# =========================================================
# 📦 MOVE FILE
# =========================================================

@router.post("/file/move")
async def move_file(data: MoveRequest):

    base = resolve_workshop_path()
    if not base:
        raise HTTPException(500, "Steam not found")

    if not is_safe_path(data.source, base) or not is_safe_path(data.destination, base):
        raise HTTPException(403, "Access denied")

    os.makedirs(os.path.dirname(data.destination), exist_ok=True)
    shutil.move(data.source, data.destination)

    await broadcast({
        "event": "file_moved",
        "from": data.source,
        "to": data.destination
    })

    return {"status": "moved"}

# =========================================================
# 🔌 WEBSOCKET LIVE SYNC
# =========================================================

@router.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    active_connections.append(ws)

    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        active_connections.remove(ws)

# =========================================================
# 📡 BROADCAST HELPER
# =========================================================

async def broadcast(event: dict):
    dead = []

    for ws in active_connections:
        try:
            await ws.send_json(event)
        except Exception:
            dead.append(ws)

    for d in dead:
        active_connections.remove(d)