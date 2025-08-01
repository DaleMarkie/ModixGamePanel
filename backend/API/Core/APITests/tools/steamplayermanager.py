from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

router = APIRouter()

# Sample in-memory DB for demo purposes
players_db = [
    {
        "steamId": "76561198000000001",
        "name": "PlayerOne",
        "online": True,
        "playtime": 120,
        "notes": "Good player",
        "banned": False,
        "countryCode": "US",
        "countryName": "United States",
        "vpn": False,
        "vacBanned": False,
    },
    {
        "steamId": "76561198347512345",
        "name": "SpecialUser",
        "online": False,
        "playtime": 450,
        "notes": "",
        "banned": False,
        "countryCode": "GB",
        "countryName": "United Kingdom",
        "vpn": False,
        "vacBanned": True,
    },
    # Add more sample players...
]

class Player(BaseModel):
    steamId: str
    name: str
    online: bool
    playtime: int
    notes: Optional[str] = ""
    banned: bool
    countryCode: Optional[str] = None
    countryName: Optional[str] = None
    vpn: Optional[bool] = False
    vacBanned: Optional[bool] = False

class PlayerNoteUpdate(BaseModel):
    steamId: str
    notes: Optional[str] = ""
    banned: bool

@router.get("/api/players", response_model=List[Player])
async def get_players():
    return players_db

@router.post("/api/playerNotes")
async def update_player_notes(data: PlayerNoteUpdate):
    for player in players_db:
        if player["steamId"] == data.steamId:
            player["notes"] = data.notes
            player["banned"] = data.banned
            return {"message": "Player updated"}
    raise HTTPException(status_code=404, detail="Player not found")
