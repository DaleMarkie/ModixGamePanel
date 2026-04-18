from fastapi import APIRouter
from backend.rcon_pool import RCONPool

router = APIRouter()

rcon = RCONPool(
    host="127.0.0.1",
    password="your_rcon_password",
    port=27015
)

@router.post("/api/terminal")
async def terminal(payload: dict):
    action = payload.get("action")

    if action == "rcon":
        cmd = payload.get("command")
        result = await rcon.command(cmd)
        return {"output": result}

    return {"error": "invalid action"}