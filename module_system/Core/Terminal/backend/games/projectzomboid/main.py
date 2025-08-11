# /project/workspace/module_system/Core/Terminal/backend/games/projectzomboid/main.py

import asyncio
import docker
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS for your frontend domain or all for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with your frontend URL in prod
    allow_methods=["*"],
    allow_headers=["*"],
)

docker_client = docker.from_env()

@app.get("/status/{container_name}")
async def get_container_status(container_name: str):
    try:
        container = docker_client.containers.get(container_name)
        return {"status": container.status}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Container not found")

@app.post("/start/{container_name}")
async def start_container(container_name: str):
    try:
        container = docker_client.containers.get(container_name)
        if container.status != "running":
            container.start()
        return {"status": "started"}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Container not found")

@app.post("/stop/{container_name}")
async def stop_container(container_name: str):
    try:
        container = docker_client.containers.get(container_name)
        if container.status == "running":
            container.stop()
        return {"status": "stopped"}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Container not found")

# WebSocket terminal endpoint for real-time logs and command I/O
@app.websocket("/ws/terminal/{container_name}")
async def websocket_terminal(websocket: WebSocket, container_name: str):
    await websocket.accept()
    try:
        container = docker_client.containers.get(container_name)
    except docker.errors.NotFound:
        await websocket.send_text("Error: Container not found")
        await websocket.close()
        return

    if container.status != "running":
        await websocket.send_text("Error: Container is not running")
        await websocket.close()
        return

    # Create exec instance in the container for interactive shell
    exec_instance = docker_client.api.exec_create(
        container.id,
        cmd="/bin/sh",  # Or /bin/bash if available
        stdin=True,
        tty=True,
        stdout=True,
        stderr=True,
    )

    sock = docker_client.api.exec_start(exec_instance["Id"], detach=False, tty=True, stream=True, socket=True)

    async def docker_to_ws():
        loop = asyncio.get_event_loop()
        while True:
            try:
                data = await loop.run_in_executor(None, sock.recv, 1024)
                if data:
                    await websocket.send_text(data.decode(errors="ignore"))
                else:
                    break
            except Exception:
                break

    async def ws_to_docker():
        while True:
            try:
                data = await websocket.receive_text()
                if data:
                    sock.send(data.encode())
            except WebSocketDisconnect:
                break
            except Exception:
                break

    await asyncio.gather(docker_to_ws(), ws_to_docker())

    sock.close()
    await websocket.close()
