from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import random
from datetime import datetime

app = FastAPI()

# Allow CORS for local frontend dev
origins = [
    "http://localhost",
    "http://localhost:3000",  # React dev server default
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ModPerformanceData(BaseModel):
    modId: str
    modName: str
    cpuPercent: float
    memoryMB: int
    diskIOKBps: int
    networkKBps: int
    lastUpdated: str
    impactRating: Optional[str] = None
    notes: Optional[str] = None
    dependencies: Optional[List[str]] = []
    version: Optional[str] = None

class ContainerInfo(BaseModel):
    id: str
    name: str

# Simulated container list
fake_containers = [
    ContainerInfo(id="container1", name="Project Zomboid Server 1"),
    ContainerInfo(id="container2", name="Project Zomboid Server 2"),
    ContainerInfo(id="container3", name="Rust Server Alpha"),
]

# Base mod data, will be "randomized" for each request to simulate live changes
base_mod_data = {
    "container1": [
        {
            "modId": "mod1",
            "modName": "SuperWeapons",
            "cpuPercent": 15.2,
            "memoryMB": 200,
            "diskIOKBps": 180,
            "networkKBps": 75,
            "impactRating": "Medium",
            "notes": "Heavy AI computations with weapon balancing logic.",
            "dependencies": ["mod-base"],
            "version": "2.3.4",
        },
        {
            "modId": "mod2",
            "modName": "BetterGraphics",
            "cpuPercent": 5.8,
            "memoryMB": 120,
            "diskIOKBps": 60,
            "networkKBps": 10,
            "impactRating": "Low",
            "notes": "Mostly texture and shader overrides.",
            "dependencies": [],
            "version": "1.8.1",
        },
    ],
    "container2": [
        {
            "modId": "mod3",
            "modName": "ExtraZombies",
            "cpuPercent": 25.5,
            "memoryMB": 300,
            "diskIOKBps": 220,
            "networkKBps": 90,
            "impactRating": "High",
            "notes": "Spawning thousands of actors impacts CPU and memory.",
            "dependencies": ["mod-ai-enhancer"],
            "version": "4.0.0",
        },
        {
            "modId": "mod4",
            "modName": "NightMode",
            "cpuPercent": 3.2,
            "memoryMB": 80,
            "diskIOKBps": 40,
            "networkKBps": 5,
            "impactRating": "Low",
            "dependencies": [],
            "version": "1.0.5",
        },
    ],
    "container3": [
        {
            "modId": "mod5",
            "modName": "UltraPhysics",
            "cpuPercent": 10.1,
            "memoryMB": 250,
            "diskIOKBps": 100,
            "networkKBps": 60,
            "impactRating": "Medium",
            "notes": "Advanced particle simulation and physics engine.",
            "dependencies": ["physics-core"],
            "version": "3.2.7",
        },
    ],
}

def random_variation(value: float, variation_percent=0.1) -> float:
    """Apply random variation ±variation_percent (default 10%)"""
    change = value * variation_percent
    return max(0, value + random.uniform(-change, change))

@app.get("/containers", response_model=List[ContainerInfo])
async def get_containers():
    return fake_containers

@app.get("/containers/{container_id}/mods", response_model=List[ModPerformanceData])
async def get_mod_performance(container_id: str):
    base_mods = base_mod_data.get(container_id)
    if not base_mods:
        raise HTTPException(status_code=404, detail="Container not found")

    mods_with_variation = []
    now_iso = datetime.utcnow().isoformat()

    for mod in base_mods:
        mod_variation = {
            **mod,
            "cpuPercent": round(random_variation(mod["cpuPercent"], 0.15), 1),
            "memoryMB": max(10, int(random_variation(mod["memoryMB"], 0.1))),
            "diskIOKBps": max(0, int(random_variation(mod["diskIOKBps"], 0.1))),
            "networkKBps": max(0, int(random_variation(mod["networkKBps"], 0.1))),
            "lastUpdated": now_iso,
        }
        mods_with_variation.append(ModPerformanceData(**mod_variation))

    return mods_with_variation
