#!/bin/bash
# start-server.sh - Install/Update + Start Project Zomboid server

# Paths
BASE_DIR="/project/workspace/gamefiles/projectzomboid"
SERVER_DIR="$BASE_DIR/server"
LOGS_DIR="$BASE_DIR/logs"
STEAMCMD_DIR="$BASE_DIR/steamcmd"
SCREEN_NAME="pzserver"

# Java memory settings
JAVA_OPTS="-Xms2G -Xmx4G -Djava.awt.headless=true"

# Ensure dirs exist
mkdir -p "$SERVER_DIR" "$LOGS_DIR" "$STEAMCMD_DIR"

echo "[`date +'%Y-%m-%d %H:%M:%S'`] Checking for SteamCMD..."
if [ ! -f "$STEAMCMD_DIR/steamcmd.sh" ]; then
    echo "[Info] Installing SteamCMD..."
    cd "$STEAMCMD_DIR"
    curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" | tar zxvf -
fi

echo "[`date +'%Y-%m-%d %H:%M:%S'`] Updating Project Zomboid Dedicated Server..."
"$STEAMCMD_DIR/steamcmd.sh" +force_install_dir "$SERVER_DIR" +login anonymous +app_update 380870 validate +quit

# Prevent double-start
if screen -list | grep -q "$SCREEN_NAME"; then
    echo "[Error] Server already running in screen session '$SCREEN_NAME'."
    exit 1
fi

echo "[`date +'%Y-%m-%d %H:%M:%S'`] Starting Project Zomboid server..."
cd "$SERVER_DIR"
screen -dmS "$SCREEN_NAME" bash -c "
    ./start-server.sh -servername MyZomboidServer -port 16261 >> '$LOGS_DIR/server.log' 2>&1
"

if [ $? -eq 0 ]; then
    echo "[`date +'%Y-%m-%d %H:%M:%S'`] Server started in screen session '$SCREEN_NAME'."
else
    echo "[Error] Failed to start server."
fi
