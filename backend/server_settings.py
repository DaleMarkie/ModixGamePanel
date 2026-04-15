import os
from typing import Dict
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter()

# =========================================================
# ⚙️ CONFIG (Linux Project Zomboid path)
# =========================================================

ZOMBOID_SERVER_FOLDER = os.path.expanduser("~/Zomboid/Server")

os.makedirs(ZOMBOID_SERVER_FOLDER, exist_ok=True)

# =========================================================
# 🧠 INI PARSER
# =========================================================

def parse_ini(file_path: str) -> Dict[str, Dict[str, str]]:
    """
    Converts INI file into:
    {
        Section: { key: value }
    }
    """

    data: Dict[str, Dict[str, str]] = {}
    current_section = "General"
    data[current_section] = {}

    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()

            if not line or line.startswith(";") or line.startswith("#"):
                continue

            # Section [Main]
            if line.startswith("[") and line.endswith("]"):
                current_section = line[1:-1].strip()
                data[current_section] = {}
                continue

            # Key=value
            if "=" in line:
                key, value = line.split("=", 1)
                data[current_section][key.strip()] = value.strip()

    return data

# =========================================================
# 🧾 INI WRITER
# =========================================================

def write_ini(file_path: str, data: Dict[str, Dict[str, str]]):
    with open(file_path, "w", encoding="utf-8") as f:
        for section, values in data.items():
            f.write(f"[{section}]\n")
            for key, value in values.items():
                f.write(f"{key}={value}\n")
            f.write("\n")

# =========================================================
# 📄 LIST INI FILES
# =========================================================

@router.get("/list-inis")
def list_inis():
    try:
        files = [
            f for f in os.listdir(ZOMBOID_SERVER_FOLDER)
            if f.endswith(".ini")
        ]
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =========================================================
# 📥 LOAD INI FILE
# =========================================================

@router.get("/projectzomboid")
def load_settings(file: str = Query(...)):
    file_path = os.path.join(ZOMBOID_SERVER_FOLDER, file)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="INI file not found")

    try:
        return parse_ini(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =========================================================
# 💾 SAVE INI FILE
# =========================================================

class SaveSettings(BaseModel):
    # structure matches frontend SettingsData
    __root__: dict

@router.post("/projectzomboid")
def save_settings(file: str = Query(...), payload: dict = None):
    file_path = os.path.join(ZOMBOID_SERVER_FOLDER, file)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="INI file not found")

    if payload is None:
        raise HTTPException(status_code=400, detail="No data provided")

    try:
        write_ini(file_path, payload)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))