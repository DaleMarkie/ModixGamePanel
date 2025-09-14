# backend/api_chatlogs.py
from fastapi import APIRouter, Query
from datetime import datetime, timedelta
from typing import List, Optional

router = APIRouter(prefix="/api/projectzomboid/chatlogs", tags=["ChatLogs"])

# In-memory chat logs (replace with DB later if needed)
CHAT_LOGS = [
    {
        "player": "Alice",
        "message": "/help",
        "timestamp": (datetime.utcnow() - timedelta(minutes=5)).isoformat(),
        "chat_type": "Global",
    },
    {
        "player": "Bob",
        "message": "Anyone got food?",
        "timestamp": (datetime.utcnow() - timedelta(minutes=3)).isoformat(),
        "chat_type": "Faction",
    },
    {
        "player": "Charlie",
        "message": "Meet me at the safehouse",
        "timestamp": (datetime.utcnow() - timedelta(minutes=1)).isoformat(),
        "chat_type": "Private",
    },
]


@router.get("")
async def get_chat_logs(
    player: Optional[str] = Query(None, description="Filter by player name"),
    commands_only: bool = Query(False, description="Only return messages starting with /"),
    chat_type: Optional[str] = Query(None, description="Filter by chat type (Global, Faction, Private)"),
    since: Optional[str] = Query(None, description="Return logs after this timestamp (ISO8601)"),
):
    """
    Get chat logs with optional filters:
    - player: filter by player name
    - commands_only: only show messages starting with "/"
    - chat_type: filter by chat type
    - since: return only logs newer than given timestamp
    """

    logs = CHAT_LOGS

    if player:
        logs = [log for log in logs if log["player"].lower() == player.lower()]

    if commands_only:
        logs = [log for log in logs if log["message"].startswith("/")]

    if chat_type:
        logs = [log for log in logs if log["chat_type"].lower() == chat_type.lower()]

    if since:
        try:
            since_dt = datetime.fromisoformat(since)
            logs = [log for log in logs if datetime.fromisoformat(log["timestamp"]) > since_dt]
        except ValueError:
            pass  # ignore bad timestamp format

    return {"logs": logs}


@router.post("")
async def add_chat_log(player: str, message: str, chat_type: str = "Global"):
    """
    Add a new chat log (for testing / simulation).
    """
    new_log = {
        "player": player,
        "message": message,
        "timestamp": datetime.utcnow().isoformat(),
        "chat_type": chat_type,
    }
    CHAT_LOGS.append(new_log)
    return {"status": "ok", "log": new_log}
