import os
import configparser
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

router = APIRouter()

# Default Project Zomboid server config folder
PZ_CONFIG_DIR = os.path.join(os.environ["USERPROFILE"], "Zomboid", "Server")

def find_pz_ini() -> str:
    """Automatically locate the first Project Zomboid server INI."""
    if not os.path.exists(PZ_CONFIG_DIR):
        raise FileNotFoundError(f"PZ server folder not found at {PZ_CONFIG_DIR}")
    for file in os.listdir(PZ_CONFIG_DIR):
        if file.lower().endswith(".ini"):
            return os.path.join(PZ_CONFIG_DIR, file)
    raise FileNotFoundError("No INI file found in PZ server folder")

def read_pz_settings(ini_path: str):
    """Read Project Zomboid ini into a dictionary."""
    if not os.path.exists(ini_path):
        return {}
    config = configparser.ConfigParser()
    config.read(ini_path)
    settings = {}
    for section in config.sections():
        for key, value in config.items(section):
            if value.lower() in ["true", "false"]:
                value_cast = value.lower() == "true"
            elif value.isdigit():
                value_cast = int(value)
            else:
                try:
                    value_cast = float(value)
                except:
                    value_cast = value
            settings.setdefault(section, {})[key] = value_cast
    return settings

def write_pz_settings(settings: dict, ini_path: str):
    """Write dictionary back to ini file."""
    config = configparser.ConfigParser()
    if os.path.exists(ini_path):
        config.read(ini_path)
    for section, values in settings.items():
        if not config.has_section(section):
            config.add_section(section)
        for key, value in values.items():
            config.set(section, key, str(value))
    with open(ini_path, "w") as f:
        config.write(f)

# ---------------------------
# Endpoints
# ---------------------------

@router.get("/settings/108600")  # Project Zomboid
async def get_pz_settings():
    try:
        ini_path = find_pz_ini()
        return read_pz_settings(ini_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/settings/save/108600")
async def save_pz_settings(request: Request):
    data = await request.json()
    try:
        ini_path = find_pz_ini()
        write_pz_settings(data, ini_path)
        return JSONResponse({"success": True})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
