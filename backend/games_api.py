from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import os
import json
import psutil
import platform

router = APIRouter()

# Paths
GAMES_PATH = os.path.expanduser("~/Games")
ACTIVE_GAME_FILE = os.path.join(GAMES_PATH, "active_game.json")
GAMES_SCRIPT_FILE = os.path.join(GAMES_PATH, "games_scripts.json")
os.makedirs(GAMES_PATH, exist_ok=True)

# --------------------------
# Linux check (GLOBAL)
# --------------------------
def is_linux():
    return platform.system().lower() == "linux"

# --------------------------
# Supported games (Linux only)
# --------------------------
SUPPORTED_GAMES = [
    {
        "id": "minecraft",
        "name": "Minecraft",
        "poster": "https://upload.wikimedia.org/wikipedia/en/b/b6/Minecraft_2024_cover_art.png",
        "supported": True,
        "minimum_requirements": {
            "cpu": 2,
            "ram": 4,
            "disk": 1
        }
    },
    {
        "id": "rust",
        "name": "Rust",
        "poster": "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
        "supported": True,
        "minimum_requirements": {
            "cpu": 4,
            "ram": 8,
            "disk": 20
        }
    },
    {
        "id": "valheim",
        "name": "Valheim",
        "poster": "https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg",
        "supported": True,
        "minimum_requirements": {
            "cpu": 2,
            "ram": 4,
            "disk": 1
        }
    },
]

# --------------------------
# Helpers
# --------------------------
def get_active_game():
    if os.path.isfile(ACTIVE_GAME_FILE):
        try:
            with open(ACTIVE_GAME_FILE, "r") as f:
                return json.load(f)
        except:
            return None
    return None


def set_active_game(game_id: str, start_script: str = None):
    game = next((g for g in SUPPORTED_GAMES if g["id"] == game_id), None)
    if not game:
        return None

    active_data = {
        "id": game["id"],
        "name": game["name"],
        "poster": game["poster"],
        "minimum_requirements": game["minimum_requirements"],
        "os": "linux"
    }

    if start_script:
        active_data["start_script"] = start_script

    with open(ACTIVE_GAME_FILE, "w") as f:
        json.dump(active_data, f)

    scripts = {}
    if os.path.isfile(GAMES_SCRIPT_FILE):
        try:
            with open(GAMES_SCRIPT_FILE, "r") as f:
                scripts = json.load(f)
        except:
            pass

    if start_script:
        scripts[game_id] = start_script
        with open(GAMES_SCRIPT_FILE, "w") as f:
            json.dump(scripts, f)

    return active_data


def deactivate_game():
    if os.path.isfile(ACTIVE_GAME_FILE):
        os.remove(ACTIVE_GAME_FILE)
    return True


# --------------------------
# Server specs (Linux enforced)
# --------------------------
def get_server_specs():
    cpu_cores = psutil.cpu_count(logical=True)
    ram_gb = round(psutil.virtual_memory().total / (1024**3), 1)
    disk_gb = round(psutil.disk_usage("/").free / (1024**3), 1)

    return {
        "cpuCores": cpu_cores,
        "ramGB": ram_gb,
        "diskGB": disk_gb,
        "os": platform.system(),
        "isLinux": is_linux()
    }


# --------------------------
# Endpoints
# --------------------------
@router.get("/api/games")
async def list_games():
    server_specs = get_server_specs()

    # HARD BLOCK if not Linux
    if not server_specs["isLinux"]:
        return JSONResponse(
            {
                "error": "Linux is required to host servers.",
                "server_specs": server_specs
            },
            status_code=403
        )

    scripts = {}
    if os.path.isfile(GAMES_SCRIPT_FILE):
        try:
            with open(GAMES_SCRIPT_FILE, "r") as f:
                scripts = json.load(f)
        except:
            pass

    games = []
    for g in SUPPORTED_GAMES:
        g_copy = g.copy()
        if g["id"] in scripts:
            g_copy["start_script"] = scripts[g["id"]]
        games.append(g_copy)

    return {
        "games": games,
        "active_game": get_active_game(),
        "server_specs": server_specs,
    }


@router.post("/api/set-active-game")
async def activate_game(request: Request):
    if not is_linux():
        return JSONResponse(
            {"error": "Only Linux servers are allowed."},
            status_code=403
        )

    data = await request.json()
    app_id = data.get("appId")
    start_script = data.get("startScript")  # renamed from batchPath

    if not app_id:
        deactivate_game()
        return {
            "success": True,
            "message": "Game deactivated.",
            "active_game": None
        }

    game = set_active_game(app_id, start_script)

    if not game:
        return JSONResponse(
            {"error": "Game not found."},
            status_code=404
        )

    return {
        "success": True,
        "message": f"{game['name']} activated (Linux).",
        "active_game": game
    }