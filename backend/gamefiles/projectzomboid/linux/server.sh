#!/bin/bash
# Project Zomboid server startup script (Linux)
# Default SteamCMD installation path: ~/Steam/steamapps/common/ProjectZomboid

# Change to server directory
cd ~/Steam/steamapps/common/ProjectZomboid

# Run the server
./start-server.sh -servername MyServer -port 16261
