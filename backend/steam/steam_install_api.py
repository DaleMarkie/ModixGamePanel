import asyncio
import platform
from fastapi import APIRouter

router = APIRouter()

install_state = {
    "running": False,
    "logs": [],
    "success": False,
    "error": None,
}


# ---------------- DETECT OS ----------------
def detect_os():
    system = platform.system().lower()

    if "linux" in system:
        try:
            with open("/etc/os-release", "r") as f:
                data = f.read().lower()

            if "chrome" in data or "crostini" in data:
                return "chromeos-linux"
            if "ubuntu" in data or "debian" in data:
                return "debian-linux"
        except:
            pass

        return "linux"

    return system


# ---------------- LOGGING ----------------
def log(msg: str):
    print(msg)
    install_state["logs"].append(msg)


# ---------------- INSTALL STEAM ----------------
async def install_steam_linux():
    install_state["running"] = True
    install_state["logs"] = []
    install_state["success"] = False
    install_state["error"] = None

    try:
        os_type = detect_os()
        log(f"Detected OS: {os_type}")

        # Update system first
        log("Updating package lists...")
        proc = await asyncio.create_subprocess_shell(
            "sudo apt update -y",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
        )
        stdout, _ = await proc.communicate()
        log(stdout.decode())

        # Enable 32-bit support (required for Steam)
        log("Enabling 32-bit architecture...")
        proc = await asyncio.create_subprocess_shell(
            "sudo dpkg --add-architecture i386",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
        )
        await proc.communicate()

        # Install dependencies
        log("Installing dependencies...")
        proc = await asyncio.create_subprocess_shell(
            "sudo apt install -y wget curl software-properties-common",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
        )
        stdout, _ = await proc.communicate()
        log(stdout.decode())

        # Install Steam
        log("Installing Steam...")
        proc = await asyncio.create_subprocess_shell(
            "sudo apt install -y steam",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
        )
        stdout, _ = await proc.communicate()
        log(stdout.decode())

        install_state["success"] = True
        log("Steam installation completed successfully.")

    except Exception as e:
        install_state["error"] = str(e)
        log(f"ERROR: {str(e)}")

    finally:
        install_state["running"] = False


# ---------------- API ENDPOINTS ----------------

@router.post("/steam/install")
async def install_steam():
    if install_state["running"]:
        return {"status": "already_running", "logs": install_state["logs"]}

    asyncio.create_task(install_steam_linux())

    return {
        "status": "started",
        "message": "Steam installation started"
    }


@router.get("/steam/status")
async def steam_status():
    return install_state


@router.post("/steam/reset")
async def reset_state():
    install_state["running"] = False
    install_state["logs"] = []
    install_state["success"] = False
    install_state["error"] = None

    return {"status": "reset"}