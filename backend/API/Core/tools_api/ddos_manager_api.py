# backend/API/Core/tools_api/ddos_manager_api.py
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from typing import List
from collections import deque
import random
import asyncio

router = APIRouter()

# In-memory DDoS simulation state
traffic_history = deque(maxlen=10)  # Last 10 intervals
attacking_ips: List[str] = []
ddos_status: str = "stopped"

# Lock to protect state when mutated from multiple tasks (optional but safe)
_state_lock = asyncio.Lock()

async def simulate_traffic(poll_interval: float = 2.0):
    """
    Background coroutine that simulates traffic when ddos_status == "running".
    Call this with asyncio.create_task(simulate_traffic()) in your app startup.
    """
    global traffic_history, attacking_ips, ddos_status
    while True:
        async with _state_lock:
            if ddos_status == "running":
                new_traffic = random.randint(0, 500)  # Random traffic value
                traffic_history.append(new_traffic)
                # Randomly simulate attacking IPs
                if random.random() > 0.5:
                    attacking_ips = [f"192.168.1.{i}" for i in range(1, random.randint(2, 6))]
                else:
                    attacking_ips = []
        await asyncio.sleep(poll_interval)

# === Get current traffic data ===
@router.get("/ddos/traffic")
async def get_ddos_traffic():
    async with _state_lock:
        return JSONResponse({
            "status": ddos_status,
            "traffic": list(traffic_history),
            "ips": attacking_ips
        })

# === Start DDoS simulation ===
@router.post("/ddos/start")
async def start_ddos():
    global ddos_status
    async with _state_lock:
        ddos_status = "running"
    return {"status": ddos_status, "message": "DDoS monitoring started"}

# === Stop DDoS simulation ===
@router.post("/ddos/stop")
async def stop_ddos():
    global ddos_status, attacking_ips, traffic_history
    async with _state_lock:
        ddos_status = "stopped"
        attacking_ips = []
        traffic_history.clear()
    return {"status": ddos_status, "message": "DDoS monitoring stopped"}
