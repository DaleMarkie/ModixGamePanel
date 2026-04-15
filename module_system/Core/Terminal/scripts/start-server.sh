#!/bin/bash

echo "=============================="
echo " Starting Project Zomboid..."
echo "=============================="

cd ~/ZomboidServer || {
  echo "❌ Failed to enter server directory"
  exit 1
}

# Optional: update server
# ./steamcmd.sh +login anonymous +app_update 380870 validate +quit

echo "Launching server..."

./ProjectZomboidServer.sh -servername MyServer

echo "Server stopped."