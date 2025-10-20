# backend/API/Core/tools_api/portcheck_api.py
import asyncio
import socket
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

router = APIRouter()

DEFAULT_GAME_PORTS = [
    {"name": "Project Zomboid (Game)", "port": 16261},
    {"name": "Project Zomboid (Query)", "port": 16262},
    {"name": "DayZ", "port": 2302},
    {"name": "RimWorld", "port": 27015},
]

async def check_port(host: str, port: int) -> dict:
    loop = asyncio.get_event_loop()
    def _check():
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.5)
            return s.connect_ex((host, port)) == 0
    try:
        in_use = await loop.run_in_executor(None, _check)
        return {"name": f"Port {port}", "port": port, "status": "open" if in_use else "closed"}
    except Exception:
        return {"name": f"Port {port}", "port": port, "status": "closed"}

@router.get("/game-ports")
async def game_ports(
    host: str = Query("127.0.0.1"),
    custom_ports: str = Query("")
):
    ports_to_check = DEFAULT_GAME_PORTS.copy()

    if custom_ports:
        for p in custom_ports.split(","):
            try:
                p_int = int(p.strip())
                ports_to_check.append({"name": f"Custom Port {p_int}", "port": p_int})
            except ValueError:
                return JSONResponse({"error": f"Invalid port: {p}"}, status_code=400)

    results = await asyncio.gather(*[check_port(host, p["port"]) for p in ports_to_check])
    return {"servers": results}
