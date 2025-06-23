#!/bin/bash
set -e

# Unturned Dedicated Server Shutdown Script
# Usage: ./shutdown.sh

# Find the Unturned server process and terminate it gracefully
pkill -f Unturned_Headless.x86_64 || true
