#!/bin/bash
set -e

# DayZ Dedicated Server Shutdown Script
# Usage: ./shutdown.sh

# Find the DayZ server process and terminate it gracefully
pkill -f DayZServer_x64 || true
