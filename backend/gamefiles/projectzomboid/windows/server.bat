@echo off
:: ==========================================
:: Project Zomboid Windows Server Launcher
:: Detailed error logging for backend terminal
:: ==========================================

:: Enable delayed expansion for variables
setlocal enabledelayedexpansion

echo [INFO] Starting Project Zomboid Windows Server...

:: Change to the script directory
cd /d "%~dp0"

:: Check if ProjectZomboid folder exists
if not exist "ProjectZomboid" (
    echo [ERROR] ProjectZomboid folder not found! Please copy your Steam server files into %CD%\ProjectZomboid
    exit /b 1
)

:: Check if main server executable exists
if not exist "ProjectZomboid\pzserver.bat" (
    echo [ERROR] Main server file pzserver.bat not found inside ProjectZomboid folder
    exit /b 1
)

:: Optional: Check for config file
if not exist "ProjectZomboid\server.ini" (
    echo [WARNING] server.ini not found — default settings will be used
)

:: Optional: Check for mods folder
if not exist "ProjectZomboid\mods" (
    echo [INFO] No mods folder found — continuing without mods
)

:: Log start time
set START_TIME=%DATE% %TIME%
echo [INFO] Server start time: !START_TIME!

:: Launch the dedicated server in background
:: Redirect stdout and stderr to log files
start "" cmd /c "ProjectZomboid\pzserver.bat -nosteam > server_output.log 2> server_error.log"

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to launch Project Zomboid server. Check server_output.log and server_error.log
    exit /b %ERRORLEVEL%
)

echo [INFO] Project Zomboid Windows Server is now running.
echo [INFO] Output logs: server_output.log
echo [INFO] Error logs: server_error.log

exit /b 0
