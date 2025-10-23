@echo off
SETLOCAL ENABLEDELAYEDEXPANSION
title Modix Panel Ultimate Installer
color 0A

:: ===========================================
:: STEP 0: License Agreement
:: ===========================================
echo ===========================================
echo       MODIX PANEL - LICENSE AGREEMENT
echo ===========================================
echo.
echo Modix Game Panel Non-Commercial License (NC) – Version 1.3
echo Copyright (c) 2025 Ov3rlord (Dale Markie) and the Modix Dev Team
echo.
echo By using, installing, or launching Modix Panel, you agree to the following:
echo 1. The Software is the exclusive property of Ov3rlord and the Modix Dev Team.
echo 2. You may use or modify the Software for personal, educational, or evaluation purposes only.
echo 3. Commercial use is strictly prohibited without official verification.
echo 4. Any violation immediately terminates your rights to use the Software.
echo.
set /p accept="Do you agree to the Modix Game Panel License? (Y/N): "
if /I NOT "%accept%"=="Y" (
    echo You must agree to the license to install or use Modix Panel.
    pause
    exit /b
)
echo [✓] License accepted
echo.

:: ===========================================
:: STEP 1: Ensure Python 3.10+
:: ===========================================
python --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo [!] Python not found. Downloading Python 3.11...
    powershell -Command "Invoke-WebRequest -Uri https://www.python.org/ftp/python/3.11.8/python-3.11.8-amd64.exe -OutFile python_installer.exe"
    echo Installing Python silently...
    python_installer.exe /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
    del python_installer.exe
    echo [✓] Python installed
) ELSE (
    python --version
    echo [✓] Python found
)
echo.

:: ===========================================
:: STEP 2: Ensure pip
:: ===========================================
pip --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo [!] pip not found. Installing pip...
    curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
    python get-pip.py
    del get-pip.py
) ELSE (
    echo [✓] pip found
)
echo.

:: ===========================================
:: STEP 3: Setup backend venv
:: ===========================================
IF NOT EXIST backend\venv (
    echo Creating Python virtual environment...
    python -m venv backend\venv
    echo [✓] Virtual environment created
) ELSE (
    echo [✓] Virtual environment exists
)
call backend\venv\Scripts\activate
echo [*] Upgrading pip, setuptools, wheel in venv...
python -m pip install --upgrade pip setuptools wheel
echo.

:: ===========================================
:: STEP 4: Install all backend dependencies
:: ===========================================
echo Installing backend dependencies (ensuring all are installed)...
(
echo fastapi
echo uvicorn[standard]
echo sqlalchemy
echo passlib[bcrypt]
echo python-jose[cryptography]
echo pydantic>=2.0.0
echo python-multipart
echo docker
echo jsonschema
echo pyyaml
) > backend\requirements.txt

:: Force reinstall to ensure all are present
pip install --upgrade --force-reinstall -r backend\requirements.txt
echo [✓] All backend dependencies installed
echo.

:: ===========================================
:: STEP 5: Ensure Node.js
:: ===========================================
node -v >nul 2>&1
IF ERRORLEVEL 1 (
    echo [!] Node.js not found. Downloading Node.js...
    powershell -Command "Invoke-WebRequest -Uri https://nodejs.org/dist/v20.9.0/node-v20.9.0-x64.msi -OutFile node_installer.msi"
    echo Installing Node.js silently...
    msiexec /i node_installer.msi /quiet /qn /norestart
    del node_installer.msi
    echo [✓] Node.js installed
) ELSE (
    node -v
    echo [✓] Node.js found
)
echo.

:: ===========================================
:: STEP 6: Install frontend dependencies
:: ===========================================
IF EXIST frontend\package.json (
    cd frontend
    echo Installing frontend dependencies (forcing clean install)...
    npm install --force
    cd ..
    echo [✓] Frontend dependencies installed
) ELSE (
    echo [!] frontend/package.json not found
)
echo.

:: ===========================================
:: STEP 7: Launch Modix Panel Option
:: ===========================================
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
