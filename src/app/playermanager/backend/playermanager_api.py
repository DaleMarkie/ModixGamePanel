from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from rcon import Client as RconClient
import os

app = FastAPI()

# RCON config - ideally load from environment variables or config file
RCON_HOST = os.getenv("RCON_HOST", "127.0.0.1")
RCON_PORT = int(os.getenv("RCON_PORT", "25575"))
RCON_PASSWORD = os.getenv("RCON_PASSWORD", "your_rcon_password")

# --- Models ---

class Player(BaseModel):
    steamId: str
    name: str
    online: bool
    playtime: int  # minutes
    banned: bool = False
    notes: Optional[str] = None

class KickRequest(BaseModel):
    steamId: str

class BanRequest(BaseModel):
    steamId: str
    ban: bool

# --- Helper functions ---

def send_rcon_command(command: str) -> str:
    try:
        with RconClient(RCON_HOST, RCON_PORT, RCON_PASSWORD) as client:
            response = client.run(command)
            return response
    except Exception as e:
        raise RuntimeError(f"RCON error: {str(e)}")

def parse_player_list(rcon_response: str) -> List[Player]:
    """
    Parses the RCON response containing player info into Player objects.
    This depends on your game's RCON output format.
    Example assumed format (one player per line):
    steamId|name|online|playtime|banned
    """
    players = []
    lines = rcon_response.strip().splitlines()
    for line in lines:
        parts = line.split("|")
        if len(parts) < 5:
            continue
        steamId, name, online_str, playtime_str, banned_str = parts
        players.append(
            Player(
                steamId=steamId.strip(),
                name=name.strip(),
                online=online_str.strip().lower() == "true",
                playtime=int(playtime_str.strip()),
                banned=banned_str.strip().lower() == "true",
            )
        )
    return players

# --- API endpoints ---

@app.get("/api/rcon/players", response_model=List[Player])
def get_players():
    try:
        # Replace the command below with your game's RCON command to list players
        rcon_cmd = "list_players"
        response = send_rcon_command(rcon_cmd)
        players = parse_player_list(response)
        return players
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/rcon/kick")
def kick_player(request: KickRequest):
    try:
        # Example RCON command to kick player by SteamID
        cmd = f"kick {request.steamId}"
        response = send_rcon_command(cmd)
        # Optionally parse response to confirm success
        return {"success": True, "message": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/rcon/ban")
def ban_player(request: BanRequest):
    try:
        if request.ban:
            cmd = f"ban {request.steamId}"
        else:
            cmd = f"unban {request.steamId}"
        response = send_rcon_command(cmd)
        return {"success": True, "message": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
