# backend/API/Core/tools_api/portcheck_api.py
import socket
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

router = APIRouter()

# ---------------------------
# Game Server Ports Checker
# ---------------------------
DEFAULT_GAME_PORTS = {
    "Project Zomboid": 16261,
    "DayZ": 2302,
    "RimWorld": 27015,
}

def is_port_open(host: str, port: int, timeout: float = 1.0) -> bool:
    """Check if a TCP port is open on the given host."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False

@router.get("/server/game-ports")
async def check_game_ports(
    host: str = "127.0.0.1",
    custom_ports: str = Query(None, description="Comma-separated custom ports e.g. 27016,27017")
):
    """
    Check default game server ports (Project Zomboid, DayZ, RimWorld)
    and optionally custom ports.
    """
    results = []

    # Default game ports
    for game, port in DEFAULT_GAME_PORTS.items():
        status = "open" if is_port_open(host, port) else "closed"
        results.append({"name": game, "port": port, "status": status})

    # Custom ports
    if custom_ports:
        for p in custom_ports.split(","):
            try:
                port = int(p.strip())
                status = "open" if is_port_open(host, port) else "closed"
                results.append({"name": f"Custom Port {port}", "port": port, "status": status})
            except ValueError:
                results.append({"name": f"Custom Port {p.strip()}", "port": p.strip(), "status": "invalid"})
                continue

    return JSONResponse({"servers": results})
