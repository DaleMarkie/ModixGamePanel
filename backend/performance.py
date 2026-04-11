import os
import subprocess
import platform
import socket
import psutil
from fastapi import APIRouter

router = APIRouter()

# ---------------------------
# Helpers
# ---------------------------
def run_cmd(cmd: str) -> str:
    try:
        return subprocess.check_output(cmd, shell=True, text=True).strip()
    except Exception:
        return "N/A"

def get_public_ip():
    return run_cmd("curl -s ifconfig.me || echo N/A")

# ---------------------------
# API Route
# ---------------------------
@router.get("/server-info")
async def server_info():
    try:
        # CPU
        cpu_info = {
            "model": run_cmd("lscpu | grep 'Model name' | cut -d ':' -f2").strip(),
            "cores": str(psutil.cpu_count(logical=True)),
            "clockSpeed": run_cmd("lscpu | grep 'MHz' | head -n1 | awk '{print $3 \" MHz\"}'"),
            "architecture": platform.machine(),
            "flags": run_cmd("lscpu | grep 'Flags' | cut -d ':' -f2"),
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
        disk = psutil.disk_usage("/")
        disk_info = {
            "total": f"{round(disk.total / (1024**3), 2)} GB",
            "root": f"{round(disk.used / (1024**3), 2)} GB",
            "data": run_cmd("df -h / | awk 'NR==2 {print $3}'"),
        }

        # Network
        net = psutil.net_io_counters()
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)

        network_info = {
            "primaryIP": local_ip,
            "publicIP": get_public_ip(),
            "interface": run_cmd("ip route | grep default | awk '{print $5}'"),
            "rxTx": f"RX: {round(net.bytes_recv / (1024**2), 2)} MB / TX: {round(net.bytes_sent / (1024**2), 2)} MB",
        }

        # OS
        os_info = {
            "os": platform.system(),
            "platform": platform.platform(),
            "kernel": platform.release(),
            "uptime": run_cmd("uptime -p"),
            "hostname": hostname,
        }

        # Modix (custom)
        modix_info = {
            "version": os.getenv("MODIX_VERSION", "dev"),
            "gitCommit": run_cmd("git rev-parse --short HEAD"),
            "buildTime": run_cmd("date"),
            "environment": os.getenv("ENV", "development"),
            "apiPort": os.getenv("API_PORT", "2010"),
            "frontendPort": os.getenv("FRONTEND_PORT", "3000"),
        }

        # GPU (basic NVIDIA support)
        gpu_info = {
            "model": run_cmd("nvidia-smi --query-gpu=name --format=csv,noheader"),
            "driver": run_cmd("nvidia-smi --query-gpu=driver_version --format=csv,noheader"),
            "vram": run_cmd("nvidia-smi --query-gpu=memory.total --format=csv,noheader"),
            "cuda": run_cmd("nvidia-smi | grep CUDA | awk '{print $9}'"),
        }

        # Extra
        extra_info = {
            "timezone": run_cmd("timedatectl | grep 'Time zone' | awk '{print $3}'"),
            "locale": os.getenv("LANG", "N/A"),
            "shell": os.getenv("SHELL", "N/A"),
            "python": platform.python_version(),
            "nodejs": run_cmd("node -v"),
        }

        return {
            "cpu": cpu_info,
            "memory": memory_info,
            "disk": disk_info,
            "network": network_info,
            "os": os_info,
            "modix": modix_info,
            "gpu": gpu_info,
            "extra": extra_info,
        }

    except Exception as e:
        return {"error": str(e)}