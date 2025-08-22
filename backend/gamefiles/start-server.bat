@echo off
title Project Zomboid Dedicated Server

:: Set server directory (relative to this script)
set SERVER_DIR=%~dp0

:: Navigate to server folder
cd /d "%SERVER_DIR%"

:: Check if SteamCMD is installed in parent folder (adjust if needed)
if exist "%SERVER_DIR%\..\steamcmd\steamcmd.exe" (
    echo Using SteamCMD from local folder...
    set STEAMCMD="%SERVER_DIR%\..\steamcmd\steamcmd.exe"
) else (
    echo SteamCMD not found locally. Make sure it is in PATH.
    set STEAMCMD=steamcmd.exe
)

:: Start Project Zomboid dedicated server
echo Starting Project Zomboid server...
:: Adjust memory if needed (-Xms1g -Xmx2g)
start "" java -Xms1g -Xmx2g -Djava.awt.headless=true -cp ".;pzserver.jar;*" zombie.network.GameServer -servername "MyPZServer"

pause
