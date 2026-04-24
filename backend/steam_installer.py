import subprocess
import asyncio
import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

# active installs
INSTALLS = {}

STEAMCMD_PATH = "/home/steamcmd/steamcmd.sh"
BASE_INSTALL_DIR = "/home/game_servers"


class InstallSession:
    def __init__(self, app_id: str):
        self.id = str(uuid.uuid4())
        self.app_id = app_id
        self.proc = None
        self.clients = set()


async def run_steamcmd(session: InstallSession):
    cmd = [
        STEAMCMD_PATH,
        "+login", "anonymous",
        "+force_install_dir", f"{BASE_INSTALL_DIR}/{session.app_id}",
        "+app_update", session.app_id,
        "validate",
        "+quit"
    ]

    session.proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    for line in iter(session.proc.stdout.readline, ""):
        dead = []

        for ws in list(session.clients):
            try:
                await ws.send_text(line.strip())
            except:
                dead.append(ws)

        for d in dead:
            session.clients.discard(d)

    session.proc.wait()


# ---------------- START INSTALL ----------------
@router.post("/install")
async def install_game(payload: dict):
    app_id = payload.get("appId")

    session = InstallSession(app_id)
    INSTALLS[session.id] = session

    asyncio.create_task(run_steamcmd(session))

    return {"installId": session.id}


# ---------------- WEBSOCKET LOG STREAM ----------------
@router.websocket("/ws/install/{install_id}")
async def install_ws(websocket: WebSocket, install_id: str):
    await websocket.accept()

    session = INSTALLS.get(install_id)
    if not session:
        await websocket.send_text("Invalid install ID")
        await websocket.close()
        return

    session.clients.add(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        session.clients.discard(websocket)