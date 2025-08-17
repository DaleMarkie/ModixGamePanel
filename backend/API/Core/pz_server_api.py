# backend/API/Core/pz_server_api.py
import os
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter()

STEAMCMD_DIR = os.path.expanduser("~/steamcmd")
PZ_SERVER_DIR = os.path.expanduser("~/pzserver")
steamcmd_proc: asyncio.subprocess.Process | None = None


def steamcmd_path() -> str:
    return os.path.join(STEAMCMD_DIR, "steamcmd.sh")


@router.post("/install-server")
async def install_server():
    """Kick off Project Zomboid server install with SteamCMD (async, logs streamed separately)."""
    global steamcmd_proc

    # Ensure dirs
    os.makedirs(STEAMCMD_DIR, exist_ok=True)
    os.makedirs(PZ_SERVER_DIR, exist_ok=True)

    # Download SteamCMD if missing
    if not os.path.exists(steamcmd_path()):
        await asyncio.create_subprocess_shell(
            f"cd {STEAMCMD_DIR} && curl -sqL https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz | tar zxvf -"
        )

    # Start install process (async, logs available via /install-logs)
    cmd = [
        steamcmd_path(),
        "+login", "anonymous",
        "+force_install_dir", PZ_SERVER_DIR,
        "+app_update", "380870", "validate",
        "+quit",
    ]
    steamcmd_proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
    )

    return {"message": "Installation started. Connect to /install-logs for live output."}


@router.get("/install-logs")
async def install_logs():
    """Stream live SteamCMD logs to frontend."""
    global steamcmd_proc
    if steamcmd_proc is None:
        async def no_proc():
            yield "data: [System] No install process running.\n\n"
        return StreamingResponse(no_proc(), media_type="text/event-stream")

    async def log_stream():
        while True:
            line = await steamcmd_proc.stdout.readline()
            if not line:
                break
            yield f"data: {line.decode().strip()}\n\n"

        yield "data: [System] Install finished.\n\n"
        steamcmd_proc = None

    return StreamingResponse(log_stream(), media_type="text/event-stream")
