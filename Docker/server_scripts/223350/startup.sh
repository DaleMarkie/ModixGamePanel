#!/bin/bash
set -e

# DayZ Dedicated Server Startup Script
# Usage: ./startup.sh

# Set working directory to server root
cd "$(dirname "$0")/dayzserver"

# Ensure dependencies are installed (see dependincys.sh)
./dependincys.sh || true

# Start the DayZ server
# You may want to adjust the executable path and arguments as needed
./DayZServer_x64 -config=serverDZ.cfg -port=2302 -dologs -adminlog -netlog -freezecheck "$@"
