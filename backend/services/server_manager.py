import subprocess
import os
import signal
import asyncio

SERVER_DIR = os.path.expanduser("~/ModixGamePanel")
START_CMD = "./start.sh"

process = None


def start_server():
    global process

    if process and process.poll() is None:
        return {"status": "already_running"}

    process = subprocess.Popen(
        START_CMD,
        cwd=SERVER_DIR,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    return {"status": "started", "pid": process.pid}


def stop_server():
    global process

    if process and process.poll() is None:
        os.kill(process.pid, signal.SIGTERM)
        process = None
        return {"status": "stopped"}

    return {"status": "not_running"}


def restart_server():
    stop_server()
    return start_server()


def status():
    global process
    return {"status": "running" if process and process.poll() is None else "stopped"}


async def stream_output(websocket):
    global process

    if not process:
        await websocket.send_text("[SERVER NOT RUNNING]")
        return

    while True:
        if process.poll() is not None:
            await websocket.send_text("[SERVER STOPPED]")
            break

        line = process.stdout.readline()

        if line:
            await websocket.send_text(line.strip())

        await asyncio.sleep(0.05)