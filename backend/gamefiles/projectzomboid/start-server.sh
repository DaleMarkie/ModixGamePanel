#!/bin/bash
set -e

# === Paths ===
STEAMCMD_DIR="$HOME/steamcmd"
GAME_DIR="$(dirname "$(realpath "$0")")"
STEAMCMD="$STEAMCMD_DIR/steamcmd.sh"

# === Install SteamCMD if missing ===
if [ ! -f "$STEAMCMD" ]; then
  echo "[INFO] Installing SteamCMD..."
  mkdir -p "$STEAMCMD_DIR"
  cd "$STEAMCMD_DIR"
  curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" | tar zxvf -
fi

# === Update Project Zomboid Dedicated Server ===
echo "[INFO] Updating Project Zomboid Dedicated Server..."
"$STEAMCMD" +login anonymous +force_install_dir "$GAME_DIR" +app_update 380870 validate +quit

# === Run the server directly ===
echo "[INFO] Starting Project Zomboid server..."
cd "$GAME_DIR"
exec ./start-server.sh -nosteam
