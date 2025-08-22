#!/bin/bash
# logs-server.sh - Stream Project Zomboid server logs live

PZ_LOGS="/Core/Terminal/backend/scripts/projectzomboid/logs/server.log"

if [ ! -f "$PZ_LOGS" ]; then
    echo "[Error] Log file does not exist: $PZ_LOGS"
    exit 1
fi

echo "[`date +'%Y-%m-%d %H:%M:%S'`] Streaming logs. Press Ctrl+C to stop."
tail -f "$PZ_LOGS"
