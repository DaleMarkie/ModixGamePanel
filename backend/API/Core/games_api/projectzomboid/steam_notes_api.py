from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from typing import Literal
import time

router = APIRouter(prefix="/api/steam_notes", tags=["Steam Notes"])

# In-memory notes store (replace with DB later if needed)
steam_notes_store: dict[str, list[dict]] = {}

# === List notes for a SteamID ===
@router.get("/list")
async def list_notes(steamid: str = Query(..., description="SteamID64 of the player")):
    """
    Get all notes for a specific Steam user.
    """
    notes = steam_notes_store.get(steamid, [])
    return JSONResponse({"success": True, "steamid": steamid, "notes": notes})

# === Add a new note ===
@router.post("/add")
async def add_note(
    steamid: str = Query(..., description="SteamID64 of the player"),
    text: str = Query(..., description="Note text"),
    status: Literal["Safe Player", "Low-Risk", "Medium-Risk", "High-Risk"] = Query(..., description="Risk level"),
):
    """
    Add a new note for a Steam user.
    """
    if steamid not in steam_notes_store:
        steam_notes_store[steamid] = []
    
    note_entry = {
        "text": text,
        "status": status,
        "timestamp": int(time.time() * 1000)  # milliseconds
    }
    
    # Insert newest first
    steam_notes_store[steamid].insert(0, note_entry)
    return JSONResponse({"success": True, "notes": steam_notes_store[steamid]})

# === Delete a note by timestamp ===
@router.delete("/delete")
async def delete_note(
    steamid: str = Query(..., description="SteamID64 of the player"),
    timestamp: int = Query(..., description="Timestamp of note to delete"),
):
    """
    Delete a specific note by timestamp.
    """
    if steamid not in steam_notes_store:
        return JSONResponse(
            {"success": False, "message": "No notes found for this SteamID"},
            status_code=404
        )

    before_count = len(steam_notes_store[steamid])
    steam_notes_store[steamid] = [
        n for n in steam_notes_store[steamid] if n["timestamp"] != timestamp
    ]
    after_count = len(steam_notes_store[steamid])

    if before_count == after_count:
        return JSONResponse(
            {"success": False, "message": "Note not found"},
            status_code=404
        )

    return JSONResponse({"success": True, "notes": steam_notes_store[steamid]})
