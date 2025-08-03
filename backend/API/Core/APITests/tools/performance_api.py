from fastapi import APIRouter
import platform
import psutil
import socket
import datetime
import os
import sys
import asyncio
import httpx

router = APIRouter()

def get_cpu_info():
    cpu_freq = psutil.cpu_freq()
    return {
        "cores": psutil.cpu_count(logical=False),
        "logical_cores": psutil.cpu_count(logical=True),
        "frequency": f"{cpu_freq.current:.2f} MHz" if cpu_freq else "N/A",
        "percent": psutil.cpu_percent(interval=1),
        "model": platform.processor(),
    }

def get_memory_info():
    mem = psutil.virtual_memory()
    return {
        "total": mem.total,
        "available": mem.available,
        "used": mem.used,
        "percent": mem.percent,
    }

def get_disk_info():
    partitions = psutil.disk_partitions()
    disks = []
    for p in partitions:
        usage = psutil.disk_usage(p.mountpoint)
        disks.append({
            "device": p.device,
            "mountpoint": p.mountpoint,
            "fstype": p.fstype,
            "total": usage.total,
            "used": usage.used,
            "free": usage.free,
            "percent": usage.percent,
        })
    return disks

def get_network_info():
    addrs = psutil.net_if_addrs()
    stats = psutil.net_if_stats()
    interfaces = []
    for iface_name, iface_addrs in addrs.items():
        iface_stat = stats.get(iface_name)
        interfaces.append({
            "name": iface_name,
            "is_up": iface_stat.isup if iface_stat else False,
            "speed": iface_stat.speed if iface_stat else 0,
            "addresses": [addr.address for addr in iface_addrs],
        })
    return interfaces

def get_os_info():
    return {
        "platform": platform.system(),
        "platform_version": platform.version(),
        "platform_release": platform.release(),
        "hostname": socket.gethostname(),
        "uptime": str(datetime.datetime.now() - datetime.datetime.fromtimestamp(psutil.boot_time())),
        "python_version": sys.version,
    }

def get_docker_info():
    # Dummy data or implement real docker detection here
    # Example:
    return {
        "docker_installed": os.path.exists("/.dockerenv") or os.path.exists("/.dockerinit"),
        "docker_version": "N/A",
    }

def get_modix_info():
    # Your custom Modix info here
    return {
        "version": "1.0.0",
        "author": "Modix Team",
    }

def get_gpu_info():
    # Dummy placeholder (add real GPU info collection if you want)
    return {
        "gpu_model": "N/A",
        "gpu_memory": "N/A",
    }

def get_extra_info():
    return {
        "extra": "Add your extra info here",
    }

async def get_public_ip():
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get("https://api.ipify.org?format=json", timeout=5)
            resp.raise_for_status()
            return resp.json().get("ip", "N/A")
        except Exception:
            return "N/A"

@router.get("/server-info")
async def server_info():
    info = {
        "cpu": get_cpu_info(),
        "memory": get_memory_info(),
        "disk": get_disk_info(),
        "network": get_network_info(),
        "os": get_os_info(),
        "docker": get_docker_info(),
        "modix": get_modix_info(),
        "gpu": get_gpu_info(),
        "extra": get_extra_info(),
    }
    info["network_public_ip"] = await get_public_ip()
    return info
