from fastapi import APIRouter
from fastapi.responses import JSONResponse
import os
import time
import json

router = APIRouter()

WORKSHOP_PATH = os.path.expanduser("~/Steam/steamapps/workshop/content/108600")

@router.get("/mods/updates")
async def get_mod_updates():
    """
    Returns all locally installed Project Zomboid Steam Workshop mods with metadata.
    Includes lastModified timestamp for live detection.
    """
    if not os.path.isdir(WORKSHOP_PATH):
        return JSONResponse(
            {"mods": [], "error": "Workshop folder not found."}, status_code=404
        )

    mods = []
    for mod_id in os.listdir(WORKSHOP_PATH):
        mod_folder = os.path.join(WORKSHOP_PATH, mod_id)
        mod_info_json = os.path.join(mod_folder, "mod.info.json")

        if not os.path.isdir(mod_folder):
            continue

        mod_data = {"id": mod_id, "folder": mod_folder}

        # Read metadata
        if os.path.isfile(mod_info_json):
            try:
                with open(mod_info_json, "r", encoding="utf-8") as f:
                    info = json.load(f)
                    mod_data["name"] = info.get("name", f"Mod {mod_id}")
                    mod_data["description"] = info.get("description", "No description.")
                    mod_data["version"] = info.get("version", "unknown")
                    mod_data["dependencies"] = info.get("dependencies", [])
            except Exception:
                mod_data["name"] = f"Mod {mod_id}"
                mod_data["description"] = "Failed to read mod.info.json"
                mod_data["version"] = "unknown"
                mod_data["dependencies"] = []
        else:
            mod_data["name"] = f"Mod {mod_id}"
            mod_data["description"] = "No description."
            mod_data["version"] = "unknown"
            mod_data["dependencies"] = []

        # Add last modified timestamp (for update detection)
        try:
            mod_data["lastModified"] = int(os.path.getmtime(mod_folder))
            mod_data["localVersion"] = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(mod_data["lastModified"]))
        except Exception:
            mod_data["lastModified"] = 0
            mod_data["localVersion"] = "unknown"

        mods.append(mod_data)

    return {"mods": mods}
