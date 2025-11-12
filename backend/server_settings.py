# server_settings.py
import os
import configparser
from fastapi import APIRouter, Body, HTTPException

router = APIRouter(tags=["Server Settings"])

# Paths
SERVER_INI_PATH = os.path.expanduser("~/Zomboid/Server/servertest.ini")
SANDBOX_PATH = os.path.expanduser("~/Zomboid/Server/SandboxVars.lua")

# Default values if missing
DEFAULTS = {
    "PublicName": "PZ Server",
    "MaxPlayers": 10,
    "PVP": False,
    "ZombieCount": 50,
    "XPMultiplier": 1,
}

# ---------------------------
# Helpers
# ---------------------------

def read_ini_full(path: str) -> dict:
    """Read all sections of servertest.ini, return flattened dict."""
    config = configparser.ConfigParser()
    config.read(path, encoding="utf-8")
    data = {}
    for section in config.sections():
        for k, v in config[section].items():
            key = f"{section}.{k}"  # flatten with section prefix
            if v.lower() in ["true", "false"]:
                data[key] = v.lower() == "true"
            else:
                try:
                    data[key] = int(v)
                except ValueError:
                    data[key] = v
    # Also include [DEFAULT] section
    for k, v in config.defaults().items():
        if k not in data:
            if v.lower() in ["true", "false"]:
                data[k] = v.lower() == "true"
            else:
                try:
                    data[k] = int(v)
                except ValueError:
                    data[k] = v
    return data

def write_ini_full(path: str, settings: dict):
    """Write settings to servertest.ini while preserving unknown sections."""
    config = configparser.ConfigParser()
    if os.path.exists(path):
        config.read(path, encoding="utf-8")

    for k, v in settings.items():
        if "." in k:
            section, key = k.split(".", 1)
        else:
            section, key = "DEFAULT", k
        if section not in config:
            config[section] = {}
        config[section][key] = str(v)

    with open(path, "w", encoding="utf-8") as f:
        config.write(f)

def read_sandbox(path: str) -> dict:
    """Read SandboxVars.lua key=value lines."""
    data = {}
    if not os.path.exists(path):
        return data
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("--"):
                k, v = line.split("=", 1)
                try:
                    data[k.strip()] = int(v)
                except ValueError:
                    data[k.strip()] = v.strip()
    return data

def write_sandbox(path: str, settings: dict):
    """Write SandboxVars.lua key=value lines (excluding ini keys)."""
    lines = [f"{k}={v}" for k, v in settings.items() if k not in ["PublicName","MaxPlayers","PVP"]]
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

# ---------------------------
# API Endpoints
# ---------------------------

@router.get("/")
async def get_server_settings():
    ini_data = read_ini_full(SERVER_INI_PATH)
    sandbox_data = read_sandbox(SANDBOX_PATH)
    merged = {**DEFAULTS, **ini_data, **sandbox_data}
    return merged

@router.post("/save")
async def save_server_settings(data: dict = Body(...)):
    try:
        # Split ini vs sandbox keys
        ini_keys = {k: v for k, v in data.items() if k in ["PublicName", "MaxPlayers", "PVP"] or "." in k}
        sandbox_keys = {k: v for k, v in data.items() if k not in ini_keys}

        write_ini_full(SERVER_INI_PATH, ini_keys)
        write_sandbox(SANDBOX_PATH, sandbox_keys)

        return {"status": "success", "message": "Server settings saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
