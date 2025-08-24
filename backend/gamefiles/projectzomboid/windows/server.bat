@echo off
:: ==========================================
:: Project Zomboid Windows Server Launcher
:: Improved version for backend integration
:: ==========================================

:: Enable delayed expansion for variables
setlocal enabledelayedexpansion

echo [INFO] Starting Project Zomboid Windows Server...

:: Change to the current directory of this script
cd /d "%~dp0"

:: Check if the ProjectZomboid folder exists
if not exist "ProjectZomboid" (
    echo [ERROR] ProjectZomboid server files not found!
    exit /b 1
)

:: Log start time
set START_TIME=%DATE% %TIME%
echo [INFO] Server start time: !START_TIME!

:: Launch the dedicated server in the background
:: Redirect stdout and stderr to log files
start "" cmd /c "ProjectZomboid\pzserver.bat -nosteam > server_output.log 2> server_error.log"

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to launch Project Zomboid server.
    exit /b %ERRORLEVEL%
)

echo [INFO] Project Zomboid Windows Server is now running.
echo [INFO] Output is being logged to server_output.log
echo [INFO] Errors (if any) are logged to server_error.log

:: Wait for user to close (optional, can be removed for backend automation)
:: pause

exit /b 0
