#!/bin/bash
set -e

# Run the Python server configuration script before starting the server
python3 /home/steam/game_server/steam_server_configure.py

# Start the specified Steam Dedicated Server
cd "$STEAMAPPDIR"

# Optionally, you can add custom server launch options here or pass them as environment variables
exec "$@"
