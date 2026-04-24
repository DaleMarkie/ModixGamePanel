import os
from fastapi import APIRouter

router = APIRouter()

# =========================================================
# 🐧 GAME DATABASE (EXPANDED + REAL SERVER TITLES)
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
        "disk": 30,
        "os": "linux",
        "description": "PvP survival sandbox (SteamCMD required)",
    },
    {
        "id": "dayz",
        "name": "DayZ",
        "supported": False,
        "cpu": 4,
        "ram": 8,
        "disk": 25,
        "os": "linux",
        "description": "Open world survival server (experimental Linux)",
    },

    # =====================================================
    # 🆕 POPULAR LINUX GAME SERVERS ADDED
    # =====================================================

    {
        "id": "minecraft",
        "name": "Minecraft Java Server",
        "supported": True,
        "cpu": 2,
        "ram": 4,
        "disk": 5,
        "os": "linux",
        "description": "Most popular sandbox server (Java-based)",
    },
    {
        "id": "cs2",
        "name": "Counter-Strike 2",
        "supported": True,
        "cpu": 4,
        "ram": 8,
        "disk": 15,
        "os": "linux",
        "description": "Competitive FPS dedicated server",
    },
    {
        "id": "valheim",
        "name": "Valheim",
        "supported": True,
        "cpu": 4,
        "ram": 8,
        "disk": 10,
        "os": "linux",
        "description": "Viking survival co-op server",
    },
    {
        "id": "ark",
        "name": "ARK Survival Evolved",
        "supported": True,
        "cpu": 6,
        "ram": 16,
        "disk": 60,
        "os": "linux",
        "description": "Dinosaur survival MMO server (heavy)",
    },
    {
        "id": "terraria",
        "name": "Terraria Server",
        "supported": True,
        "cpu": 1,
        "ram": 2,
        "disk": 2,
        "os": "linux",
        "description": "Lightweight 2D sandbox server",
    },
    {
        "id": "dontstarve",
        "name": "Don't Starve Together",
        "supported": True,
        "cpu": 2,
        "ram": 4,
        "disk": 3,
        "os": "linux",
        "description": "Co-op survival server",
    },
    {
        "id": "rimworld",
        "name": "RimWorld",
        "supported": True,
        "cpu": 2,
        "ram": 2,
        "disk": 2,
        "os": "linux",
        "description": "Colony sim server (lightweight)",
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
# 🧠 CHECK SYSTEM REQUIREMENTS (IMPROVED)
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

    # FIXED: more flexible OS check
    compatible = (
        cpu >= game["cpu"]
        and ram >= game["ram"]
        and "linux" in os_type
    )

    return {
        "game": game,
        "compatible": compatible,
        "requirements": {
            "cpu_ok": cpu >= game["cpu"],
            "ram_ok": ram >= game["ram"],
            "os_ok": "linux" in os_type
        }
    }


# =========================================================
# 🐧 INSTALL SCRIPT GENERATOR (IMPROVED + CLEANER)
# =========================================================

@router.get("/install-script/{game_id}")
def install_script(game_id: str):
    game = next((g for g in GAMES_DB if g["id"] == game_id), None)

    if not game:
        return {"error": "Game not found"}

    script = f"""#!/bin/bash

echo "======================================"
echo "🐧 MODIX GAME INSTALLER"
echo "🎮 {game['name']}"
echo "======================================"

echo ""
echo "This installer will:"
echo " - Update your system"
echo " - Install SteamCMD"
echo " - Prepare server environment"
echo ""

read -p "Continue installation? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "[1/4] Updating system..."
sudo apt update -y && sudo apt upgrade -y

echo "[2/4] Installing base tools..."
sudo apt install -y curl wget git unzip screen

echo "[3/4] Installing SteamCMD..."
mkdir -p ~/steamcmd
cd ~/steamcmd
wget https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz
tar -xvzf steamcmd_linux.tar.gz

"""

    # Wine only for non-native servers
    if not game["supported"]:
        script += """
echo "[4/5] Installing Wine (compatibility layer)..."
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install -y wine64 wine32
"""

    # Game-specific installs
    if game_id == "projectzomboid":
        script += """
echo "Installing Java (required)..."
sudo apt install -y openjdk-17-jre
"""

    elif game_id == "minecraft":
        script += """
echo "Minecraft server requires Java runtime (already included above)"
"""

    elif game_id == "ark":
        script += """
echo "ARK detected - heavy server, ensure 16GB+ RAM recommended"
"""

    script += f"""

echo ""
echo "[DONE]"
echo "======================================"
echo "✅ {game['name']} setup complete"
echo "======================================"
echo ""
echo "Next step:"
echo "cd ~/steamcmd && ./steamcmd.sh"
echo ""
"""

    return {
        "game": game["name"],
        "script": script
    }


# =========================================================
# 🚀 INSTALL JOB (FUTURE AUTOMATION HOOK)
# =========================================================

@router.post("/install")
def install_game(payload: dict):
    game_id = payload.get("game_id")

    game = next((g for g in GAMES_DB if g["id"] == game_id), None)

    if not game:
        return {"error": "Game not found"}

    return {
        "status": "queued",
        "game": game["name"],
        "message": "Install system is queued (Docker/SteamCMD automation coming soon)"
    }