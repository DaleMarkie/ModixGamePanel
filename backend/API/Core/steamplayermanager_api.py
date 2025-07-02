import subprocess
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Player(BaseModel):
    steamId: str
    name: str
    online: bool
    playtime: int
    vacBanned: bool
    vpn: bool
    countryCode: str
    countryName: str
    banned: bool
    notes: str

class PlayerUpdate(BaseModel):
    steamId: str
    notes: Optional[str] = None
    banned: Optional[bool] = None

players_notes_db = {}  # store notes & bans keyed by steamId

def get_live_players_from_docker():
    try:
        # Replace with actual docker exec call to get live player data
        output = subprocess.check_output(
            ["docker", "exec", "devcontainer", "your_player_list_command"],
            text=True,
        )
        # TODO: parse real output here; currently dummy players:
        dummy_players = [
            Player(
                steamId="76561198000000001",
                name="PlayerOne",
                online=True,
                playtime=123,
                vacBanned=False,
                vpn=True,
                countryCode="us",
                countryName="United States",
                banned=False,
                notes="",
            ),
            Player(
                steamId="76561198000000002",
                name="PlayerTwo",
                online=False,
                playtime=45,
                vacBanned=True,
                vpn=False,
                countryCode="de",
                countryName="Germany",
                banned=False,
                notes="",
            ),
        ]
        return dummy_players
    except subprocess.CalledProcessError as e:
        print(f"Error querying docker container: {e}")
        return []

@app.get("/api/players", response_model=List[Player])
def get_players():
    live_players = get_live_players_from_docker()
    if not live_players:
        raise HTTPException(status_code=503, detail="No players found or server not running")

    # Merge notes and banned status from players_notes_db
    for p in live_players:
        if p.steamId in players_notes_db:
            p.notes = players_notes_db[p.steamId].get("notes", "")
            p.banned = players_notes_db[p.steamId].get("banned", False)
    return live_players

@app.post("/api/playerNotes")
def update_player(update: PlayerUpdate):
    if update.steamId not in players_notes_db:
        players_notes_db[update.steamId] = {"notes": "", "banned": False}
    if update.notes is not None:
        players_notes_db[update.steamId]["notes"] = update.notes
    if update.banned is not None:
        players_notes_db[update.steamId]["banned"] = update.banned
    return {"message": "Player notes updated"}
