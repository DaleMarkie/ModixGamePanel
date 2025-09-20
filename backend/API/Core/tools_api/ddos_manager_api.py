# backend/API/Core/tools_api/ddos_manager_api.py
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from typing import List
from collections import deque
import random
import asyncio

router = APIRouter()

# In-memory DDoS simulation
traffic_history = deque(maxlen=10)  # Last 10 intervals
attacking_ips: List[str] = []
ddos_status: str = "stopped"

# Simulate traffic every interval
async def simulate_traffic():
    global traffic_history, attacking_ips
    while True:
        if ddos_status == "running":
            new_traffic = random.randint(0, 500)  # Random traffic value
            traffic_history.append(new_traffic)
            # Randomly simulate attacking IPs
            if random.random() > 0.5:
                attacking_ips = [f"192.168.1.{i}" for i in range(random.randint(1, 5))]
            else:
                attacking_ips = []
        await asyncio.sleep(2)  # Matches frontend polling interval

# Start background simulation task
@router.on_event("startup")
async def start_ddos_simulation():
    asyncio.create_task(simulate_traffic())

# === Get current traffic data ===
@router.get("/ddos/traffic")
async def get_ddos_traffic():
    return JSONResponse({
        "status": ddos_status,
        "traffic": list(traffic_history),
        "ips": attacking_ips
    })

# === Start DDoS simulation ===
@router.post("/ddos/start")
async def start_ddos():
    global ddos_status
    ddos_status = "running"
    return {"status": ddos_status, "message": "DDoS monitoring started"}

# === Stop DDoS simulation ===
@router.post("/ddos/stop")
async def stop_ddos():
    global ddos_status, attacking_ips
    ddos_status = "stopped"
    attacking_ips = []
    traffic_history.clear()
    return {"status": ddos_status, "message": "DDoS monitoring stopped"}
