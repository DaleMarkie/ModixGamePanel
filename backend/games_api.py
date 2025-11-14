# backend/games_api.py
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import os
import json

router = APIRouter()

# Paths
GAMES_PATH = os.path.expanduser("~/Games")
ACTIVE_GAME_FILE = os.path.join(GAMES_PATH, "active_game.json")
GAMES_BATCH_FILE = os.path.join(GAMES_PATH, "games_paths.json")
os.makedirs(GAMES_PATH, exist_ok=True)

# Full supported games list
SUPPORTED_GAMES = [
    {
        "id": "108600",
        "name": "Project Zomboid",
        "poster": "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/108600/Project_Zomboid/",
        "discord_url": "https://discord.com/invite/theindiestone",
    },
    {
        "id": "1909850",
        "name": "Arma Reforger",
        "poster": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1874880/capsule_616x353.jpg?t=1762168272",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/1909850/Arma_Reforger/",
        "discord_url": "https://discord.gg/arma",
    },
    {
        "id": "221100",
        "name": "DayZ",
        "poster": "https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/221100/DayZ/",
        "discord_url": "https://discord.com/invite/dayz",
    },
    {
        "id": "294100",
        "name": "RimWorld",
        "poster": "https://wallpapercave.com/wp/wp3935722.png",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/294100/RimWorld/",
        "discord_url": "https://discord.com/invite/rimworld",
    },
    {
        "id": "346110",
        "name": "ARK: Survival Evolved",
        "poster": "https://cdn.cloudflare.steamstatic.com/steam/apps/346110/header.jpg",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/346110/ARK_Survival_Evolved/",
        "discord_url": "https://discord.com/invite/ark",
    },
    # add other games as needed...
]

def get_active_game():
    if os.path.isfile(ACTIVE_GAME_FILE):
        try:
            with open(ACTIVE_GAME_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return None
    return None

def set_active_game(game_id: str, batch_path: str = None):
    game = next((g for g in SUPPORTED_GAMES if g["id"] == game_id and g["supported"]), None)
    if not game:
        return None

    active_data = {
        "id": game["id"],
        "name": game["name"],
        "poster": game["poster"],
        "steam_url": game.get("steam_url"),
        "discord_url": game.get("discord_url"),
    }
    if batch_path:
        active_data["batch_path"] = batch_path

    with open(ACTIVE_GAME_FILE, "w", encoding="utf-8") as f:
        json.dump(active_data, f)

    # Save/update batch paths for all games
    games_paths = {}
    if os.path.isfile(GAMES_BATCH_FILE):
        try:
            with open(GAMES_BATCH_FILE, "r", encoding="utf-8") as f:
                games_paths = json.load(f)
        except:
            pass

    if batch_path:
        games_paths[game_id] = batch_path
        with open(GAMES_BATCH_FILE, "w", encoding="utf-8") as f:
            json.dump(games_paths, f)

    return active_data

def deactivate_game():
    if os.path.isfile(ACTIVE_GAME_FILE):
        os.remove(ACTIVE_GAME_FILE)
    return True

@router.get("/api/games")
async def list_games():
    # Include batch paths in the game list
    games_paths = {}
    if os.path.isfile(GAMES_BATCH_FILE):
        try:
            with open(GAMES_BATCH_FILE, "r", encoding="utf-8") as f:
                games_paths = json.load(f)
        except:
            pass

    games_with_paths = []
    for g in SUPPORTED_GAMES:
        game_copy = g.copy()
        if g["id"] in games_paths:
            game_copy["batch_path"] = games_paths[g["id"]]
        games_with_paths.append(game_copy)

    return {
        "games": games_with_paths,
        "active_game": get_active_game(),
    }

@router.post("/api/set-active-game")
async def activate_game(request: Request):
    data = await request.json()
    app_id = data.get("appId")
    batch_path = data.get("batchPath")  # optional

    if not app_id:
        deactivate_game()
        return {"success": True, "message": "Game deactivated.", "active_game": None}

    game = set_active_game(app_id, batch_path)
    if not game:
        return JSONResponse({"error": "Game not found or unsupported."}, status_code=404)

    return {"success": True, "message": f"{game['name']} activated.", "active_game": game}
