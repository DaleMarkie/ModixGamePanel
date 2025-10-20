# backend/filemanager.py
import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

router = APIRouter()
WORKSHOP_PATH = r"C:\Program Files (x86)\Steam\steamapps\workshop\content\108600"

def scan_folder(folder: Path):
    items = []
    for entry in folder.iterdir():
        if entry.is_dir():
            items.append({
                "type": "folder",
                "name": entry.name,
                "path": str(entry),
                "children": scan_folder(entry)
            })
        else:
            items.append({
                "type": "file",
                "name": entry.name,
                "path": str(entry)
            })
    return items

@router.get("/workshop-mods")
async def get_workshop_mods():
    mods = []
    base_path = Path(WORKSHOP_PATH)
    if not base_path.exists():
        raise HTTPException(status_code=404, detail="Workshop folder not found")
    for mod_folder in base_path.iterdir():
        if mod_folder.is_dir():
            mods.append({
                "modId": mod_folder.name,
                "title": mod_folder.name,
                "files": scan_folder(mod_folder)
            })
    return {"mods": mods}

@router.get("/file")
async def read_file(path: str = Query(...)):
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    if os.path.isdir(path):
        raise HTTPException(status_code=400, detail="Path is a folder")
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    return {"content": content}

@router.post("/file/save")
async def save_file(data: dict):
    path = data.get("path")
    content = data.get("content", "")
    if not path or not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    if os.path.isdir(path):
        raise HTTPException(status_code=400, detail="Path is a folder")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return {"status": "saved"}
