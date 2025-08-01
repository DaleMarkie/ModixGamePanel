from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import platform
import psutil
import socket
import datetime
import subprocess
import os

app = FastAPI()

# Enable CORS so your React frontend (likely on localhost:3000) can access this API:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_cpu_info():
    cpu_freq = psutil.cpu_freq()
    return {
        "model": platform.processor() or "Unknown",
        "cores": str(psutil.cpu_count(logical=False)) + " physical / " + str(psutil.cpu_count(logical=True)) + " logical",
        "clockSpeed": f"{cpu_freq.current:.2f} MHz" if cpu_freq else "Unknown",
        "architecture": platform.machine(),
        "flags": "N/A",  # Getting CPU flags reliably cross-platform is complex
    }

def get_memory_info():
    mem = psutil.virtual_memory()
    swap = psutil.swap_memory()
    return {
        "total": f"{mem.total / (1024 ** 3):.2f} GB",
        "used": f"{mem.used / (1024 ** 3):.2f} GB",
        "swapTotal": f"{swap.total / (1024 ** 3):.2f} GB",
        "swapUsed": f"{swap.used / (1024 ** 3):.2f} GB",
    }

def get_disk_info():
    disk_total = psutil.disk_usage('/')
    data_disk = None
    try:
        data_disk = psutil.disk_usage('/data')
    except Exception:
        data_disk = None
    return {
        "total": f"{disk_total.total / (1024 ** 3):.2f} GB",
        "root": f"{disk_total.used / (1024 ** 3):.2f} GB used / {disk_total.free / (1024 ** 3):.2f} GB free",
        "data": f"{data_disk.used / (1024 ** 3):.2f} GB used / {data_disk.free / (1024 ** 3):.2f} GB free" if data_disk else "N/A",
    }

def get_network_info():
    hostname = socket.gethostname()
    primary_ip = socket.gethostbyname(hostname)
    public_ip = "N/A"
    try:
        # Attempt to get public IP via curl
        result = subprocess.run(['curl', '-s', 'https://api.ipify.org'], capture_output=True, text=True, timeout=3)
        if result.returncode == 0:
            public_ip = result.stdout.strip()
    except Exception:
        pass

    net_if_addrs = psutil.net_if_addrs()
    primary_interface = next(iter(net_if_addrs), "N/A")
    net_io = psutil.net_io_counters(pernic=True)
    rx_tx = "N/A"
    if primary_interface in net_io:
        rx = net_io[primary_interface].bytes_recv / (1024 ** 2)
        tx = net_io[primary_interface].bytes_sent / (1024 ** 2)
        rx_tx = f"RX {rx:.2f} MB / TX {tx:.2f} MB"

    return {
        "primaryIP": primary_ip,
        "publicIP": public_ip,
        "interface": primary_interface,
        "rxTx": rx_tx,
    }

def get_os_info():
    uptime_seconds = (datetime.datetime.now() - datetime.datetime.fromtimestamp(psutil.boot_time())).total_seconds()
    uptime_str = str(datetime.timedelta(seconds=int(uptime_seconds)))
    return {
        "os": platform.system() + " " + platform.release(),
        "platform": platform.platform(),
        "kernel": platform.version(),
        "uptime": uptime_str,
        "hostname": socket.gethostname(),
    }

def get_docker_info():
    running_in_docker = "No"
    container_id = "N/A"
    image = "N/A"
    volumes = "N/A"
    # Detect docker via cgroup or env variables
    try:
        with open('/proc/1/cgroup', 'rt') as f:
            cgroup_content = f.read()
            if 'docker' in cgroup_content or 'kubepods' in cgroup_content:
                running_in_docker = "Yes"
    except Exception:
        pass

    # container_id: try to get from hostname or cgroup
    try:
        container_id = socket.gethostname()
    except Exception:
        pass

    # image and volumes require Docker API or env variables — leaving as N/A for now
    return {
        "runningInDocker": running_in_docker,
        "containerID": container_id,
        "image": image,
        "volumes": volumes,
    }

def get_modix_info():
    # You should replace these with actual values or environment variables your Modix app sets
    return {
        "version": os.getenv("MODIX_VERSION", "1.0.0"),
        "gitCommit": os.getenv("MODIX_GIT_COMMIT", "abcdef123"),
        "buildTime": os.getenv("MODIX_BUILD_TIME", "2025-08-01T12:00:00Z"),
        "environment": os.getenv("MODIX_ENV", "development"),
        "apiPort": os.getenv("MODIX_API_PORT", "8000"),
        "frontendPort": os.getenv("MODIX_FRONTEND_PORT", "3000"),
    }

def get_gpu_info():
    # Detect GPU info - platform dependent
    # For Linux, try `lspci`, for Windows, can be more complex; this is a basic placeholder
    try:
        lspci = subprocess.run(['lspci'], capture_output=True, text=True)
        gpu_lines = [line for line in lspci.stdout.splitlines() if 'VGA compatible controller' in line or '3D controller' in line]
        gpu_model = gpu_lines[0] if gpu_lines else "N/A"
    except Exception:
        gpu_model = "N/A"

    # Driver, VRAM, CUDA detection left as N/A for simplicity
    return {
        "model": gpu_model,
        "driver": "N/A",
        "vram": "N/A",
        "cuda": "N/A",
    }

def get_extra_info():
    try:
        timezone = datetime.datetime.now(datetime.timezone.utc).astimezone().tzname()
    except Exception:
        timezone = "N/A"

    locale = os.getenv("LC_ALL") or os.getenv("LANG") or "N/A"
    shell = os.getenv("SHELL") or "N/A"

    # Python version and FastAPI version
    import sys
    import fastapi
    python_version = sys.version.split(" ")[0]
    fastapi_version = fastapi.__version__

    # Node.js version via subprocess (if node installed)
    try:
        node_version = subprocess.check_output(["node", "-v"], text=True).strip()
    except Exception:
        node_version = "N/A"

    return {
        "timezone": timezone,
        "locale": locale,
        "shell": shell,
        "python": f"Python {python_version} + FastAPI {fastapi_version}",
        "nodejs": node_version,
    }


@app.get("/api/server-info")
async def server_info():
    return {
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
