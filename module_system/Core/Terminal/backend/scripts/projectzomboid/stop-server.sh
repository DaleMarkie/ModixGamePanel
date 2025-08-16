#!/bin/bash
# stop-server.sh - Stop Project Zomboid server

SCREEN_NAME="pzserver"

if screen -list | grep -q "$SCREEN_NAME"; then
    echo "[`date +'%Y-%m-%d %H:%M:%S'`] Stopping Project Zomboid server..."
    screen -S "$SCREEN_NAME" -X stuff "quit$(printf \\r)"
    sleep 5
    # Ensure it stopped
    if screen -list | grep -q "$SCREEN_NAME"; then
        echo "[`date +'%Y-%m-%d %H:%M:%S'`] Server did not stop, forcing quit..."
        screen -S "$SCREEN_NAME" -X quit
    fi
    echo "[`date +'%Y-%m-%d %H:%M:%S'`] Server stopped."
else
    echo "[Info] No running server found."
fi
