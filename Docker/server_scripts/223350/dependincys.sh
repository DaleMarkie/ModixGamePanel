#!/bin/bash
set -e

# DayZ Dedicated Server Dependencies Installer
# Usage: ./dependincys.sh

# Install required libraries for DayZ Dedicated Server (Ubuntu/Debian)
apt-get update
apt-get install -y lib32gcc-s1 libsdl2-2.0-0
