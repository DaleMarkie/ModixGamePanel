#!/bin/bash
# stop-server.sh - Stop Project Zomboid server

SCREEN_NAME="pzserver"

if screen -list | grep -q "$SCREEN_NAME"; then
    echo "[`date +'%Y-%m-%d %H:%M:%S'`] Stopping Project Zomboid server..."
    screen -S "$SCREEN_NAME" -X quit
    echo "[`date +'%Y-%m-%d %H:%M:%S'`] Server stopped."
else
    echo "[Error] No running server session found ($SCREEN_NAME)."
fi
