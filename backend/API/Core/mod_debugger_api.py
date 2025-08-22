from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

router = APIRouter()

# ====== Data Models ======
class Note(BaseModel):
    id: int
    text: str
    date: str
    author: str

class ModInfo(BaseModel):
    status: str
    priority: str
    log: str
    notes: List[Note] = []

# ====== Mock In-Memory Store ======
# Example server and mods data
active_server = "projectzomboid"

servers: Dict[str, Dict[str, ModInfo]] = {
    "projectzomboid": {
        "Hydrocraft": ModInfo(
            status="broken",
            priority="High",
            log="Mod failed to load due to missing assets.",
            notes=[]
        ),
        "SuperSurvivors": ModInfo(
            status="needs_update",
            priority="Medium",
            log="Requires update to work with latest patch.",
            notes=[]
        ),
    }
}

# ====== API Endpoints ======

@router.get("/api/active-server")
def get_active_server():
    return {"server": active_server}


@router.get("/api/servers/{server}/mods")
def get_mods(server: str):
    if server not in servers:
        raise HTTPException(status_code=404, detail="Server not found")
    return servers[server]


@router.put("/api/servers/{server}/mods/{mod_name}")
def update_mod(server: str, mod_name: str, mod: ModInfo):
    if server not in servers or mod_name not in servers[server]:
        raise HTTPException(status_code=404, detail="Mod not found")
    servers[server][mod_name] = mod
    return {"message": "Mod updated", "mod": servers[server][mod_name]}


class NoteInput(BaseModel):
    text: str
    author: Optional[str] = "Unknown"


@router.post("/api/servers/{server}/mods/{mod_name}/notes")
def add_note(server: str, mod_name: str, note_input: NoteInput):
    if server not in servers or mod_name not in servers[server]:
        raise HTTPException(status_code=404, detail="Mod not found")

    note_id = len(servers[server][mod_name].notes) + 1
    new_note = Note(
        id=note_id,
        text=note_input.text,
        author=note_input.author or "Unknown",
        date=datetime.utcnow().isoformat()
    )

    servers[server][mod_name].notes.insert(0, new_note)  # newest first
    return new_note
