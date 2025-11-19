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
        "id": "251570",
        "name": "7 Days to Die",
        "poster": "https://cdn.cloudflare.steamstatic.com/steam/apps/251570/header.jpg",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/251570/7_Days_to_Die/",
        "discord_url": "https://discord.com/invite/7daystodie",
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
        "id": "107410",
        "name": "Arma 3",
        "poster": "https://cdn.cloudflare.steamstatic.com/steam/apps/107410/header.jpg",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/107410/Arma_3/",
        "discord_url": "https://discord.gg/arma",
    },
    {
        "id": "346110",
        "name": "ARK: Survival Evolved",
        "poster": "https://cdn.cloudflare.steamstatic.com/steam/apps/346110/header.jpg",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/346110/ARK_Survival_Evolved/",
        "discord_url": "https://discord.com/invite/ark",
    },
    {
        "id": "440900",
        "name": "Conan Exiles",
        "poster": "https://cdn.cloudflare.steamstatic.com/steam/apps/440900/header.jpg",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/440900/Conan_Exiles/",
        "discord_url": "https://discord.com/invite/conanexiles",
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
        "id": "325980",
        "name": "The Isle",
        "poster": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/376210/header.jpg?t=1653237914",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/325980/The_Isle/",
        "discord_url": "https://discord.gg/theisle",
    },
    {
        "id": "275850",
        "name": "No Man's Sky",
        "poster": "https://cdn.cloudflare.steamstatic.com/steam/apps/275850/header.jpg",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/275850/No_Mans_Sky/",
        "discord_url": "https://discord.com/invite/nomanssky",
    },
    {
        "id": "minecraft",
        "name": "Minecraft",
        "poster": "https://upload.wikimedia.org/wikipedia/en/b/b6/Minecraft_2024_cover_art.png",
        "supported": True,
        "steam_url": "https://www.minecraft.net/",
        "discord_url": "https://discord.gg/minecraft",
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
        "id": "252490",
        "name": "Rust",
        "poster": "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/252490/Rust/",
        "discord_url": "https://discord.com/invite/playrust",
    },
    {
        "id": "526870",
        "name": "Satisfactory",
        "poster": "https://cdn.cloudflare.steamstatic.com/steam/apps/526870/header.jpg",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/526870/Satisfactory/",
        "discord_url": "https://discord.com/invite/satisfactory",
    },
    {
        "id": "513710",
        "name": "SCUM",
        "poster": "https://cdn.cloudflare.steamstatic.com/steam/apps/513710/header.jpg",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/513710/SCUM/",
        "discord_url": "https://discord.com/invite/scum",
    },
    {
        "id": "393380",
        "name": "Squad",
        "poster": "https://cdn.cloudflare.steamstatic.com/steam/apps/393380/header.jpg",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/393380/Squad/",
        "discord_url": "https://discord.gg/squad",
    },
    {
        "id": "244850",
        "name": "Space Engineers",
        "poster": "https://cdn.cloudflare.steamstatic.com/steam/apps/244850/header.jpg",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/244850/Space_Engineers/",
        "discord_url": "https://discord.gg/spaceengineers",
    },
    {
        "id": "108600",
        "name": "Project Zomboid",
        "poster": "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/108600/Project_Zomboid/",
        "discord_url": "https://discord.com/invite/theindiestone",
    },
    {
        "id": "892970",
        "name": "Valheim",
        "poster": "https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg",
        "supported": True,
        "steam_url": "https://store.steampowered.com/app/892970/Valheim/",
        "discord_url": "https://discord.gg/valheim",
    },
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
