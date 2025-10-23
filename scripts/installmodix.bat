@echo off
SETLOCAL ENABLEDELAYEDEXPANSION
title Modix Panel Ultimate Installer
color 0A
set LOGFILE=modix_install.log
echo. > "%LOGFILE%"

:: ===========================================
:: HELPER FUNCTIONS
:: ===========================================
:log
    echo [%time%] %~1 >> "%LOGFILE%"
    echo %~1
    goto :eof

:separator
    echo ===========================================
    echo.
    goto :eof

:: ===========================================
:: STEP 0: License Agreement
:: ===========================================
cls
call :separator
echo       MODIX PANEL - LICENSE AGREEMENT
call :separator
echo Modix Game Panel Non-Commercial License (NC) – Version 1.3
echo (c) 2025 Ov3rlord (Dale Markie) & The Modix Dev Team
echo.
echo You must agree to the following terms:
echo 1. Software remains property of Ov3rlord & The Modix Dev Team.
echo 2. For personal, educational, or evaluation use only.
echo 3. Commercial use requires official written permission.
echo 4. Violations result in immediate termination of license.
echo.
set /p accept="Do you agree to the Modix Game Panel License? (Y/N): "
if /I NOT "%accept%"=="Y" (
    echo [X] License declined. Installation aborted.
    call :log "User declined license. Installation stopped."
    pause
    exit /b
)
echo [✓] License accepted
call :log "License accepted"
echo.

:: ===========================================
:: STEP 1: Verify Python 3.10+
:: ===========================================
call :separator
echo STEP 1: Checking Python installation...
python --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo [!] Python not found. Downloading Python 3.11...
    call :log "Python not found. Attempting to download and install."
    powershell -Command "Invoke-WebRequest -Uri https://www.python.org/ftp/python/3.11.8/python-3.11.8-amd64.exe -OutFile python_installer.exe"
    echo Installing Python silently...
    python_installer.exe /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
    del python_installer.exe
    echo [✓] Python installed successfully.
) ELSE (
    for /f "tokens=2 delims= " %%v in ('python --version 2^>^&1') do set PYVER=%%v
    for /f "tokens=1,2 delims=." %%a in ("%PYVER%") do (
        set PYMAJ=%%a
        set PYMIN=%%b
    )
    if !PYMAJ! LSS 3 (
        echo [X] Python version too old. Please install Python 3.10 or newer.
        exit /b
    )
    if !PYMIN! LSS 10 (
        echo [X] Python version must be 3.10 or newer.
        exit /b
    )
    echo [✓] Python version !PYVER! detected.
)
echo.

:: ===========================================
:: STEP 2: Verify pip
:: ===========================================
call :separator
echo STEP 2: Ensuring pip is available...
pip --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo [!] pip not found. Installing pip...
    curl -s https://bootstrap.pypa.io/get-pip.py -o get-pip.py
    python get-pip.py
    del get-pip.py
    echo [✓] pip installed successfully.
) ELSE (
    echo [✓] pip already installed.
)
echo.

:: ===========================================
:: STEP 3: Setup Python virtual environment
:: ===========================================
call :separator
echo STEP 3: Setting up backend virtual environment...
IF NOT EXIST backend\venv (
    echo Creating virtual environment...
    python -m venv backend\venv
    if ERRORLEVEL 1 (
        echo [X] Failed to create virtual environment.
        exit /b
    )
    echo [✓] Virtual environment created successfully.
) ELSE (
    echo [✓] Virtual environment already exists.
)
call backend\venv\Scripts\activate
echo [*] Upgrading pip, setuptools, and wheel...
python -m pip install --upgrade pip setuptools wheel >nul
echo [✓] Backend environment ready.
echo.

:: ===========================================
:: STEP 4: Install backend dependencies
:: ===========================================
call :separator
echo STEP 4: Installing backend dependencies...
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

pip install --upgrade --force-reinstall -r backend\requirements.txt >> "%LOGFILE%" 2>&1
if ERRORLEVEL 1 (
    echo [X] Backend dependency installation failed. Check "%LOGFILE%" for details.
    exit /b
)
echo [✓] All backend dependencies installed successfully.
echo.

:: ===========================================
:: STEP 5: Verify Node.js (>=18)
:: ===========================================
call :separator
echo STEP 5: Checking Node.js installation...
node -v >nul 2>&1
IF ERRORLEVEL 1 (
    echo [!] Node.js not found. Downloading Node.js v20.9.0...
    call :log "Downloading Node.js..."
    powershell -Command "Invoke-WebRequest -Uri https://nodejs.org/dist/v20.9.0/node-v20.9.0-x64.msi -OutFile node_installer.msi"
    echo Installing Node.js silently...
    msiexec /i node_installer.msi /quiet /qn /norestart
    del node_installer.msi
    echo [✓] Node.js installed successfully.
) ELSE (
    for /f "tokens=1 delims=v" %%v in ('node -v') do set NODEVER=%%v
    echo [✓] Node.js version v!NODEVER! detected.
)
echo.

:: ===========================================
:: STEP 6: Install frontend dependencies
:: ===========================================
call :separator
echo STEP 6: Installing frontend dependencies...
IF EXIST frontend\package.json (
    pushd frontend
    echo Performing clean npm install...
    npm install --force >> "%LOGFILE%" 2>&1
    if ERRORLEVEL 1 (
        echo [X] npm install failed. See "%LOGFILE%" for details.
        exit /b
    )
    echo [✓] Frontend dependencies installed successfully.
    popd
) ELSE (
    echo [X] frontend\package.json not found! Ensure frontend folder exists.
)
echo.

:: ===========================================
:: STEP 7: Post-install summary and launch
:: ===========================================
call :separator
echo.
echo ✅ Modix Panel Setup Complete!
echo ===========================================
echo [*] Backend virtual environment: backend\venv
echo [*] To activate backend: call backend\venv\Scripts\activate
echo [*] To start development: npm run dev
echo.
set /p launch="Do you want to launch Modix Panel now? (Y/N): "
if /I "%launch%"=="Y" (
    call backend\venv\Scripts\activate
    npm run dev
) ELSE (
    echo You can launch Modix Panel anytime using: npm run dev
)
echo.
echo [✓] Installation complete. Log saved to %LOGFILE%
pause
exit /b
