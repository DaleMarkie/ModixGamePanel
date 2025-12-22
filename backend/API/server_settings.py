import os
import configparser
from fastapi import APIRouter, Query, HTTPException, Body
from fastapi.responses import JSONResponse
from typing import Dict

router = APIRouter()

# ---------------------------
# Paths
# ---------------------------
INI_FOLDER = os.path.join(os.path.expanduser("~"), "Zomboid", "Server")
os.makedirs(INI_FOLDER, exist_ok=True)

# ---------------------------
# UTILITIES
# ---------------------------
def list_ini_files():
    """Return sorted list of .ini files in the folder."""
    return sorted([f for f in os.listdir(INI_FOLDER) if f.endswith(".ini")])

def read_ini(file: str) -> Dict:
    """Read .ini file and parse values as string, bool, or number."""
    path = os.path.join(INI_FOLDER, file)
    if not os.path.isfile(path):
        raise FileNotFoundError(f"{file} not found at {path}")
    
    config = configparser.ConfigParser()
    config.optionxform = str
    config.read(path, encoding="utf-8")
    
    data = {}
    for section in config.sections():
        data[section] = {}
        for key, value in config.items(section):
            # Detect boolean
            if value.lower() in ["true", "false"]:
                data[section][key] = config.getboolean(section, key)
            # Detect number
            elif value.replace(".", "", 1).isdigit():
                data[section][key] = float(value) if "." in value else int(value)
            else:
                data[section][key] = value
    return data

def write_ini(file: str, data: Dict):
    """Write dictionary back to .ini file."""
    path = os.path.join(INI_FOLDER, file)
    try:
        config = configparser.ConfigParser()
        config.optionxform = str
        for section, values in data.items():
            config[section] = {k: str(v) for k, v in values.items()}
        with open(path, "w", encoding="utf-8") as f:
            config.write(f)
    except PermissionError:
        raise HTTPException(status_code=403, detail=f"No permission to write {file}")

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
    except HTTPException as he:
        raise he
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
