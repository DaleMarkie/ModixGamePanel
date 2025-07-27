from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS for your frontend origin (adjust accordingly)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock containers - same as frontend
mock_containers = [
    {"id": "pz_server_1", "name": "Project Zomboid - Server 1"},
    {"id": "pz_server_2", "name": "Project Zomboid - Server 2"},
]

# Initial mod data (copy from your mockModData)
mock_mod_data = {
    "ModdedVehiclesPlus": {
        "status": "broken",
        "priority": "High",
        "log": "Mod ModdedVehiclesPlus failed to load due to missing dependency.",
        "notes": [],
    },
    "RealisticZombies": {
        "status": "fixed",
        "priority": "Low",
        "log": "Previously broken mod now loads correctly.",
        "notes": [],
    },
    "BetterUI": {
        "status": "needs_update",
        "priority": "Medium",
        "log": "Incompatible with current game version.",
        "notes": [],
    },
    "MilitaryGearPack": {
        "status": "incompatible",
        "priority": "Critical",
        "log": "Game crash due to outdated version.",
        "notes": [],
    },
}

# Store mods data per container (simulate persistent storage)
mods_data_store: Dict[str, Dict] = {
    container["id"]: mock_mod_data.copy() for container in mock_containers
}


# Pydantic models

class Note(BaseModel):
    id: int
    text: str
    date: str
    author: str


class ModInfo(BaseModel):
    status: str
    priority: str
    log: str
    notes: List[Note]


class ModsResponse(BaseModel):
    __root__: Dict[str, ModInfo]


class UpdateModStatusRequest(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None


class AddNoteRequest(BaseModel):
    text: str
    author: Optional[str] = "Staff"


# --- API endpoints ---

@app.get("/containers")
async def get_containers():
    """Return list of containers."""
    return mock_containers


@app.get("/containers/{container_id}/mods", response_model=ModsResponse)
async def get_mods(container_id: str):
    """Return mod data for a container."""
    mods = mods_data_store.get(container_id)
    if mods is None:
        raise HTTPException(status_code=404, detail="Container not found")
    return mods


@app.patch("/containers/{container_id}/mods/{mod_name}")
async def update_mod(
    container_id: str,
    mod_name: str,
    update: UpdateModStatusRequest,
):
    """Update mod status and/or priority."""
    mods = mods_data_store.get(container_id)
    if mods is None or mod_name not in mods:
        raise HTTPException(status_code=404, detail="Mod or container not found")

    mod = mods[mod_name]

    if update.status:
        mod["status"] = update.status
    if update.priority:
        mod["priority"] = update.priority

    return {"success": True, "mod": mod}


@app.post("/containers/{container_id}/mods/{mod_name}/notes")
async def add_note(
    container_id: str,
    mod_name: str,
    note: AddNoteRequest,
):
    """Add a note to a mod."""
    mods = mods_data_store.get(container_id)
    if mods is None or mod_name not in mods:
        raise HTTPException(status_code=404, detail="Mod or container not found")

    new_note = {
        "id": int(round(__import__("time").time() * 1000)),  # timestamp ms
        "text": note.text,
        "date": __import__("datetime").datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "author": note.author or "Staff",
    }
    mods[mod_name]["notes"].insert(0, new_note)  # newest first

    return {"success": True, "note": new_note}
