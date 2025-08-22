#!/bin/bash
# status-server.sh - Check Project Zomboid server status

SCREEN_NAME="pzserver"

if screen -list | grep -q "[.]$SCREEN_NAME"; then
    echo "[`date +'%Y-%m-%d %H:%M:%S'`] Server is running in screen session '$SCREEN_NAME'."
else
    echo "[`date +'%Y-%m-%d %H:%M:%S'`] Server is NOT running."
fi
