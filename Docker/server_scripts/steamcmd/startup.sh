#!/bin/bash
set -e

cd "$STEAMAPPDIR"

echo "[${STEAMAPPID}] Starting generic SteamCMD server..."

# Split SERVER_ARGS string into array, preserving quoted args
EXTRA_ARGS=()
if [ -n "$SERVER_ARGS" ]; then
    # shellcheck disable=SC2206
    EXTRA_ARGS=( $SERVER_ARGS )
fi

# Try common launch scripts or binaries
if [ -f ./start-server.sh ]; then
    echo "[${STEAMAPPID}] Found start-server.sh, executing..."
    exec bash ./start-server.sh "$@"
elif [ -f ./run.sh ]; then
    echo "[${STEAMAPPID}] Found run.sh, executing..."
    exec bash ./run.sh "$@"
elif [ -f ./server ]; then
    echo "[${STEAMAPPID}] Found server binary, executing..."
    exec ./server "$@"
else
    echo "[${STEAMAPPID}] No known startup script or binary found in $STEAMAPPDIR."
    echo "[${STEAMAPPID}] Please use CUSTOM_START_SCRIPT env with startup command for your server."
    ls -l
    if [ "$MODIX_DEBUG" = "true" ]; then
        # In debug mode, do not exit with error
        :
    else
        exit 1
    fi
fi
