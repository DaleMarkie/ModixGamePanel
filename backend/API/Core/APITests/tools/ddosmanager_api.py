# /project/workspace/backend/API/Core/APITests/tools/ddos_manager_api.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, IPvAnyAddress
from typing import List
from fastapi.responses import JSONResponse

router = APIRouter()

# Mock data stores (replace with real DB or Docker API integration)
docker_containers = [
    {"id": "container1", "name": "Game Server 1", "status": "running", "underAttack": False},
    {"id": "container2", "name": "Game Server 2", "status": "running", "underAttack": True},
    {"id": "container3", "name": "Game Server 3", "status": "stopped", "underAttack": False},
]

suspicious_ips = [
    {"ip": "192.168.1.101", "threatLevel": "high"},
    {"ip": "10.0.0.5", "threatLevel": "medium"},
    {"ip": "172.16.0.20", "threatLevel": "low"},
]

blocked_ips = set()

class BlockIpRequest(BaseModel):
    ip: IPvAnyAddress

@router.get("/docker/containers", response_model=List[dict])
async def get_docker_containers():
    """
    Return the list of Docker containers with attack status.
    """
    return docker_containers

@router.get("/ddos/suspicious-ips", response_model=List[dict])
async def get_suspicious_ips():
    """
    Return the list of suspicious IP addresses.
    """
    # Filter out blocked IPs (optional)
    filtered = [ip for ip in suspicious_ips if ip["ip"] not in blocked_ips]
    return filtered

@router.post("/ddos/block-ip")
async def block_ip(request: BlockIpRequest):
    """
    Block a suspicious IP address.
    """
    ip_to_block = str(request.ip)
    # Check if IP already blocked
    if ip_to_block in blocked_ips:
        raise HTTPException(status_code=400, detail=f"IP {ip_to_block} is already blocked.")

    # Add IP to blocked list
    blocked_ips.add(ip_to_block)

    # Remove IP from suspicious_ips list if present
    global suspicious_ips
    suspicious_ips = [ip for ip in suspicious_ips if ip["ip"] != ip_to_block]

    # TODO: Add real firewall/blocking logic here

    return JSONResponse({"detail": f"IP {ip_to_block} blocked successfully."})
