from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
import shutil
import subprocess
import socket
import asyncio
from typing import Optional, Dict, Any
from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import configparser
from datetime import datetime
import psutil
import re
import threading

app = FastAPI(title="Modix Panel Backend (Stub)")

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Health & Diagnostics
# ---------------------------
@app.get("/health")
def health_check():
    return {"success": True, "status": "ok"}

@app.get("/check-port")
def check_port(port: int):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        in_use = s.connect_ex(("127.0.0.1", port)) == 0
    return {"port": port, "inUse": in_use}

# ---------------------------
# Global Server Process + Log Queue
# ---------------------------
running_process = None
log_queue: asyncio.Queue = asyncio.Queue()

def check_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0

async def stream_subprocess_output(stream, prefix: str):
    loop = asyncio.get_event_loop()
    while True:
        line = await loop.run_in_executor(None, stream.readline)
        if not line:
            break
        await log_queue.put(f"[{prefix}] {line.strip()}")

async def monitor_process_exit(process):
    global running_process
    await asyncio.get_event_loop().run_in_executor(None, process.wait)
    await log_queue.put("[SYSTEM] Server stopped")
    running_process = None

# ---------------------------
# Project Zomboid Server Start/Stop + Logs
# ---------------------------
@app.post("/api/projectzomboid/start")
async def start_pz_server(request: Request):
    global running_process
    if running_process:
        return error_response("BACKEND_001", 400, "Server already running")

    try:
        data = await request.json()
        port = data.get("port", 16261)
        batch_file = data.get(
            "batchFile",
            r"C:\Program Files (x86)\Steam\steamapps\common\Project Zomboid Dedicated Server\StartServer32.bat"
        )

        if not os.path.isfile(batch_file):
            return error_response("GAME_002", 404, f"Batch file not found: {batch_file}")

        if check_port_in_use(port):
            return error_response("PORT_004", 409, f"Port {port} already in use")

        running_process = subprocess.Popen(
            f'cmd /c "{batch_file}"',
            cwd=os.path.dirname(batch_file),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True,
            text=True,
            bufsize=1
        )

        asyncio.create_task(stream_subprocess_output(running_process.stdout, "OUT"))
        asyncio.create_task(stream_subprocess_output(running_process.stderr, "ERR"))
        asyncio.create_task(monitor_process_exit(running_process))

        # Update DDoS API server status
        set_server_status("running")

        return {"status": "running", "message": "Server started successfully"}
    except Exception as e:
        running_process = None
        set_server_status("stopped")
        return error_response("BACKEND_001", 500, str(e))

@app.post("/api/projectzomboid/stop")
async def stop_pz_server():
    global running_process
    if not running_process:
        return {"status": "stopped", "message": "Server not running"}

    running_process.terminate()
    running_process = None

    await log_queue.put("[SYSTEM] Server stopped manually")

    # Update DDoS API server status
    set_server_status("stopped")

    return {"status": "stopped", "message": "Server terminated"}

@app.get("/api/projectzomboid/terminal/log-stream")
async def terminal_log_stream():
    async def event_generator():
        while True:
            log = await log_queue.get()
            yield f"data: {log}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")

# ---------------------------
# Modcards (in-memory storage)
# ---------------------------
saved_mod_notes = {}

@app.post("/api/save-mod-notes")
async def save_mod_notes(request: Request):
    data = await request.json()
    workshop_id = data.get("workshopId")
    notes = data.get("notes", "")
    categories = data.get("categories", [])

    if not workshop_id:
        return JSONResponse({"error": "Missing workshopId"}, status_code=400)

    saved_mod_notes[workshop_id] = {"notes": notes, "categories": categories}

    return {"message": "Notes saved", "data": saved_mod_notes[workshop_id]}

# ---------------------------
# Project Zomboid Mod Alerts
# ---------------------------
import json

WORKSHOP_PATH = os.path.expanduser("~/Steam/steamapps/workshop/content/108600")
SERVER_INI_PATH = os.path.join(os.path.expanduser("~"), "Zomboid", "Server", "servertest.ini")

def read_installed_mods_from_ini() -> list[str]:
    """Read the Mods= line from server.ini and return a list of mod IDs"""
    config = configparser.ConfigParser()
    config.optionxform = str
    if not os.path.isfile(SERVER_INI_PATH):
        return []
    config.read(SERVER_INI_PATH, encoding="utf-8")
    if not config.has_section("Mods") or not config.has_option("Mods", "Mods"):
        return []
    mods_line = config.get("Mods", "Mods")
    return [m.strip() for m in mods_line.split(";") if m.strip()]

