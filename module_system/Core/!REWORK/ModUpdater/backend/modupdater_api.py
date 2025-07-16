import logging
from fastapi import APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from datetime import datetime, timedelta
from typing import List
import os

router = APIRouter()
router = APIRouter(tags=["ModUpdater"], prefix="/modupdater")
logger = logging.getLogger("terminal_api")

STEAM_WORKSHOP_PATH = Path("/home/steam/Steam/steamapps/workshop/content/108600")
MOD_UPDATE_CUTOFF_DAYS = 7


def extract_mod_name(mod_folder: Path) -> str:
    """Try to extract the mod name from mod.info."""
    mod_info_path = mod_folder / "mod.info"
    if mod_info_path.exists():
        try:
            with mod_info_path.open("r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    line = line.strip()
                    if line.lower().startswith("name="):
                        return line.split("=", 1)[1].strip()
        except Exception as e:
            print(f"Failed to read mod.info for {mod_folder.name}: {e}")
    return f"Mod {mod_folder.name}"


@router.get("/mods/updated")
def get_recently_updated_mods() -> List[dict]:
    updated_mods = []
    now = datetime.now()
    cutoff = now - timedelta(days=MOD_UPDATE_CUTOFF_DAYS)

    if not STEAM_WORKSHOP_PATH.exists():
        return []

    for mod_folder in STEAM_WORKSHOP_PATH.iterdir():
        if mod_folder.is_dir():
            mod_id = mod_folder.name
            mod_path = str(mod_folder.resolve())
            last_modified = datetime.fromtimestamp(mod_folder.stat().st_mtime)

            if last_modified >= cutoff:
                mod_name = extract_mod_name(mod_folder)
                updated_mods.append({
                    "id": mod_id,
                    "name": mod_name,
                    "lastUpdated": last_modified.strftime("%B %d, %Y %H:%M"),
                    "path": mod_path
                })

    return updated_mods
