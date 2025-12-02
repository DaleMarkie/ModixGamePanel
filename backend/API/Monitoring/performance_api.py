import platform
import psutil
import socket
import os
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from datetime import datetime

try:
    import GPUtil
except ImportError:
    GPUtil = None

router = APIRouter()

@router.get("/server-info")
async def server_info():
    try:
        # CPU
        cpu_info = {
            "model": platform.processor() or "N/A",
            "cores": str(psutil.cpu_count(logical=True)),
            "clockSpeed": f"{round(psutil.cpu_freq().current if psutil.cpu_freq() else 0,2)} MHz",
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
            try:
                usage = psutil.disk_usage(part.mountpoint)
                key = part.mountpoint.strip("/").lower() or "root"
                disk_info[key] = f"{round(usage.used / (1024**3),2)} GB / {round(usage.total / (1024**3),2)} GB"
            except PermissionError:
                continue
        total_disk = sum([psutil.disk_usage(d.mountpoint).total for d in psutil.disk_partitions()])
        disk_info["total"] = f"{round(total_disk / (1024**3),2)} GB"

        # Network
        hostname = socket.gethostname()
        try:
            primary_ip = socket.gethostbyname(hostname)
        except:
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
            "version": "1.1.2",
            "buildTime": datetime.now().isoformat(),
            "environment": "production",
            "apiPort": "2010",
            "frontendPort": "3000",
        }

        # GPU (optional)
        gpu_info = {"model": "N/A", "driver": "N/A", "vram": "N/A", "cuda": "N/A"}
        if GPUtil:
            gpus = GPUtil.getGPUs()
            if gpus:
                gpu = gpus[0]
                gpu_info = {
                    "model": gpu.name,
                    "driver": gpu.driver,
                    "vram": f"{gpu.memoryTotal} MB",
                    "cuda": gpu.cuda,
                }

        # Extra
        extra_info = {
            "timezone": datetime.now().astimezone().tzname(),
            "locale": os.environ.get("LANG", "N/A"),
            "shell": os.environ.get("SHELL", "N/A"),
            "python": platform.python_version(),
            "nodejs": "N/A",
        }

        return JSONResponse({
            "cpu": cpu_info,
            "memory": memory_info,
            "disk": disk_info,
            "network": network_info,
            "os": os_info,
            "modix": modix_info,
            "gpu": gpu_info,
            "extra": extra_info,
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
