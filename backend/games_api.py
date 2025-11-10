# backend/games_api.py
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import os, json

router = APIRouter()

GAMES_PATH = os.path.expanduser("~/Games")
ACTIVE_GAME_FILE = os.path.join(GAMES_PATH, "active_game.json")
os.makedirs(GAMES_PATH, exist_ok=True)

SUPPORTED_GAMES = [
    {"id": "108600", "name": "Project Zomboid", "poster": "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg", "supported": True},
    {"id": "294100", "name": "RimWorld", "poster": "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/294100/header.jpg", "supported": True},
    {"id": "346110", "name": "ARK: Survival Evolved", "poster": "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/346110/header.jpg", "supported": False},
]

def get_active_game():
    if os.path.isfile(ACTIVE_GAME_FILE):
        try:
            with open(ACTIVE_GAME_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return None
    return None

def set_active_game(game_id, batch_path=None):
    game = next((g for g in SUPPORTED_GAMES if g["id"] == game_id and g["supported"]), None)
    if not game:
        return None
    # Save batch path if provided
    active_data = {"id": game["id"], "name": game["name"], "poster": game["poster"]}
    if batch_path:
        active_data["batch_path"] = batch_path
    with open(ACTIVE_GAME_FILE, "w", encoding="utf-8") as f:
        json.dump(active_data, f)
    return active_data

def deactivate_game():
    if os.path.isfile(ACTIVE_GAME_FILE):
        os.remove(ACTIVE_GAME_FILE)
    return True

@router.get("/api/games")
async def list_games():
    return {"games": SUPPORTED_GAMES, "active_game": get_active_game()}

@router.post("/api/set-active-game")
async def activate_game(request: Request):
    data = await request.json()
    appId = data.get("appId")
    batch_path = data.get("batchPath")  # optional
    if not appId:
        deactivate_game()
        return {"success": True, "message": "Game deactivated.", "active_game": None}
    game = set_active_game(appId, batch_path)
    if not game:
        return JSONResponse({"error": "Game not found or unsupported."}, status_code=404)
    return {"success": True, "message": f"{game['name']} activated.", "active_game": game}
