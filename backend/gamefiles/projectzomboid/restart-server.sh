#!/bin/bash
# start-server.sh - Install/Update + Start Project Zomboid Dedicated Server

set -euo pipefail

# ========= CONFIG =========
BASE_DIR="/project/workspace/gamefiles/projectzomboid"
SERVER_DIR="$BASE_DIR/server"
LOGS_DIR="$BASE_DIR/logs"
STEAMCMD_DIR="$BASE_DIR/steamcmd"
SCREEN_NAME="pzserver"

# Server launch options
SERVER_NAME="MyZomboidServer"
SERVER_PORT="16261"
JAVA_OPTS="-Xms2G -Xmx4G -Djava.awt.headless=true"

STEAMCMD_URL="https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz"
APP_ID="380870"   # Project Zomboid Dedicated Server
# ==========================

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

# Ensure dirs exist
mkdir -p "$SERVER_DIR" "$LOGS_DIR" "$STEAMCMD_DIR"

# Install/update SteamCMD if missing
if [[ ! -x "$STEAMCMD_DIR/steamcmd.sh" ]]; then
    log "SteamCMD not found, installing..."
    (
        cd "$STEAMCMD_DIR"
        curl -sSL "$STEAMCMD_URL" | tar zxvf - >/dev/null
    )
fi

# Update server files
log "Updating Project Zomboid Dedicated Server..."
"$STEAMCMD_DIR/steamcmd.sh" \
    +force_install_dir "$SERVER_DIR" \
    +login anonymous \
    +app_update "$APP_ID" validate \
    +quit

# Prevent double-start
if screen -list | grep -q "[.]$SCREEN_NAME"; then
    log "Error: Server already running in screen session '$SCREEN_NAME'."
    exit 1
fi

# Start server inside screen
log "Starting Project Zomboid server..."
(
    cd "$SERVER_DIR"
    screen -dmS "$SCREEN_NAME" bash -c "
        exec ./start-server.sh \
            -servername \"$SERVER_NAME\" \
            -port \"$SERVER_PORT\" \
            >> \"$LOGS_DIR/server.log\" 2>&1
    "
)

if screen -list | grep -q "[.]$SCREEN_NAME"; then
    log "Server successfully started in screen session '$SCREEN_NAME'."
    log "Use: screen -r $SCREEN_NAME  to attach."
else
    log "Error: Failed to start server."
    exit 1
fi
