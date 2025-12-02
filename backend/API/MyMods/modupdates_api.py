from fastapi import APIRouter
from fastapi.responses import JSONResponse
import os
import time
import json
import platform
import re

router = APIRouter()

def get_steam_library_paths() -> list[str]:
    """
    Detect all Steam library folders on Windows/Linux.
    This includes the default Steam path and any additional libraries
    from libraryfolders.vdf.
    """
    system = platform.system()
    base_paths = []

    if system == "Windows":
        possible_roots = [
            os.path.expandvars(r"%ProgramFiles(x86)%\Steam"),
            os.path.expandvars(r"%ProgramFiles%\Steam"),
            os.path.expanduser(r"~\Steam"),
        ]
    else:
        possible_roots = [
            os.path.expanduser("~/Steam"),
            os.path.expanduser("~/.steam/steam"),
            os.path.expanduser("~/.local/share/Steam"),
        ]

    for root in possible_roots:
        steamapps = os.path.join(root, "steamapps")
        if os.path.isdir(steamapps):
            base_paths.append(steamapps)

            # Also parse libraryfolders.vdf for other Steam libraries
            vdf_path = os.path.join(steamapps, "libraryfolders.vdf")
            if os.path.isfile(vdf_path):
                try:
                    with open(vdf_path, "r", encoding="utf-8") as f:
                        data = f.read()
                        # Look for lines like: "1" "D:\\SteamLibrary"
                        matches = re.findall(r'"\d+"\s+"([^"]+)"', data)
                        for match in matches:
                            path = os.path.join(match, "steamapps")
                            if os.path.isdir(path):
                                base_paths.append(path)
                except Exception:
                    pass

    return list(set(base_paths))  # Remove duplicates


def get_workshop_paths() -> list[str]:
    """
    Get all possible Project Zomboid Workshop content paths.
    """
    library_paths = get_steam_library_paths()
    workshop_paths = []
    for path in library_paths:
        content_path = os.path.join(path, "workshop", "content", "108600")
        if os.path.isdir(content_path):
            workshop_paths.append(content_path)
    return workshop_paths


def parse_mod_info(file_path: str) -> dict:
    """
    Parse mod.info file (text-based) and return a dictionary of key-value pairs.
    """
    info = {}
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if "=" in line:
                    key, value = line.split("=", 1)
                    info[key.strip()] = value.strip().strip('"')
    except Exception:
        pass
    return info


@router.get("/mods/updates")
async def get_mod_updates():
    """
    Returns all locally installed Project Zomboid Steam Workshop mods with metadata.
    Includes lastModified timestamp for live detection.
    Supports multiple Steam library locations.
    """
    workshop_paths = get_workshop_paths()
    if not workshop_paths:
        return JSONResponse(
            {"mods": [], "error": "No Project Zomboid workshop folders found."},
            status_code=404,
        )

    mods = []
    for workshop_path in workshop_paths:
        for mod_id in os.listdir(workshop_path):
            mod_folder = os.path.join(workshop_path, mod_id)
            if not os.path.isdir(mod_folder):
                continue

            mod_info_path = os.path.join(mod_folder, "mod.info")
            mod_data = {"id": mod_id, "folder": mod_folder}

            if os.path.isfile(mod_info_path):
                info = parse_mod_info(mod_info_path)
                mod_data["name"] = info.get("name", f"Mod {mod_id}")
                mod_data["description"] = info.get("description", "No description.")
                mod_data["poster"] = info.get("poster", None)
                mod_data["version"] = info.get("version", "unknown")
                mod_data["mod_id"] = info.get("id", mod_id)
            else:
                mod_data["name"] = f"Mod {mod_id}"
                mod_data["description"] = "No mod.info file found."
                mod_data["version"] = "unknown"
                mod_data["mod_id"] = mod_id

            try:
                mod_data["lastModified"] = int(os.path.getmtime(mod_folder))
                mod_data["localVersion"] = time.strftime(
                    "%Y-%m-%d %H:%M:%S", time.localtime(mod_data["lastModified"])
                )
            except Exception:
                mod_data["lastModified"] = 0
                mod_data["localVersion"] = "unknown"

            mods.append(mod_data)

    return {"mods": mods, "count": len(mods)}
