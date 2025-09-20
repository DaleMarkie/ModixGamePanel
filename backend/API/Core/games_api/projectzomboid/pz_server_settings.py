import os
import shutil
import configparser
from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, Request, Query
from fastapi.responses import JSONResponse

router = APIRouter()

# ---------------------------
# Project Zomboid Settings
# ---------------------------

def get_pz_server_folder() -> str:
    home = os.path.expanduser("~")
    return os.path.join(home, "Zomboid", "Server")

def resolve_ini_path(ini_name: str) -> str:
    folder = get_pz_server_folder()
    return os.path.join(folder, ini_name)

def cast_value(value: str) -> Any:
    if isinstance(value, (bool, int, float)):
        return value
    v = str(value).strip()
    low = v.lower()
    if low in ("true", "false"):
        return low == "true"
    try:
        if "." in v:
            return float(v)
        return int(v)
    except ValueError:
        return v

def error_response(code: str, status: int, message: str):
    return JSONResponse(content={"error": {"code": code, "message": message}}, status_code=status)


@router.get("/settings/list")
async def list_pz_ini_files():
    folder = get_pz_server_folder()
    if not os.path.isdir(folder):
        return JSONResponse(content={"folder": folder, "files": []})
    files = [f for f in os.listdir(folder) if f.lower().endswith(".ini")]
    return JSONResponse(content={"folder": folder, "files": files})


@router.get("/settings")
async def get_pz_server_settings(ini: str = Query("servertest.ini", description="INI filename inside ~/Zomboid/Server")):
    ini_path = resolve_ini_path(ini)
    if not os.path.isfile(ini_path):
        return error_response("GAME_002", 404, f"INI not found: {ini_path}")

    config = configparser.ConfigParser()
    config.optionxform = str
    config.read(ini_path, encoding="utf-8")

    result: Dict[str, Dict[str, Any]] = {}
    for section in config.sections():
        result[section] = {}
        for key, value in config.items(section):
            result[section][key] = cast_value(value)

    return JSONResponse(content={"folder": get_pz_server_folder(), "ini": ini, "settings": result})


@router.post("/settings")
async def save_pz_server_settings(request: Request):
    data = await request.json()
    ini_name: str = data.get("ini", "servertest.ini")
    updates: Dict[str, Dict[str, Any]] = data.get("updates", {})
    do_backup: bool = data.get("backup", True)

    ini_path = resolve_ini_path(ini_name)
    folder = get_pz_server_folder()
    os.makedirs(folder, exist_ok=True)

    if not os.path.isfile(ini_path):
        with open(ini_path, "w", encoding="utf-8") as f:
            f.write("")

    if do_backup:
        ts = datetime.now().strftime("%Y%m%d-%H%M%S")
        backup_path = f"{ini_path}.bak.{ts}"
        try:
            shutil.copy2(ini_path, backup_path)
        except Exception:
            pass

    config = configparser.ConfigParser()
    config.optionxform = str
    config.read(ini_path, encoding="utf-8")

    for section, kv in (updates or {}).items():
        if not config.has_section(section):
            config.add_section(section)
        for key, value in (kv or {}).items():
            config.set(section, key, str(value))

    with open(ini_path, "w", encoding="utf-8") as f:
        config.write(f)

    return {"status": "success", "ini": ini_name, "path": ini_path}
