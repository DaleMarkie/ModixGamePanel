#!/bin/bash
# Example: Start Project Zomboid server (appid 108600)
set -e

cd "$STEAMAPPDIR"

# Create symbolic link if it doesn't exist
if [ ! -L /root/Zomboid ] && [ ! -e /root/Zomboid ]; then
    ln -s /home/steam/pzserver /root/Zomboid
fi

echo "[${STEAMAPPID}] Starting Project Zomboid server..."

# Set defaults if not provided
ADMIN_USERNAME=${ADMIN_USERNAME:-admin}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-changeme}
SERVER_NAME=${SERVER_NAME:-servertest}

# Split SERVER_ARGS string into array, preserving quoted args
EXTRA_ARGS=()
if [ -n "$SERVER_ARGS" ]; then
    # shellcheck disable=SC2206
    EXTRA_ARGS=( $SERVER_ARGS )
fi

if [ -f ./start-server.sh ]; then
    exec ./start-server.sh \
        -servername "$SERVER_NAME" \
        -adminusername "$ADMIN_USERNAME" \
        -adminpassword "$ADMIN_PASSWORD" \
        "${EXTRA_ARGS[@]}" "$@"
else
    echo "[${STEAMAPPID}] start-server.sh not found!"
    if [ "$MODIX_DEBUG" = "true" ]; then
        # In debug mode, do not exit with error
        :
    else
        exit 1
    fi
fi
