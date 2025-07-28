from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

app = FastAPI()

# CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (swap with DB later)
containers: Dict[str, Dict[str, dict]] = {}

# -------------------------------
# Models
# -------------------------------

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

class ModUpdateRequest(BaseModel):
    container_id: str
    mod_name: str
    status: Optional[str] = None
    priority: Optional[str] = None

class AddNoteRequest(BaseModel):
    container_id: str
    mod_name: str
    text: str

class DeleteNoteRequest(BaseModel):
    container_id: str
    mod_name: str
    note_id: int

class AddModRequest(BaseModel):
    container_id: str
    mod_name: str

# -------------------------------
# Routes
# -------------------------------

@app.get("/mods/{container_id}")
def get_mods(container_id: str):
    return containers.get(container_id, {})

@app.post("/mods/add")
def add_mod(req: AddModRequest):
    mods = containers.setdefault(req.container_id, {})
    if req.mod_name in mods:
        raise HTTPException(status_code=400, detail="Mod already exists.")
    mods[req.mod_name] = {
        "status": "broken",
        "priority": "Medium",
        "log": "Newly added mod — please review.",
        "notes": []
    }
    return {"success": True}

@app.post("/mods/update")
def update_mod(req: ModUpdateRequest):
    mods = containers.setdefault(req.container_id, {})
    mod = mods.get(req.mod_name)
    if not mod:
        raise HTTPException(status_code=404, detail="Mod not found.")

    if req.status:
        mod["status"] = req.status
    if req.priority:
        mod["priority"] = req.priority

    return {"success": True, "mod": mod}

@app.post("/mods/add_note")
def add_note(req: AddNoteRequest):
    mods = containers.setdefault(req.container_id, {})
    mod = mods.get(req.mod_name)
    if not mod:
        raise HTTPException(status_code=404, detail="Mod not found.")

    note = {
        "id": int(datetime.utcnow().timestamp() * 1000),
        "text": req.text.strip(),
        "date": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        "author": "Staff",
    }
    mod.setdefault("notes", []).insert(0, note)
    return {"success": True, "note": note}

@app.post("/mods/delete_note")
def delete_note(req: DeleteNoteRequest):
    mods = containers.get(req.container_id, {})
    mod = mods.get(req.mod_name)
    if not mod:
        raise HTTPException(status_code=404, detail="Mod not found.")

    notes = mod.get("notes", [])
    mod["notes"] = [n for n in notes if n["id"] != req.note_id]
    return {"success": True}
