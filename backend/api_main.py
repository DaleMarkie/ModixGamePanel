# Ensure project root is in sys.path for direct script execution
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from backend.API.Core.database import init_db, create_base_users_from_config, register_module_permissions
from backend.API.Core.container_manager_api import router as container_manager_router
from backend.API.Core.docker_api import router as docker_api_router
from backend.backend_module_loader import register_modules
from backend.API.Core.module_api import router as module_api_router
from backend.API.Core.auth import auth_router

app = FastAPI()

app.include_router(docker_api_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(container_manager_router, prefix="/api")
app.include_router(module_api_router, prefix="/api")
register_modules(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STEAM_WORKSHOP_DIR = os.path.expanduser(
    "~/Zomboid/steamapps/workshop/content/108600"
)

# === Read mod.info helper ===
def read_mod_name_from_info(mod_dir: str) -> str:
    info_file = os.path.join(mod_dir, "mod.info")
    if os.path.isfile(info_file):
        try:
            with open(info_file, encoding="utf-8", errors="ignore") as f:
                for line in f:
                    if line.lower().startswith("name="):
                        return line.split("=", 1)[1].strip()
        except:
            pass

    mods_subdir = os.path.join(mod_dir, "mods")
    if os.path.isdir(mods_subdir):
        for sub in os.scandir(mods_subdir):
            if sub.is_dir():
                nested_info = os.path.join(sub.path, "mod.info")
                if os.path.isfile(nested_info):
                    try:
                        with open(nested_info, encoding="utf-8", errors="ignore") as f:
                            for line in f:
                                if line.lower().startswith("name="):
                                    return line.split("=", 1)[1].strip()
                    except:
                        pass
    return os.path.basename(mod_dir)

# === GET mods list ===
@app.get("/api/mods")
def list_mods():
    if not os.path.exists(STEAM_WORKSHOP_DIR):
        raise HTTPException(status_code=404, detail="Workshop folder not found.")

    mods = [{
        "id": "0000000000",
        "name": "Example Mod (Test Only)",
        "path": "/path/to/example/mod",
        "poster": None,
        "enabled": True
    }]

    for entry in os.scandir(STEAM_WORKSHOP_DIR):
        if entry.is_dir():
            mod_name = read_mod_name_from_info(entry.path)
            poster_path = None
            for root, _, files in os.walk(entry.path):
                if "poster.png" in files:
                    poster_path = os.path.join(root, "poster.png")
                    break
            mods.append({
                "id": entry.name,
                "name": mod_name,
                "path": os.path.abspath(entry.path),
                "poster": f"/api/mods/{entry.name}/poster" if poster_path else None,
                "enabled": True
            })

    return {"mods": mods}

# === Serve poster.png ===
@app.get("/api/mods/{mod_id}/poster")
def get_mod_poster(mod_id: str):
    mod_path = os.path.join(STEAM_WORKSHOP_DIR, mod_id)
    if not os.path.exists(mod_path):
        raise HTTPException(status_code=404, detail="Mod not found.")
    for root, _, files in os.walk(mod_path):
        if "poster.png" in files:
            return FileResponse(os.path.join(root, "poster.png"))
    raise HTTPException(status_code=404, detail="Poster not found.")

@app.on_event("startup")
def on_startup():
    init_db()
    create_base_users_from_config()
    register_module_permissions()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.api_main:app",
        host="0.0.0.0",
        port=2010,
    )
