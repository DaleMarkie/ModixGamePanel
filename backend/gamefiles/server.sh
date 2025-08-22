#!/bin/bash
set -euo pipefail

# === Paths ===
STEAMCMD_DIR="$HOME/steamcmd"
GAME_DIR="$(dirname "$(realpath "$0")")"
STEAMCMD="$STEAMCMD_DIR/steamcmd.sh"

# === Detect game (first arg or default to PZ) ===
GAME="${1:-projectzomboid}"

# === Exit codes ===
# 0 = Success
# 1 = Unknown game
# 2 = Missing dependency
# 3 = Update failed
# 4 = Launch failed

# === Ensure SteamCMD Installed ===
if [ ! -f "$STEAMCMD" ]; then
  echo "[INFO] Installing SteamCMD..."
  mkdir -p "$STEAMCMD_DIR"
  cd "$STEAMCMD_DIR" || { echo "[ERROR] Cannot cd into $STEAMCMD_DIR"; exit 2; }
  if ! curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" | tar zxvf -; then
    echo "[ERROR] Failed to download/extract SteamCMD."
    exit 2
  fi
fi

# === Game-specific logic ===
case "$GAME" in
  projectzomboid)
    echo "[INFO] Updating Project Zomboid Dedicated Server..."
    if ! "$STEAMCMD" +login anonymous +force_install_dir "$GAME_DIR" +app_update 380870 validate +quit; then
      echo "[ERROR] Failed to update Project Zomboid server."
      exit 3
    fi
    echo "[INFO] Starting Project Zomboid server..."
    cd "$GAME_DIR" || { echo "[ERROR] Cannot cd into $GAME_DIR"; exit 4; }
    exec ./start-server.sh -nosteam || { echo "[ERROR] Failed to launch Project Zomboid server."; exit 4; }
    ;;

  dayz)
    echo "[INFO] Updating DayZ Dedicated Server..."
    if ! "$STEAMCMD" +login anonymous +force_install_dir "$GAME_DIR" +app_update 223350 validate +quit; then
      echo "[ERROR] Failed to update DayZ server."
      exit 3
    fi
    echo "[INFO] Starting DayZ server..."
    cd "$GAME_DIR" || { echo "[ERROR] Cannot cd into $GAME_DIR"; exit 4; }
    exec ./DayZServer -config=serverDZ.cfg -port=2301 -profiles=profiles -dologs -adminlog -netlog -freezecheck || {
      echo "[ERROR] Failed to launch DayZ server."
      exit 4
    }
    ;;

  rimworld)
    echo "[INFO] RimWorld does not support a dedicated server via SteamCMD."
    echo "[INFO] No automatic update or start available."
    exit 0
    ;;

  *)
    echo "[ERROR] Unknown game: $GAME"
    echo "Usage: $0 {projectzomboid|dayz|rimworld}"
    exit 1
    ;;
esac
