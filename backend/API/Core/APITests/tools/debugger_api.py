# /project/workspace/backend/API/Core/APITests/tools/debugger_api.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

app = FastAPI(title="Mod Debugger API")

class Note(BaseModel):
    id: int
    text: str
    date: str
    author: str

class ModInfo(BaseModel):
    status: str  # "broken" | "fixed" | "needs_update" | "incompatible"
    priority: str  # "Low" | "Medium" | "High" | "Critical"
    log: str
    notes: List[Note] = Field(default_factory=list)

# Container -> mod name -> ModInfo
mods_data: Dict[str, Dict[str, ModInfo]] = {}

# Example container list
mock_containers = [
    {"id": "pz_server_1", "name": "Project Zomboid - Server 1"},
    {"id": "pz_server_2", "name": "Project Zomboid - Server 2"},
]

@app.get("/containers")
def get_containers():
    return mock_containers

@app.get("/mods/{container_id}")
def get_mods(container_id: str):
    if container_id not in mods_data:
        # initialize with empty or default data if you want
        mods_data[container_id] = {}
    return mods_data[container_id]

@app.post("/mods/{container_id}/{mod_name}")
def add_or_update_mod(container_id: str, mod_name: str, mod_info: ModInfo):
    if container_id not in mods_data:
        mods_data[container_id] = {}
    mods_data[container_id][mod_name] = mod_info
    return {"message": "Mod added/updated"}

@app.delete("/mods/{container_id}/{mod_name}")
def delete_mod(container_id: str, mod_name: str):
    if container_id not in mods_data or mod_name not in mods_data[container_id]:
        raise HTTPException(status_code=404, detail="Mod not found")
    del mods_data[container_id][mod_name]
    return {"message": "Mod deleted"}

@app.post("/mods/{container_id}/{mod_name}/notes")
def add_note(container_id: str, mod_name: str, note: Note):
    if container_id not in mods_data or mod_name not in mods_data[container_id]:
        raise HTTPException(status_code=404, detail="Mod not found")
    mods_data[container_id][mod_name].notes.insert(0, note)
    return {"message": "Note added"}

@app.delete("/mods/{container_id}/{mod_name}/notes/{note_id}")
def delete_note(container_id: str, mod_name: str, note_id: int):
    if container_id not in mods_data or mod_name not in mods_data[container_id]:
        raise HTTPException(status_code=404, detail="Mod not found")
    mod = mods_data[container_id][mod_name]
    mod.notes = [n for n in mod.notes if n.id != note_id]
    return {"message": "Note deleted"}
