import asyncio
from datetime import datetime
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/ddos")

# In-memory storage for live traffic
traffic_data: list[int] = [0] * 10
attacking_ips: list[str] = []
traffic_lock = asyncio.Lock()
SERVER_STATUS = "stopped"  # to be updated from main API

# Get current traffic and server status
@router.get("/traffic")
async def get_traffic():
    async with traffic_lock:
        return JSONResponse({
            "status": SERVER_STATUS,
            "traffic": traffic_data,
            "ips": attacking_ips
        })

# Simulate a traffic spike manually
@router.post("/simulate")
async def simulate_traffic(spike_chance: float = 0.05):
    import random
    async with traffic_lock:
        if SERVER_STATUS != "running":
            traffic_data[:] = [0] * 10
            attacking_ips.clear()
        else:
            new_value = random.randint(500, 1000) if random.random() < spike_chance else random.randint(0, 50)
            traffic_data.append(new_value)
            if new_value > 500:  # consider high traffic an attack
                ip = f"192.168.{random.randint(0,255)}.{random.randint(1,254)}"
                attacking_ips.append(ip)
                if len(attacking_ips) > 20:
                    attacking_ips.pop(0)
            if len(traffic_data) > 10:
                traffic_data.pop(0)
    return JSONResponse({"message": "Traffic simulated", "latest": traffic_data[-1]})

# Background task: auto-update traffic
async def traffic_updater():
    import random
    global traffic_data, attacking_ips
    while True:
        await asyncio.sleep(2)
        async with traffic_lock:
            if SERVER_STATUS == "running":
                new_value = random.randint(500, 1000) if random.random() < 0.05 else random.randint(0, 50)
                traffic_data.append(new_value)
                if new_value > 500:
                    ip = f"192.168.{random.randint(0,255)}.{random.randint(1,254)}"
                    attacking_ips.append(ip)
                    if len(attacking_ips) > 20:
                        attacking_ips.pop(0)
                if len(traffic_data) > 10:
                    traffic_data.pop(0)
            else:
                traffic_data[:] = [0] * 10
                attacking_ips.clear()

# FastAPI startup hook
@router.on_event("startup")
async def start_traffic_task():
    asyncio.create_task(traffic_updater())

# Helper to update server status from main API
def set_server_status(status: str):
    global SERVER_STATUS
    SERVER_STATUS = status