def scan_local_workshop() -> list[dict]:
    """Scan local Workshop folder for installed mods"""
    mods = []
    if not os.path.isdir(WORKSHOP_PATH):
        return mods
    for mod_id in os.listdir(WORKSHOP_PATH):
        mod_folder = os.path.join(WORKSHOP_PATH, mod_id)
        if os.path.isdir(mod_folder):
            mod_info_path = os.path.join(mod_folder, "mod.info.json")
            if os.path.isfile(mod_info_path):
                try:
                    with open(mod_info_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        mods.append({
                            "modId": mod_id,
                            "title": data.get("name", f"Mod {mod_id}"),
                            "version": data.get("version"),
                            "dependencies": data.get("dependencies", []),
                        })
                except Exception:
                    mods.append({"modId": mod_id, "title": f"Mod {mod_id}"})
            else:
                mods.append({"modId": mod_id, "title": f"Mod {mod_id}"})
    return mods

import httpx

# ---------------------------
# Remote License Verification
# ---------------------------
REMOTE_LICENSE_SERVER = "http://REMOTE_FLASK_SERVER_IP:5000"  # replace with your remote Flask server IP

@app.post("/api/licenses/verify-remote")
async def verify_remote_license(request: Request):
    """
    Verify a license code by querying the remote Flask license server.
    Expects JSON: { "license_code": "CODE123" }
    """
    data = await request.json()
    code = data.get("license_code", "").upper()

    if not code:
        return JSONResponse({"success": False, "detail": "Missing license code"}, status_code=400)

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"{REMOTE_LICENSE_SERVER}/api/licenses/verify",
                json={"license_code": code}
            )
            license_data = response.json()

        if response.status_code == 200 and license_data.get("success"):
            return {"success": True, "license": license_data.get("license")}
        else:
            return JSONResponse({
                "success": False,
                "detail": license_data.get("detail", "Invalid or expired license")
            }, status_code=404)

    except httpx.RequestError as e:
        return JSONResponse({
            "success": False,
            "detail": f"Could not reach remote license server: {str(e)}"
        }, status_code=502)

# ---------------------------
# Project Zomboid Server Start/Stop (Windows/Linux Support)
# ---------------------------
running_pz_process: Optional[subprocess.Popen] = None
pz_log_queue: asyncio.Queue = asyncio.Queue()

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0

async def stream_pz_output(stream, prefix: str):
    loop = asyncio.get_event_loop()
    while True:
        line = await loop.run_in_executor(None, stream.readline)
        if not line:
            break
        log_text = line.strip()
        await pz_log_queue.put(f"[{prefix}] {log_text}")

        # Update connected players in real-time
        parse_pz_log_for_players(log_text)

async def monitor_pz_exit(process: subprocess.Popen):
    global running_pz_process
    await asyncio.get_event_loop().run_in_executor(None, process.wait)
    await pz_log_queue.put("[SYSTEM] Server stopped")
    running_pz_process = None

@app.post("/api/projectzomboid/start")
async def start_project_zomboid(request: Request):
    global running_pz_process
    if running_pz_process:
        return error_response("BACKEND_001", 400, "Server already running")

    data = await request.json()
    os_type = data.get("os", "windows").lower()  # 'windows' or 'linux'
    batch_file = data.get("batchFile")
    port = data.get("port", 16261)

    if not batch_file or not os.path.isfile(batch_file):
        return error_response("GAME_002", 404, f"Batch/sh file not found: {batch_file}")

    if is_port_in_use(port):
        return error_response("PORT_004", 409, f"Port {port} already in use")

    try:
        if os_type == "windows":
            running_pz_process = subprocess.Popen(
                f'cmd /c "{batch_file}"',
                cwd=os.path.dirname(batch_file),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                shell=True,
                text=True,
                bufsize=1
            )
        elif os_type == "linux":
            running_pz_process = subprocess.Popen(
                ["bash", batch_file],
                cwd=os.path.dirname(batch_file),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1
            )
        else:
            return error_response("GAME_001", 400, f"Unknown OS: {os_type}")

        asyncio.create_task(stream_pz_output(running_pz_process.stdout, "OUT"))
        asyncio.create_task(stream_pz_output(running_pz_process.stderr, "ERR"))
        asyncio.create_task(monitor_pz_exit(running_pz_process))

        return {"status": "running", "message": f"Project Zomboid ({os_type}) server started"}
    except Exception as e:
        running_pz_process = None
        return error_response("BACKEND_001", 500, str(e))

@app.post("/api/projectzomboid/stop")
async def stop_project_zomboid():
    global running_pz_process
    if not running_pz_process:
        return {"status": "stopped", "message": "Server not running"}

    running_pz_process.terminate()
    running_pz_process = None
    await pz_log_queue.put("[SYSTEM] Server stopped manually")
    return {"status": "stopped", "message": "Server terminated"}

@app.get("/api/projectzomboid/terminal/log-stream")
async def pz_terminal_log_stream():
    async def event_generator():
        while True:
            log = await pz_log_queue.get()
            yield f"data: {log}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api_main:app", host="0.0.0.0", port=2010, reload=True)
