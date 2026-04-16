import subprocess
import os
import signal

# CHANGE THIS PATH TO YOUR PROJECT ZOMBOID SERVER SCRIPT
SERVER_SCRIPT = "/home/ritchiedale72/zomboid/start-server.sh"

PID_FILE = "/tmp/zomboid_server.pid"


def start_server():
    if os.path.exists(PID_FILE):
        return {"error": "Server already running"}

    try:
        process = subprocess.Popen(
            ["bash", SERVER_SCRIPT],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            preexec_fn=os.setsid
        )

        with open(PID_FILE, "w") as f:
            f.write(str(process.pid))

        return {"output": f"Server started (PID {process.pid})"}

    except Exception as e:
        return {"error": str(e)}


def stop_server():
    if not os.path.exists(PID_FILE):
        return {"error": "Server not running"}

    try:
        with open(PID_FILE, "r") as f:
            pid = int(f.read())

        os.killpg(os.getpgid(pid), signal.SIGTERM)
        os.remove(PID_FILE)

        return {"output": "Server stopped"}

    except Exception as e:
        return {"error": str(e)}


def restart_server():
    stop_server()
    return start_server()


def status():
    return {"running": os.path.exists(PID_FILE)}