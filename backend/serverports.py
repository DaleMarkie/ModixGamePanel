import asyncio
import socket
from typing import List

from fastapi import APIRouter, Query

router = APIRouter()

# ---------------------------
# Default Game Ports
# ---------------------------
DEFAULT_PORTS = [
    {"name": "Project Zomboid (UDP)", "port": 16261},
    {"name": "Project Zomboid (UDP Range)", "port": 16262},
    {"name": "DayZ", "port": 2302},
    {"name": "RimWorld", "port": 27015},
]

# ---------------------------
# Port Check Function
# ---------------------------
async def check_port(host: str, port: int, timeout: float = 1.5) -> str:
    loop = asyncio.get_event_loop()

    def try_connect():
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(timeout)
            result = sock.connect_ex((host, port))
            return "open" if result == 0 else "closed"

    return await loop.run_in_executor(None, try_connect)

# ---------------------------
# API Route
# ---------------------------
@router.get("/server/game-ports")
async def check_game_ports(
    host: str = Query("127.0.0.1"),
    custom_ports: str = Query("")
):
    ports_to_check = DEFAULT_PORTS.copy()

    # Parse custom ports
    if custom_ports:
        for p in custom_ports.split(","):
            p = p.strip()
            if p.isdigit():
                ports_to_check.append({
                    "name": "Custom",
                    "port": int(p)
                })

    # Run checks concurrently
    tasks = [
        check_port(host, item["port"])
        for item in ports_to_check
    ]

    results = await asyncio.gather(*tasks)

    # Build response
    servers = []
    for item, status in zip(ports_to_check, results):
        servers.append({
            "name": item["name"],
            "port": item["port"],
            "status": status
        })

    return {"servers": servers}