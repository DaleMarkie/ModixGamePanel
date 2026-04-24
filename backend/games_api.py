import os
from fastapi import APIRouter

router = APIRouter()

# =========================================================
# 🐧 GAME DATABASE
# =========================================================

GAMES_DB = [
    {
        "id": "projectzomboid",
        "name": "Project Zomboid",
        "supported": True,
        "cpu": 2,
        "ram": 4,
        "disk": 5,
        "os": "linux",
        "description": "Hardcore zombie survival dedicated server",
    },
    {
        "id": "rust",
        "name": "Rust",
        "supported": False,
        "cpu": 4,
        "ram": 8,
        "disk": 25,
        "os": "linux",
        "description": "PvP survival sandbox (requires Wine/SteamCMD)",
    },
    {
        "id": "dayz",
        "name": "DayZ",
        "supported": False,
        "cpu": 4,
        "ram": 8,
        "disk": 20,
        "os": "linux",
        "description": "Open world survival server",
    },
]


# =========================================================
# 📦 LIST ALL GAMES
# =========================================================

@router.get("/list")
def list_games():
    return {
        "status": "ok",
        "count": len(GAMES_DB),
        "games": GAMES_DB
    }


# =========================================================
# 🧠 CHECK SYSTEM REQUIREMENTS
# =========================================================

@router.post("/check")
def check_requirements(payload: dict):
    game_id = payload.get("game_id")
    cpu = payload.get("cpu", 0)
    ram = payload.get("ram", 0)
    os_type = payload.get("os", "").lower()

    game = next((g for g in GAMES_DB if g["id"] == game_id), None)

    if not game:
        return {"error": "Game not found"}

    compatible = (
        cpu >= game["cpu"]
        and ram >= game["ram"]
        and os_type == "linux"
    )

    return {
        "game": game,
        "compatible": compatible
    }


# =========================================================
# 🐧 INSTALL SCRIPT GENERATOR
# =========================================================

@router.get("/install-script/{game_id}")
def install_script(game_id: str):
    game = next((g for g in GAMES_DB if g["id"] == game_id), None)

    if not game:
        return {"error": "Game not found"}

    script = f"""#!/bin/bash
echo "🐧 Installing {game['name']} Server Stack..."

sudo apt update && sudo apt upgrade -y

# Core dependencies
sudo apt install -y curl wget git unzip lib32gcc-s1 lib32stdc++6

# SteamCMD
mkdir -p ~/steamcmd
cd ~/steamcmd
wget https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz
tar -xvzf steamcmd_linux.tar.gz

"""

    # Wine only for non-native Linux servers
    if not game["supported"]:
        script += """
# Wine support (Windows server compatibility layer)
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install -y wine64 wine32
"""

    # Game-specific extras
    if game_id == "projectzomboid":
        script += """
# Java dependency (Project Zomboid)
sudo apt install -y openjdk-17-jre
"""

    script += f"""
echo "✅ {game['name']} installation complete"
"""

    return {
        "game": game["name"],
        "script": script
    }


# =========================================================
# 🚀 INSTALL JOB (FUTURE HOOK)
# =========================================================

@router.post("/install")
def install_game(payload: dict):
    game_id = payload.get("game_id")

    game = next((g for g in GAMES_DB if g["id"] == game_id), None)

    if not game:
        return {"error": "Game not found"}

    # Placeholder for future automation (Docker / SteamCMD / service deploy)
    return {
        "status": "queued",
        "game": game["name"],
        "message": "Install job created (not executed yet)"
    }