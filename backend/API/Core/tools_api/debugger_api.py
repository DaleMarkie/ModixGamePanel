# backend/API/Core/tools_api/debugger_api.py
from fastapi import APIRouter, HTTPException, Path, Body
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional
from datetime import datetime

router = APIRouter()

# In-memory storage for demo purposes (replace with DB if needed)
active_server: Optional[str] = "pz_server_01"
servers_mods: Dict[str, Dict[str, dict]] = {
    "pz_server_01": {
        "Better Zombies": {
            "status": "broken",
            "priority": "High",
            "log": "Failed to load textures",
            "notes": []
        },
        "Survivor Tools": {
            "status": "needs_update",
            "priority": "Medium",
            "log": "Update available",
            "notes": []
        },
    }
}

# === Active Server ===
@router.get("/active-server")
async def get_active_server():
    if not active_server:
        return {"server": None}
    return {"server": active_server}

# === Get Mods for Server ===
@router.get("/servers/{server}/mods")
async def get_server_mods(server: str = Path(...)):
    mods = servers_mods.get(server)
    if mods is None:
        raise HTTPException(status_code=404, detail="Server not found")
    return mods

# === Update Mod Status ===
@router.put("/servers/{server}/mods/{mod_name}")
async def update_mod(
    server: str = Path(...),
    mod_name: str = Path(...),
    payload: dict = Body(...)
):
    mods = servers_mods.get(server)
    if not mods or mod_name not in mods:
        raise HTTPException(status_code=404, detail="Mod or server not found")
    mods[mod_name]["status"] = payload.get("status", mods[mod_name]["status"])
    mods[mod_name]["priority"] = payload.get("priority", mods[mod_name]["priority"])
    mods[mod_name]["log"] = payload.get("log", mods[mod_name]["log"])
    return mods[mod_name]

# === Add Note to Mod ===
@router.post("/servers/{server}/mods/{mod_name}/notes")
async def add_mod_note(
    server: str = Path(...),
    mod_name: str = Path(...),
    note: dict = Body(...)
):
    mods = servers_mods.get(server)
    if not mods or mod_name not in mods:
        raise HTTPException(status_code=404, detail="Mod or server not found")
    
    note_id = len(mods[mod_name]["notes"]) + 1
    new_note = {
        "id": note_id,
        "text": note.get("text", ""),
        "author": note.get("author", "System"),
        "date": datetime.now().isoformat()
    }
    mods[mod_name]["notes"].insert(0, new_note)
    return JSONResponse(new_note)
