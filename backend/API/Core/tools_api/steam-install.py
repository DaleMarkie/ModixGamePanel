import os
import platform
import asyncio
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from typing import Optional, Dict

app = FastAPI(title="Modix Installer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Paths & OS
# ---------------------------
HOME = Path.home()
OS_TYPE = platform.system().lower()
STEAMCMD_PATH = HOME / "SteamCMD"
PZ_SERVER_PATH = HOME / "Zomboid" / "Server"
STEAMCMD_EXEC = STEAMCMD_PATH / \
    ("steamcmd.exe" if OS_TYPE == "windows" else "steamcmd.sh")

# Ensure directories exist
STEAMCMD_PATH.mkdir(parents=True, exist_ok=True)
PZ_SERVER_PATH.mkdir(parents=True, exist_ok=True)

# ---------------------------
# Global state
# ---------------------------
installer_status: Dict[str, Dict] = {
    "steamcmd": {"installed": False, "installing": False},
    "project_zomboid": {"installed": False, "installing": False},
}

installer_logs: Dict[str, list[str]] = {
    "steamcmd": [],
    "project_zomboid": [],
}

# ---------------------------
# Helpers
# ---------------------------


def is_installed(path: Path) -> bool:
    return path.exists()


async def run_command_with_logs(cmd: str, cwd: Path, key: str):
    """Run command and store logs live."""
    installer_status[key]["installing"] = True
    installer_logs[key] = []

    process = await asyncio.create_subprocess_shell(
        cmd,
        cwd=cwd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
    )

    while True:
        line = await process.stdout.readline()
        if not line:
            break
        decoded = line.decode("utf-8", errors="ignore").strip()
        installer_logs[key].append(decoded)

    await process.wait()
    installer_status[key]["installed"] = True
    installer_status[key]["installing"] = False
    installer_logs[key].append("[SYSTEM] Installation complete")

# ---------------------------
# API Endpoints
# ---------------------------


@app.get("/api/tools/steam/status")
async def steam_status():
    installer_status["steamcmd"]["installed"] = is_installed(STEAMCMD_EXEC)
    installer_status["project_zomboid"]["installed"] = is_installed(
        PZ_SERVER_PATH / "servertest.ini")
    return installer_status


@app.post("/api/tools/steam/install-steamcmd")
async def install_steamcmd():
    if installer_status["steamcmd"]["installing"]:
        return JSONResponse({"message": "SteamCMD is already installing"}, status_code=400)

    # Download SteamCMD
    if OS_TYPE == "windows":
        url = "https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip"
        cmd = f'powershell -Command "Invoke-WebRequest -Uri {url} -OutFile steamcmd.zip ; Expand-Archive steamcmd.zip -DestinationPath ."'
    else:
        cmd = f"wget https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz -O steamcmd_linux.tar.gz && tar -xvzf steamcmd_linux.tar.gz"

    asyncio.create_task(run_command_with_logs(cmd, STEAMCMD_PATH, "steamcmd"))
    return {"message": "SteamCMD installation started"}


@app.get("/api/tools/steam/steamcmd-logs")
async def steamcmd_logs():
    return {"logs": installer_logs["steamcmd"], "status": installer_status["steamcmd"]}


@app.post("/api/tools/steam/install-pz")
async def install_pz():
    if installer_status["project_zomboid"]["installing"]:
        return JSONResponse({"message": "Project Zomboid is already installing"}, status_code=400)

    if not is_installed(STEAMCMD_EXEC):
        return JSONResponse({"message": "SteamCMD is not installed yet"}, status_code=400)

    cmd = f'"{STEAMCMD_EXEC}" +login anonymous +force_install_dir "{PZ_SERVER_PATH}" +app_update 380870 validate +quit'
    asyncio.create_task(run_command_with_logs(
        cmd, STEAMCMD_PATH, "project_zomboid"))
    return {"message": "Project Zomboid installation started"}


@app.get("/api/tools/steam/pz-logs")
async def pz_logs():
    return {"logs": installer_logs["project_zomboid"], "status": installer_status["project_zomboid"]}
