import os
import subprocess
import asyncio
from fastapi import APIRouter

router = APIRouter()

# ---------------- STATE ----------------
state = {
    "running": False,
    "success": False,
    "error": None,
    "logs": []
}

STEAMCMD_DIR = os.path.expanduser("~/steamcmd")
STEAMCMD_BIN = f"{STEAMCMD_DIR}/steamcmd.sh"


# ---------------- HELPERS ----------------
def add_log(line: str):
    print(line)
    state["logs"].append(line)
    if len(state["logs"]) > 300:
        state["logs"] = state["logs"][-300:]


def ensure_steamcmd():
    """Install SteamCMD if not present"""
    if os.path.exists(STEAMCMD_BIN):
        return True

    add_log("SteamCMD not found. Installing...")

    os.makedirs(STEAMCMD_DIR, exist_ok=True)

    try:
        subprocess.run(
            "apt-get update && apt-get install -y wget tar",
            shell=True,
            check=True
        )

        subprocess.run(
            f"cd {STEAMCMD_DIR} && "
            "wget https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz && "
            "tar -xvzf steamcmd_linux.tar.gz",
            shell=True,
            check=True
        )

        add_log("SteamCMD installed successfully.")
        return True

    except Exception as e:
        state["error"] = str(e)
        add_log(f"SteamCMD install failed: {e}")
        return False


async def run_install(app_id: str):
    """Run SteamCMD install"""
    global state

    if state["running"]:
        add_log("Install already running.")
        return

    if not ensure_steamcmd():
        state["running"] = False
        return

    state["running"] = True
    state["success"] = False
    state["error"] = None
    state["logs"] = []

    add_log(f"Starting Steam install for AppID {app_id}...")

    cmd = [
        STEAMCMD_BIN,
        "+login", "anonymous",
        "+force_install_dir", f"{STEAMCMD_DIR}/games/{app_id}",
        "+app_update", app_id, "validate",
        "+quit"
    ]

    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )

    for line in process.stdout:
        add_log(line.strip())

    process.wait()

    if process.returncode == 0:
        state["success"] = True
        add_log("Install completed successfully.")
    else:
        state["error"] = "SteamCMD install failed"
        add_log("Install failed.")

    state["running"] = False


# ---------------- API ----------------

@router.post("/install")
async def install_game(payload: dict):
    """
    Start install
    """
    app_id = payload.get("app_id", "108600")  # default Project Zomboid

    asyncio.create_task(run_install(app_id))

    return {
        "status": "started",
        "app_id": app_id
    }


@router.get("/status")
def get_status():
    return state


@router.post("/reset")
def reset():
    global state

    state = {
        "running": False,
        "success": False,
        "error": None,
        "logs": []
    }

    return {"status": "reset"}