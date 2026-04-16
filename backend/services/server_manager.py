import subprocess

SERVER_DIR = "/home/ritchiedale72/ZomboidServer"
SCREEN_NAME = "zomboidserver"


def start_server():
    check = subprocess.run(
        ["screen", "-ls"],
        capture_output=True,
        text=True
    )

    if SCREEN_NAME in check.stdout:
        return {"error": "Server already running"}

    cmd = f"cd {SERVER_DIR} && bash start-server.sh"

    subprocess.Popen([
        "screen",
        "-dmS",
        SCREEN_NAME,
        "bash",
        "-c",
        cmd
    ])

    return {"output": "Zomboid server started in screen session"}


def stop_server():
    subprocess.run(["screen", "-S", SCREEN_NAME, "-X", "quit"])
    return {"output": "Server stopped"}


def restart_server():
    stop_server()
    return start_server()


def status():
    check = subprocess.run(
        ["screen", "-ls"],
        capture_output=True,
        text=True
    )

    return {"running": SCREEN_NAME in check.stdout}