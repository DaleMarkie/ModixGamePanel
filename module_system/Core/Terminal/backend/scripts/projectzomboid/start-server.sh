#!/bin/bash
# start-server.sh - Start Project Zomboid server

PZ_SERVER_DIR="/Core/Terminal/backend/scripts/projectzomboid"
PZ_JAR="$PZ_SERVER_DIR/ProjectZomboid.jar"
PZ_LOGS="$PZ_SERVER_DIR/logs"
JAVA_OPTS="-Xms2G -Xmx4G -Djava.awt.headless=true"
SCREEN_NAME="pzserver"

mkdir -p "$PZ_LOGS"

echo "[`date +'%Y-%m-%d %H:%M:%S'`] Starting Project Zomboid server..."

if screen -list | grep -q "$SCREEN_NAME"; then
    echo "[Error] Server already running in screen session '$SCREEN_NAME'."
    exit 1
fi

screen -dmS "$SCREEN_NAME" bash -c "
cd '$PZ_SERVER_DIR';
java $JAVA_OPTS -jar '$PZ_JAR' -server >> '$PZ_LOGS/server.log' 2>&1
"

if [ $? -eq 0 ]; then
    echo "[`date +'%Y-%m-%d %H:%M:%S'`] Server started in screen session '$SCREEN_NAME'."
else
    echo "[Error] Failed to start server."
fi
