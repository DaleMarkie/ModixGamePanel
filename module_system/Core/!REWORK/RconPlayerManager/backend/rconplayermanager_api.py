import logging
import subprocess
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from fastapi import APIRouter

router = APIRouter()
router = APIRouter(tags=["RconPlayerManager"], prefix="/rcon/PlayerManager")
logger = logging.getLogger("rcon_api")

# Middleware should be added in the main FastAPI app, not in the router.
# Remove or move this to your main application entrypoint.

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

def find_pz_container():
    try:
        # Change "projectzomboid" to your actual container name or filter string
        container_ids = subprocess.check_output(
            ['docker', 'ps', '--filter', 'name=projectzomboid', '--format', '{{.ID}}'],
            text=True,
        ).strip().split('\n')
        if container_ids and container_ids[0]:
            return container_ids[0]
        return None
    except subprocess.CalledProcessError as e:
        print(f"Error finding Project Zomboid container: {e}")
        return None

def get_live_players_from_docker():
    container_id = find_pz_container()
    if not container_id:
        print("No Project Zomboid container running")
        return []

    try:
        # Replace 'your_player_list_command' with actual command inside container to get player data
        output = subprocess.check_output(
            ["docker", "exec", container_id, "your_player_list_command"],
            text=True,
        )
        # TODO: parse output string into Player instances properly
        # For now, return dummy data
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

@router.get("/api/players", response_model=List[Player])
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

@router.post("/api/playerNotes")
def update_player(update: PlayerUpdate):
    if update.steamId not in players_notes_db:
        players_notes_db[update.steamId] = {"notes": "", "banned": False}
    if update.notes is not None:
        players_notes_db[update.steamId]["notes"] = update.notes
    if update.banned is not None:
        players_notes_db[update.steamId]["banned"] = update.banned
    return {"message": "Player notes updated"}
