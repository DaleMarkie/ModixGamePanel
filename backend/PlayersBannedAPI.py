# backend/PlayersBannedAPI.py
from fastapi import APIRouter
from datetime import datetime
from typing import List, Optional

router = APIRouter(prefix="/api/projectzomboid", tags=["PlayersBannedAPI"])

# In-memory ban list (replace with DB or Zomboid files later)
BANNED_PLAYERS = [
    {
        "player": "Griefer123",
        "message": "Exploiting game mechanics",
        "timestamp": datetime.utcnow().isoformat(),
    },
    {
        "player": "ToxicMike",
        "message": "Harassment in chat",
        "timestamp": datetime.utcnow().isoformat(),
    },
]


@router.get("/banned")
async def get_banned_players():
    """Return all banned players"""
    return {"banned": BANNED_PLAYERS}


@router.post("/ban")
async def ban_player(player: str, reason: Optional[str] = None):
    """Ban a player with an optional reason"""
    new_ban = {
        "player": player,
        "message": reason or "No reason provided",
        "timestamp": datetime.utcnow().isoformat(),
    }
    # Avoid duplicate bans
    if any(p["player"].lower() == player.lower() for p in BANNED_PLAYERS):
        return {"status": "already_banned", "player": player}

    BANNED_PLAYERS.append(new_ban)
    return {"status": "banned", "player": player, "ban": new_ban}


@router.post("/unban")
async def unban_player(player: str):
    """Unban a player by name"""
    global BANNED_PLAYERS
    before_count = len(BANNED_PLAYERS)
    BANNED_PLAYERS = [p for p in BANNED_PLAYERS if p["player"].lower() != player.lower()]

    if len(BANNED_PLAYERS) == before_count:
        return {"status": "not_found", "player": player}
    return {"status": "unbanned", "player": player}
