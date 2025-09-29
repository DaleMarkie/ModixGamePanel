# backend/API/Core/settings_api/server_settings.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from configparser import ConfigParser
from typing import Dict, Any
import os

router = APIRouter(
    prefix="/api/server_settings",
    tags=["ServerSettingsAPI"]
)

# -------------------------
# Config
# -------------------------
GAME_FOLDERS = {
    "zomboid": os.path.expanduser("~/Zomboid/Server"),
}

INI_FILE_NAME = "servertest.ini"

# -------------------------
# Pydantic model
# -------------------------
class SettingsModel(BaseModel):
    settings: Dict[str, Any]

# -------------------------
# Helper functions
# -------------------------
def get_ini_path(game: str) -> str:
    folder = GAME_FOLDERS.get(game)
    if not folder:
        raise HTTPException(status_code=404, detail=f"Game {game} not supported")
    path = os.path.join(folder, INI_FILE_NAME)
    if not os.path.exists(path):
        raise HTTPException(
            status_code=404,
            detail=f"{INI_FILE_NAME} not found in {folder}. Please run the server at least once."
        )
    return path

def read_ini(game: str) -> Dict[str, Any]:
    path = get_ini_path(game)
    parser = ConfigParser()
    parser.optionxform = str
    parser.read(path, encoding="utf-8")

    data = {}
    for section in parser.sections():
        for key, val in parser.items(section):
            if val.lower() in ("true", "false"):
                data[key] = parser.getboolean(section, key)
            elif val.replace(".", "", 1).isdigit():
                data[key] = float(val) if "." in val else int(val)
            else:
                data[key] = val
    return data

def write_ini(game: str, settings: Dict[str, Any]):
    path = get_ini_path(game)
    parser = ConfigParser()
    parser.optionxform = str
    parser.read(path, encoding="utf-8")

    for key, val in settings.items():
        for section in parser.sections():
            if key in parser[section]:
                parser[section][key] = str(val)

    with open(path, "w", encoding="utf-8") as f:
        parser.write(f)

# -------------------------
# API Endpoints
# -------------------------
@router.get("/{game}")
async def get_server_settings(game: str):
    """Fetch live server settings from servertest.ini"""
    return {"game": game, "settings": read_ini(game)}

@router.post("/{game}")
async def save_server_settings(game: str, data: SettingsModel):
    """Update servertest.ini with new settings"""
    try:
        write_ini(game, data.settings)
        return {"status": "success", "game": game, "settings": data.settings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/schema/{game}")
async def get_server_schema(game: str):
    """Return dynamic categories + settings from ini sections"""
    path = get_ini_path(game)
    parser = ConfigParser()
    parser.optionxform = str
    parser.read(path, encoding="utf-8")

    categories = []
    for section in parser.sections():
        settings = []
        for key, val in parser.items(section):
            if val.lower() in ("true", "false"):
                type_ = "checkbox"
                value_type = "boolean"
                default = parser.getboolean(section, key)
            elif val.replace(".", "", 1).isdigit():
                type_ = "number"
                value_type = "number"
                default = float(val) if "." in val else int(val)
            else:
                type_ = "text"
                value_type = "string"
                default = val

            settings.append({
                "name": key,
                "label": key,
                "type": type_,
                "valueType": value_type,
                "default": default
            })

        categories.append({
            "category": section,
            "description": f"Section {section} from {INI_FILE_NAME}",
            "settings": settings
        })

    return {"game": game, "categories": categories}
