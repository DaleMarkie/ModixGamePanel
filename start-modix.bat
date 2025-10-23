@echo off
title Modix Game Panel Launcher
color 0A
SETLOCAL ENABLEDELAYEDEXPANSION

:: ===========================================
::  MODIX PANEL STARTUP SCRIPT - FIXED
::  Keeps terminal open on errors
:: ===========================================

echo.
echo ===========================================
echo     🚀  Starting Modix Game Panel...
echo ===========================================
echo.

:: -------------------------------------------
:: STEP 1: Check Node.js
:: -------------------------------------------
node -v >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ⚠️  Node.js not found!
    echo Please install Node.js from https://nodejs.org/ and try again.
    pause
    goto :end
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo ✅ Node.js detected: %NODE_VERSION%
echo.

:: -------------------------------------------
:: STEP 2: Check Python
:: -------------------------------------------
python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ⚠️  Python not found!
    echo Please install Python 3.10+ from https://www.python.org/ and try again.
    pause
    goto :end
)
for /f "tokens=*" %%v in ('python --version') do set PY_VERSION=%%v
echo ✅ Python detected: %PY_VERSION%
echo.

:: -------------------------------------------
:: STEP 3: Install NPM dependencies if missing
:: -------------------------------------------
if not exist node_modules (
    echo ⚙️ Installing npm dependencies...
    npm install
    if %errorlevel% neq 0 (
        color 0C
        echo ❌ Failed to install npm dependencies.
        pause
        goto :end
    )
) else (
    echo ✅ Dependencies already installed.
)
echo.

:: -------------------------------------------
:: STEP 4: Launch Modix
:: -------------------------------------------
echo 🚀 Launching Modix Panel...
echo ===========================================
echo Frontend (Next.js), Backend (Python), and Electron will start now.
echo.

:: Run dev script with pause on error
call npm run dev
if %errorlevel% neq 0 (
    color 0C
    echo ❌ Error occurred while running npm run dev
)

:end
echo.
echo ===========================================
echo 💠 Modix Panel launcher has exited.
echo Please check errors above if any.
pause
