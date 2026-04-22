#!/bin/bash

echo "=============================="
echo "  Starting Project Zomboid    "
echo "=============================="

# Resolve server directory
BASE_DIR="$HOME/ZomboidServer"
PID_FILE="$BASE_DIR/server.pid"

cd "$BASE_DIR" || {
  echo "❌ Failed to enter server directory: $BASE_DIR"
  exit 1
}

# Prevent duplicate server instances
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if ps -p "$OLD_PID" > /dev/null 2>&1; then
    echo "⚠️ Server already running with PID $OLD_PID"
    exit 1
  else
    echo "🧹 Removing stale PID file"
    rm -f "$PID_FILE"
  fi
fi

# Ensure server script exists
if [ ! -f "./ProjectZomboidServer.sh" ]; then
  echo "❌ Server launch script not found"
  exit 1
fi

# Optional Steam update (uncomment if needed)
# echo "🔄 Updating server via SteamCMD..."
# ./steamcmd.sh +login anonymous +app_update 380870 validate +quit

echo "🚀 Launching Project Zomboid Server..."

# Start server in background so we can capture PID
./ProjectZomboidServer.sh -servername MyServer &
SERVER_PID=$!

# Save PID for panel control
echo "$SERVER_PID" > "$PID_FILE"

echo "✅ Server started with PID $SERVER_PID"
echo "📄 PID saved to $PID_FILE"

# Wait so logs stay attached to terminal
wait $SERVER_PID

# Cleanup on exit
rm -f "$PID_FILE"

echo "🛑 Server stopped."