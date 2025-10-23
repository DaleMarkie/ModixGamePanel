@echo off
SETLOCAL ENABLEDELAYEDEXPANSION
title Modix Panel Installer
color 0A
echo ===========================================
echo       MODIX PANEL - FIRST TIME SETUP
echo ===========================================
echo.

REM -------------------------
REM STEP 1: Check Python
REM -------------------------
echo [1/6] Checking Python...
python --version >nul 2>&1
IF ERRORLEVEL 1 (
    color 0C
    echo [!] Python not found!
    echo Please install Python 3.10+ from:
    echo https://www.python.org/downloads/windows/
    pause
    exit /b
) ELSE (
    python --version
    echo [✓] Python found
)
echo.

REM -------------------------
REM STEP 2: Check pip
REM -------------------------
echo [2/6] Checking pip...
pip --version >nul 2>&1
IF ERRORLEVEL 1 (
    color 0C
    echo [!] pip not found. Installing pip...
    curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
    python get-pip.py
    del get-pip.py
) ELSE (
    pip --version
    echo [✓] pip found
)
echo.

REM -------------------------
REM STEP 3: Create Virtual Environment
REM -------------------------
echo [3/6] Setting up backend virtual environment...
IF NOT EXIST backend\venv (
    python -m venv backend\venv
    echo [✓] Virtual environment created
) ELSE (
    echo [✓] Virtual environment already exists
)
echo [*] Upgrading pip inside venv...
call backend\venv\Scripts\activate
python -m pip install --upgrade pip setuptools wheel
echo.

REM -------------------------
REM STEP 4: Install Backend Dependencies
REM -------------------------
echo [4/6] Installing backend dependencies...
IF EXIST backend\requirements.txt (
    pip install -r backend\requirements.txt
    echo [✓] Backend dependencies installed
) ELSE (
    echo [!] backend\requirements.txt not found
)
echo.

REM -------------------------
REM STEP 5: Check Node.js
REM -------------------------
echo [5/6] Checking Node.js...
node -v >nul 2>&1
IF ERRORLEVEL 1 (
    color 0C
    echo [!] Node.js not found!
    echo Please install Node.js from:
    echo https://nodejs.org/en/download/
    pause
    exit /b
) ELSE (
    node -v
    echo [✓] Node.js found
)
echo.

REM -------------------------
REM STEP 6: Install Frontend Dependencies
REM -------------------------
echo [6/6] Installing frontend dependencies...
IF EXIST frontend\package.json (
    cd frontend
    npm install
    cd ..
    echo [✓] Frontend dependencies installed
) ELSE (
    echo [!] frontend/package.json not found
)
echo.

color 0A
echo ===========================================
echo      Modix Panel Setup Complete!
echo ===========================================
echo.
echo [*] To activate backend venv, run:
echo call backend\venv\Scripts\activate
echo.
echo [*] Start development (frontend + backend + electron) with:
echo npm run dev
echo.
set /p launch="Do you want to launch Modix Panel now? (Y/N): "
if /I "%launch%"=="Y" (
    call backend\venv\Scripts\activate
    npm run dev
) ELSE (
    echo You can launch the panel later using 'npm run dev'
)
pause
