from backend.API.Core import container_io_service
from fastapi import APIRouter, WebSocket, Depends
import asyncio
import logging
from backend.API.Core.auth import get_db
import psutil
import subprocess
import time
import socket
import platform
from datetime import datetime
import docker
import os

router = APIRouter(tags=["Terminal"])
logger = logging.getLogger("terminal_api")
docker_client = docker.from_env()

CONTAINER_NAME = "my_game_server"  # Adjust if needed

@router.websocket("/ws/terminal/{container_id}")
async def websocket_terminal(
    websocket: WebSocket,
    container_id: str,
    db=Depends(get_db),
):
    print(f"[DEBUG] ALL HEADERS (terminal): {websocket.headers}")
    await websocket.accept()
    sock = None
    try:
        try:
            logs = await container_io_service.get_container_logs(container_id, tail=100)
            for line in logs:
                try:
                    await websocket.send_json({"output": line.decode(errors='replace')})
                except Exception as e:
                    print(f"[DEBUG] Failed to send previous log line: {e} | line: {line}")
        except Exception as e:
            print(f"[DEBUG] Failed to fetch/send previous logs: {e}")

        sock = await container_io_service.attach_container_socket(container_id)
    except Exception as e:
        await websocket.send_json({"error": f"Failed to attach to container: {e}"})
        await websocket.close()
        return

    try:
        await asyncio.gather(
            container_io_service.relay_container_output(sock, websocket),
            container_io_service.relay_container_input(sock, websocket)
        )
    except asyncio.CancelledError:
        print("[DEBUG] WebSocket handler cancelled (client disconnect or shutdown).")
    finally:
        try:
            if sock:
                sock.close()
                print("[DEBUG] Docker socket closed.")
        except Exception as e:
            print(f"[DEBUG] Exception closing Docker socket: {e}")
        try:
            if not websocket.client_state.name == "DISCONNECTED":
                await websocket.close()
                print("[DEBUG] WebSocket closed.")
        except Exception as e:
            print(f"[DEBUG] Exception closing WebSocket: {e}")

# --- New system health endpoint below ---

def get_uptime():
    uptime_seconds = time.time() - psutil.boot_time()
    return time.strftime("%H:%M:%S", time.gmtime(uptime_seconds))

def get_downtime():
    return "00:00:00"

def get_cpu_load():
    return psutil.cpu_percent(interval=1)

def get_memory_usage():
    mem = psutil.virtual_memory()
    return {"used_gb": round(mem.used / (1024**3), 2), "total_gb": round(mem.total / (1024**3), 2)}

def get_swap_usage():
    swap = psutil.swap_memory()
    return {"used_gb": round(swap.used / (1024**3), 2), "total_gb": round(swap.total / (1024**3), 2)}

def get_disk_usage():
    disk = psutil.disk_usage('/')
    return {"used_gb": round(disk.used / (1024**3), 2), "total_gb": round(disk.total / (1024**3), 2)}

def get_disk_io():
    io_counters = psutil.disk_io_counters()
    return {"read_bytes": io_counters.read_bytes, "write_bytes": io_counters.write_bytes}

def get_filesystem_health():
    usage_percent = psutil.disk_usage('/').percent
    return "OK" if usage_percent < 90 else "WARNING"

def get_network_traffic():
    net_io = psutil.net_io_counters()
    return {"bytes_sent": net_io.bytes_sent, "bytes_recv": net_io.bytes_recv}

def get_ping(host="8.8.8.8"):
    try:
        output = subprocess.check_output(
            ["ping", "-c", "1", "-W", "1", host], stderr=subprocess.STDOUT, universal_newlines=True
        )
        for line in output.split('\n'):
            if 'time=' in line:
                return float(line.split('time=')[1].split()[0])
        return None
    except Exception:
        return None

def get_firewall_status():
    try:
        output = subprocess.check_output(['ufw', 'status'], universal_newlines=True)
        return "Active" if "Status: active" in output else "Inactive"
    except Exception:
        return "Unknown"

def get_active_processes():
    return len(psutil.pids())

def get_top_process():
    processes = [(p.info["name"], p.info["cpu_percent"]) for p in psutil.process_iter(attrs=["name", "cpu_percent"])]
    if not processes:
        return {"name": "N/A", "cpu_percent": 0}
    top_proc = max(processes, key=lambda x: x[1])
    return {"name": top_proc[0], "cpu_percent": top_proc[1]}

def get_load_average():
    return os.getloadavg()

def get_docker_running():
    try:
        container = docker_client.containers.get(CONTAINER_NAME)
        return container.status == "running"
    except docker.errors.NotFound:
        return False

def get_service_status():
    try:
        output = subprocess.check_output(["systemctl", "is-active", "docker"], universal_newlines=True).strip()
        return output
    except Exception:
        return "Unknown"

def get_game_server_pid():
    try:
        container = docker_client.containers.get(CONTAINER_NAME)
        return container.attrs["State"]["Pid"]
    except Exception:
        return None

def get_timezone():
    return time.tzname[time.daylight]

def get_server_location():
    try:
        hostname = socket.gethostname()
        ip_addr = socket.gethostbyname(hostname)
        return {"hostname": hostname, "ip": ip_addr, "location": "Unknown"}
    except Exception:
        return {"hostname": "Unknown", "ip": "Unknown", "location": "Unknown"}

@router.get("/api/server-health")
async def server_health():
    now = datetime.utcnow().isoformat() + "Z"
    return {
        "uptime": get_uptime(),
        "downtime": get_downtime(),
        "status": "Running" if get_docker_running() else "Stopped",
        "cpu_load_percent": get_cpu_load(),
        "memory_usage": get_memory_usage(),
        "swap_usage": get_swap_usage(),
        "storage_usage": get_disk_usage(),
        "disk_io_read_bytes": get_disk_io()["read_bytes"],
        "disk_io_write_bytes": get_disk_io()["write_bytes"],
        "filesystem_health": get_filesystem_health(),
        "network_inbound_bytes": get_network_traffic()["bytes_recv"],
        "network_outbound_bytes": get_network_traffic()["bytes_sent"],
        "ping_ms": get_ping() or "N/A",
        "firewall_status": get_firewall_status(),
        "active_processes": get_active_processes(),
        "top_process": get_top_process(),
        "load_average": get_load_average(),
        "docker_running": get_docker_running(),
        "service_status": get_service_status(),
        "game_server_pid": get_game_server_pid(),
        "timezone": get_timezone(),
        "server_location": get_server_location(),
        "last_checked": now,
    }
