import platform
import psutil
import socket
import os
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from datetime import datetime

router = APIRouter()

def get_server_info():
    """Gather system, Modix, GPU, Docker, and extra info."""
    # CPU
    cpu_info = {
        "model": platform.processor(),
        "cores": str(psutil.cpu_count(logical=True)),
        "clockSpeed": f"{round(psutil.cpu_freq().current if psutil.cpu_freq() else 0, 2)} MHz",
        "architecture": platform.architecture()[0],
        "flags": "N/A",
    }

    # Memory
    mem = psutil.virtual_memory()
    swap = psutil.swap_memory()
    memory_info = {
        "total": f"{round(mem.total / (1024**3), 2)} GB",
        "used": f"{round(mem.used / (1024**3), 2)} GB",
        "swapTotal": f"{round(swap.total / (1024**3), 2)} GB",
        "swapUsed": f"{round(swap.used / (1024**3), 2)} GB",
    }

    # Disk
    disk_info = {}
    for part in psutil.disk_partitions():
        usage = psutil.disk_usage(part.mountpoint)
        if part.mountpoint == "/":
            disk_info["root"] = f"{round(usage.used / (1024**3),2)} GB / {round(usage.total / (1024**3),2)} GB"
        elif "data" in part.mountpoint.lower():
            disk_info["data"] = f"{round(usage.used / (1024**3),2)} GB / {round(usage.total / (1024**3),2)} GB"
    total_disk = sum([psutil.disk_usage(d.mountpoint).total for d in psutil.disk_partitions()])
    disk_info["total"] = f"{round(total_disk / (1024**3),2)} GB"

    # Network
    hostname = socket.gethostname()
    try:
        primary_ip = socket.gethostbyname(hostname)
    except Exception:
        primary_ip = "N/A"
    network_info = {
        "primaryIP": primary_ip,
        "publicIP": "N/A",
        "interface": "N/A",
        "rxTx": "N/A",
    }

    # OS
    os_info = {
        "os": platform.system(),
        "platform": platform.platform(),
        "kernel": platform.release(),
        "uptime": f"{round((datetime.now() - datetime.fromtimestamp(psutil.boot_time())).total_seconds() / 3600, 2)}h",
        "hostname": hostname,
    }

    # Modix info (replace with your real build info)
    modix_info = {
        "version": "0.1.0",
        "gitCommit": "abc123",
        "buildTime": datetime.now().isoformat(),
        "environment": "development",
        "apiPort": "2010",
        "frontendPort": "3000",
    }

    return {
        "cpu": cpu_info,
        "memory": memory_info,
        "disk": disk_info,
        "network": network_info,
        "os": os_info,
        "modix": modix_info,
        "extra": {
            "timezone": datetime.now().astimezone().tzname(),
            "shell": os.environ.get("SHELL", "N/A"),
            "python": platform.python_version(),
        },
    }

@router.get("/server-info")
async def server_info():
    try:
        return JSONResponse(get_server_info())
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
