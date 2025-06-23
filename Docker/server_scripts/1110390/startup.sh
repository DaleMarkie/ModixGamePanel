#!/bin/bash
# Example: Start unturned server (appid 1110390)
set -e

cd "$STEAMAPPDIR"

echo "[${STEAMAPPID}] Starting Unturned server..."

# Split SERVER_ARGS string into array, preserving quoted args
EXTRA_ARGS=()
if [ -n "$SERVER_ARGS" ]; then
    # shellcheck disable=SC2206
    EXTRA_ARGS=( $SERVER_ARGS )
fi

if [ -f ./Unturned_Headless.x86_64 ]; then
    exec ./Unturned_Headless.x86_64 -batchmode -nographics -logfile server.log "$@"
else
    echo "[${STEAMAPPID}] Unturned_Headless.x86_64 not found!"
    if [ "$MODIX_DEBUG" = "true" ]; then
        # In debug mode, do not exit with error
        :
    else
        exit 1
    fi
fi
