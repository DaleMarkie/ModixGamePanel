#!/bin/bash
# Example: Install extra dependencies for Project Zomboid (appid 108600)
set -e
if [ "$(id -u)" -eq 0 ]; then
    echo "[380870] Installing extra dependencies..."
    apt-get update && apt-get install -y --no-install-recommends jq && rm -rf /var/lib/apt/lists/*
else
    echo "[380870] Not running as root, cannot install extra dependencies."
fi
