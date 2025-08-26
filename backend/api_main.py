# Ensure project root is in sys.path for direct script execution
import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# === Project root path fix ===
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# === Core Imports ===
from backend.API.Core.database import init_db, create_base_users_from_config, register_module_permissions
from backend.API.Core.container_manager_api import router as container_manager_router
from backend.API.Core.docker_api import router as docker_api_router
from backend.API.Core.module_api import router as module_api_router
from backend.API.Core.auth import auth_router
from backend.API.Core.steam_search_player_api import router as steam_search_router
from backend.API.Core.mod_debugger_api import router as mod_debugger_router
from backend.backend_module_loader import register_modules
from module_system.Core.Terminal.backend.terminal_api import router as terminal_router


# ---------------------------
# FastAPI App
# ---------------------------
app = FastAPI(title="Game Server Backend")

# === Core Routers ===
app.include_router(docker_api_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(container_manager_router, prefix="/api")
app.include_router(module_api_router, prefix="/api")
app.include_router(steam_search_router, prefix="/api")
app.include_router(mod_debugger_router, prefix="/api/debugger")

# === Terminal API ===
app.include_router(terminal_router, prefix="/api/terminal/projectzomboid")

# === Dynamic Module Registration ===
register_modules(app)

# === CORS ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Startup Hooks
# ---------------------------
@app.on_event("startup")
def on_startup():
    init_db()
    create_base_users_from_config()
    register_module_permissions()

# ---------------------------
# Entrypoint
# ---------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.api_main:app",
        host="0.0.0.0",
        port=2010,
    )
