import subprocess
import os
import signal
from flask import Flask, request, jsonify

app = Flask(__name__)

server_process = None


def start_server(batch_path):
    global server_process

    if server_process:
        return {"error": "Server already running"}

    if not batch_path:
        return {"error": "No batch path provided"}

    server_process = subprocess.Popen(
        ["bash", batch_path],
        preexec_fn=os.setsid
    )

    return {"output": "Server started"}


def stop_server():
    global server_process

    if not server_process:
        return {"error": "Server not running"}

    os.killpg(os.getpgid(server_process.pid), signal.SIGTERM)
    server_process = None

    return {"output": "Server stopped"}


def restart_server(batch_path):
    stop_server()
    return start_server(batch_path)


def run_command(command):
    try:
        output = subprocess.check_output(command, shell=True, stderr=subprocess.STDOUT)
        return {"output": output.decode()}
    except subprocess.CalledProcessError as e:
        return {"error": e.output.decode()}


@app.post("/api/terminal")
def terminal():
    data = request.json
    action = data.get("action")
    batch_path = data.get("batchPath")
    command = data.get("command")

    if action == "start":
        return jsonify(start_server(batch_path))

    if action == "stop":
        return jsonify(stop_server())

    if action == "restart":
        return jsonify(restart_server(batch_path))

    if action == "command":
        return jsonify(run_command(command))

    return jsonify({"error": "unknown action"})


if __name__ == "__main__":
    app.run(port=8000)