#!/bin/bash
set -e

# Start the Project Zomboid Dedicated Server
cd "$STEAMAPPDIR"

# Optionally, you can add custom server launch options here
exec ./start-server.sh -servername "${SERVER_NAME:-PZServer}"
