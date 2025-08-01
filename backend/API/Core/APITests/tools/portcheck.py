from fastapi import APIRouter, HTTPException
import socket
import docker

router = APIRouter()
client = docker.from_env()


def is_port_open(host: str, port: int, timeout: float = 2.0) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except Exception:
        return False


@router.get("/portcheck")
def port_check(host: str, port: int):
    if not host or not port:
        raise HTTPException(status_code=400, detail="Missing host or port")
    status = "open" if is_port_open(host, port) else "closed"
    return {"host": host, "port": port, "status": status}


@router.get("/containers")
def list_containers():
    containers_info = []
    for container in client.containers.list():
        try:
            ports = container.attrs["NetworkSettings"]["Ports"]
            main_port = next(iter(ports.keys()))
            host_port = ports[main_port][0]["HostPort"]
            status = (
                "open" if is_port_open("127.0.0.1", int(host_port)) else "closed"
            )
            containers_info.append({
                "name": container.name,
                "image": container.image.tags[0] if container.image.tags else "unknown",
                "port": int(host_port),
                "status": status
            })
        except Exception:
            continue
    return containers_info


@router.post("/containers/{name}/restart")
def restart_container(name: str):
    try:
        container = client.containers.get(name)
        container.restart()
        return {"detail": f"{name} restarted"}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Container not found")


@router.post("/containers/{name}/stop")
def stop_container(name: str):
    try:
        container = client.containers.get(name)
        container.stop()
        return {"detail": f"{name} stopped"}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Container not found")
