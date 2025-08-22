#!/bin/bash
set -euo pipefail

# === Paths ===
STEAMCMD_DIR="$HOME/steamcmd"
GAME_DIR="$(dirname "$(realpath "$0")")"
STEAMCMD="$STEAMCMD_DIR/steamcmd.sh"
LOG_DIR="$GAME_DIR/logs"

# === Detect game (first arg or default to PZ) ===
GAME="${1:-projectzomboid}"

# === Exit codes ===
# 0 = Success
# 1 = Unknown game
# 2 = Missing dependency
# 3 = Update failed
# 4 = Launch failed
# 5 = Port already in use

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

# === Logging ===
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/${GAME}_${TIMESTAMP}.log"

# Create/Update symlink to latest log
ln -sfn "$LOG_FILE" "$LOG_DIR/${GAME}_latest.log"

# Rotate logs: keep only last 10 per game
find "$LOG_DIR" -type f -name "${GAME}_*.log" | sort -r | tail -n +11 | xargs -r rm -f

exec > >(tee -a "$LOG_FILE") 2>&1

echo "[INFO] === Starting $GAME ==="
echo "[INFO] Logs will be saved to $LOG_FILE"

# === Graceful shutdown handling ===
SERVER_PID=""
cleanup() {
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "[INFO] Caught termination signal, shutting down $GAME (PID $SERVER_PID)..."
    kill "$SERVER_PID"
    wait "$SERVER_PID"
  fi
  echo "[INFO] Exiting."
}
trap cleanup SIGINT SIGTERM

# === Port check function ===
check_port() {
  local port=$1
  if command -v ss >/dev/null 2>&1; then
    if ss -ltn | grep -q ":$port "; then
      echo "[ERROR] Port $port is already in use!"
      exit 5
    fi
  elif command -v netstat >/dev/null 2>&1; then
    if netstat -tuln | grep -q ":$port "; then
      echo "[ERROR] Port $port is already in use!"
      exit 5
    fi
  else
    echo "[WARN] Neither ss nor netstat available, skipping port check."
  fi
}

# === Game-specific logic ===
case "$GAME" in
  projectzomboid)
    PORT=16261
    check_port "$PORT"

    echo "[INFO] Updating Project Zomboid Dedicated Server..."
    if ! "$STEAMCMD" +login anonymous +force_install_dir "$GAME_DIR" +app_update 380870 validate +quit; then
      echo "[ERROR] Failed to update Project Zomboid server."
      exit 3
    fi
    echo "[INFO] Starting Project Zomboid server on port $PORT..."
    cd "$GAME_DIR" || { echo "[ERROR] Cannot cd into $GAME_DIR"; exit 4; }
    ./start-server.sh -nosteam &
    SERVER_PID=$!
    wait "$SERVER_PID" || { echo "[ERROR] Failed to launch Project Zomboid server."; exit 4; }
    ;;

  dayz)
    PORT=2301
    check_port "$PORT"

    echo "[INFO] Updating DayZ Dedicated Server..."
    if ! "$STEAMCMD" +login anonymous +force_install_dir "$GAME_DIR" +app_update 223350 validate +quit; then
      echo "[ERROR] Failed to update DayZ server."
      exit 3
    fi
    echo "[INFO] Starting DayZ server on port $PORT..."
    cd "$GAME_DIR" || { echo "[ERROR] Cannot cd into $GAME_DIR"; exit 4; }
    ./DayZServer -config=serverDZ.cfg -port=$PORT -profiles=profiles -dologs -adminlog -netlog -freezecheck &
    SERVER_PID=$!
    wait "$SERVER_PID" || { echo "[ERROR] Failed to launch DayZ server."; exit 4; }
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
