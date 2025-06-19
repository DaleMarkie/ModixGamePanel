#!/bin/bash
set -e

# Generalized entrypoint for any SteamCMD-based game server
# Uses STEAMAPPID and STEAMAPPDIR environment variables

SCRIPTS_DIR="/home/steam/server_scripts/${STEAMAPPID}"
GLOBAL_CONFIG_SCRIPT="/home/steam/server_scripts/steam_server_configure.py"
STEAMCMD_PATH="/usr/games/steamcmd"

# Helper to call a script if it exists
call_script_if_exists() {
    local script_name="$1"
    if [ -f "$script_name" ]; then
        echo "[INFO] Running $script_name..."
        if [[ "$script_name" == *.py ]]; then
            python3 "$script_name"
        else
            bash "$script_name"
        fi
    else
        echo "[INFO] $script_name not found, skipping."
    fi
}

# Install additional dependencies for this server
call_script_if_exists "$SCRIPTS_DIR/dependincys.sh"

# Build SteamCMD update/install command based on branch
STEAMCMD_UPDATE_CMD="+login anonymous +force_install_dir \"$STEAMAPPDIR\" +app_update $STEAMAPPID"
if [ -n "$STEAMAPP_BRANCH" ]; then
    STEAMCMD_UPDATE_CMD+=" -beta $STEAMAPP_BRANCH"
    if [ -n "$STEAMAPP_BRANCH_PASSWORD" ]; then
        STEAMCMD_UPDATE_CMD+=" -betapassword $STEAMAPP_BRANCH_PASSWORD"
    fi
fi
STEAMCMD_UPDATE_CMD+=" validate +quit"

# Only install the server if it's the first start (directory empty or missing)
if [ ! -d "$STEAMAPPDIR" ] || [ -z "$(ls -A "$STEAMAPPDIR" 2>/dev/null)" ]; then
    echo "[INFO] First start detected, installing server (appid: $STEAMAPPID) to $STEAMAPPDIR..."
    eval $STEAMCMD_PATH $STEAMCMD_UPDATE_CMD
else
    # Always check for updates unless a specific branch is set
    if [ -z "$STEAMAPP_BRANCH" ]; then
        echo "[INFO] Checking for server updates (appid: $STEAMAPPID)..."
        eval $STEAMCMD_PATH $STEAMCMD_UPDATE_CMD
    else
        echo "[INFO] Specific branch set, skipping update."
    fi
fi

# Call server configuration script (universal for all servers)
if [ "$AUTO_CONFIGURE" = "true" ]; then
    call_script_if_exists "$GLOBAL_CONFIG_SCRIPT"
fi

# Trap shutdown signals to call the shutdown script if it exists
trap 'call_script_if_exists "$SCRIPTS_DIR/shutdown.sh"' SIGTERM SIGINT

# Call the startup script for this server
call_script_if_exists "$SCRIPTS_DIR/startup.sh"

# If the startup script exits, keep the container alive for debugging
echo "[ERROR] Startup script exited. Container will stay running."
tail -f /dev/null
