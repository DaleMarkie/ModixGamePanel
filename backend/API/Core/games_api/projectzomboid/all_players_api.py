from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

# Router for All Players API
router = APIRouter(prefix="/api/allplayers", tags=["AllPlayersAPI"])

# In-memory store of players (replace with DB later if needed)
players_store: list[dict] = [
    {"name": "Alice", "lastSeen": "2025-09-12 18:45", "totalHours": 120},
    {"name": "Bob", "lastSeen": "2025-09-10 21:15", "totalHours": 54},
]

# === List all players ===
@router.get("/list")
async def list_players():
    """
    Get all players.
    """
    return JSONResponse({"success": True, "players": players_store})

# === Add a new player ===
@router.post("/add")
async def add_player(
    name: str = Query(..., description="Player name"),
    lastSeen: str = Query(..., description="Last seen date/time string"),
    totalHours: int = Query(..., description="Total hours played"),
):
    """
    Add a new player to the list.
    """
    player = {"name": name, "lastSeen": lastSeen, "totalHours": totalHours}
    players_store.append(player)
    return JSONResponse({"success": True, "players": players_store})

# === Delete a player by name ===
@router.delete("/delete")
async def delete_player(name: str = Query(..., description="Player name")):
    """
    Remove a player by name.
    """
    global players_store
    before_count = len(players_store)
    players_store = [p for p in players_store if p["name"].lower() != name.lower()]
    after_count = len(players_store)

    if before_count == after_count:
        return JSONResponse(
            {"success": False, "message": "Player not found"}, status_code=404
        )

    return JSONResponse({"success": True, "players": players_store})
