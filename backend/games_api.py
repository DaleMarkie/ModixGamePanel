from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import os
import json
import psutil  # pip install psutil
import platform

router = APIRouter()

# Paths
GAMES_PATH = os.path.expanduser("~/Games")
ACTIVE_GAME_FILE = os.path.join(GAMES_PATH, "active_game.json")
GAMES_BATCH_FILE = os.path.join(GAMES_PATH, "games_paths.json")
os.makedirs(GAMES_PATH, exist_ok=True)

# Full supported games list
SUPPORTED_GAMES = [
    {
        "id": "251570",
        "name": "7 Days to Die",
        "poster": "https://cdn.cloudflare.steamstatic.com/steam/apps/251570/header.jpg",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/251570/7_Days_to_Die/",
        "discord_url": "https://discord.com/invite/7daystodie",
        "minimum_requirements": {
            "cpu": 1,     # cores
            "ram": 8,     # GB
            "disk": 15     # GB free space
        }
    },
    # Add other games similarly...
]

# --------------------------
# Helper functions
# --------------------------
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
        "minimum_requirements": game.get("minimum_requirements")
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

# --------------------------
# Get real server specs
# --------------------------
def get_server_specs():
    cpu_cores = psutil.cpu_count(logical=True)
    ram_gb = round(psutil.virtual_memory().total / (1024**3), 1)
    disk_gb = round(psutil.disk_usage("/").free / (1024**3), 1)
    os_name = platform.system() + " " + platform.release()
    return {
        "cpuCores": cpu_cores,
        "ramGB": ram_gb,
        "diskGB": disk_gb,
        "os": os_name,
    }

# --------------------------
# Endpoints
# --------------------------
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

    active_game = get_active_game()
    server_specs = get_server_specs()

    return {
        "games": games_with_paths,
        "active_game": active_game,
        "server_specs": server_specs,  # real server specs for Minimum Requirements
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
