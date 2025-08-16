#!/bin/bash
# File: stop-server.sh
# Purpose: Stop Project Zomboid server

PZ_SERVER_NAME="start-server.sh" # or the real server process/container name

# Kill process by script name
pkill -f "$PZ_SERVER_NAME"

echo "Project Zomboid server stopped."
