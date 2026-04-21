import os
import uuid
import asyncio
import subprocess
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

STEAMCMD_PATH = "/home/steam/steamcmd/steamcmd.sh"  # adjust if needed
STEAM_DIR = "/home/steam/steamapps"

# appid mapping
GAMES = {
    "zomboid": "108600",
    "rust": "252490",
    "spaceengineers": "244850",
}

jobs = {}  # job_id -> {"progress": int, "logs": [], "status": str}
clients = {}  # job_id -> set(websockets)


# ---------------- UTIL ----------------
def create_job(game):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "progress": 0,
        "logs": [],
        "status": "starting",
        "game": game,
    }
    clients[job_id] = set()
    return job_id


def parse_progress(line: str):
    """
    SteamCMD outputs lines like:
    Downloading update (12 of 100) ...
    """
    import re

    match = re.search(r"\((\d+)\s*of\s*(\d+)\)", line)
    if match:
        current = int(match.group(1))
        total = int(match.group(2))
        return int((current / total) * 100)

    if "success" in line.lower():
        return 100

    return None


async def run_steamcmd(job_id: str, appid: str):
    cmd = [
        STEAMCMD_PATH,
        "+login", "anonymous",
        "+force_install_dir", STEAM_DIR,
        "+app_update", appid,
        "validate",
        "+quit",
    ]

    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
    )

    jobs[job_id]["status"] = "running"

    while True:
        line = await process.stdout.readline()
        if not line:
            break

        text = line.decode(errors="ignore").strip()

        jobs[job_id]["logs"].append(text)

        progress = parse_progress(text)
        if progress is not None:
            jobs[job_id]["progress"] = progress

        # push to websocket clients
        dead = set()
        for ws in clients[job_id]:
            try:
                await ws.send_json({
                    "job": job_id,
                    "log": text,
                    "progress": jobs[job_id]["progress"],
                })
            except:
                dead.add(ws)

        for d in dead:
            clients[job_id].discard(d)

    jobs[job_id]["progress"] = 100
    jobs[job_id]["status"] = "done"


# ---------------- INSTALL ----------------
@router.post("/install/{game}")
async def install_game(game: str):
    if game not in GAMES:
        return {"error": "unknown game"}

    job_id = create_job(game)
    appid = GAMES[game]

    asyncio.create_task(run_steamcmd(job_id, appid))

    return {"job_id": job_id, "appid": appid}


# ---------------- STATUS ----------------
@router.get("/status/{job_id}")
async def status(job_id: str):
    return jobs.get(job_id, {"error": "not found"})


# ---------------- WEBSOCKET ----------------
@router.websocket("/ws/{job_id}")
async def ws_logs(websocket: WebSocket, job_id: str):
    await websocket.accept()

    if job_id not in clients:
        clients[job_id] = set()

    clients[job_id].add(websocket)

    try:
        while True:
            await asyncio.sleep(30)
    except WebSocketDisconnect:
        clients[job_id].discard(websocket)