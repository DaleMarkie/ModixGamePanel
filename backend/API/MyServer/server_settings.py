import os
import configparser
from fastapi import APIRouter, Query, HTTPException, Body
from fastapi.responses import JSONResponse
from typing import Dict

router = APIRouter()

# ---------------------------
# Paths
# ---------------------------
INI_FOLDER = os.path.expanduser("~/Zomboid/Server")
if not os.path.exists(INI_FOLDER):
    os.makedirs(INI_FOLDER)

# ---------------------------
# UTILITIES
# ---------------------------
def list_ini_files():
    files = []
    for f in os.listdir(INI_FOLDER):
        if f.endswith(".ini"):
            files.append(f)
    return files

def read_ini(file: str) -> Dict:
    path = os.path.join(INI_FOLDER, file)
    if not os.path.isfile(path):
        raise FileNotFoundError(f"{file} not found.")
    config = configparser.ConfigParser()
    config.optionxform = str
    config.read(path, encoding="utf-8")
    data = {}
    for section in config.sections():
        data[section] = {}
        for key, value in config.items(section):
            # Try to parse boolean or number
            if value.lower() in ["true", "false"]:
                data[section][key] = config.getboolean(section, key)
            elif value.replace(".", "", 1).isdigit():
                data[section][key] = float(value) if "." in value else int(value)
            else:
                data[section][key] = value
    return data

def write_ini(file: str, data: Dict):
    path = os.path.join(INI_FOLDER, file)
    config = configparser.ConfigParser()
    config.optionxform = str
    for section, values in data.items():
        config[section] = {}
        for key, value in values.items():
            config[section][key] = str(value)
    with open(path, "w", encoding="utf-8") as f:
        config.write(f)

# ---------------------------
# ROUTES
# ---------------------------
@router.get("/list-inis")
def api_list_inis():
    try:
        files = list_ini_files()
        return files
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@router.get("/projectzomboid")
def api_get_ini(file: str = Query(...)):
    try:
        data = read_ini(file)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="INI file not found")
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@router.post("/projectzomboid")
def api_save_ini(file: str = Query(...), data: Dict = Body(...)):
    try:
        write_ini(file, data)
        return {"message": "Settings saved successfully."}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="INI file not found")
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
