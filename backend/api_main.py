import asyncio
import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# ---------------- CORE ROUTES ----------------
from backend.API.Core.auth import auth_router
from backend.games_api import router as games_router
from backend.filemanager import router as filemanager_router
from backend.API.Core.workshop_api import workshop_api
from backend.modupdates_api import router as modupdates_router
from backend.server_scheduler import router as scheduler_router
from backend.serverports import router as serverports_router
from backend.performance import router as performance_router
from backend.sidebar_api import router as sidebar_router
from backend.steam_installer import router as steam_installer_router
from backend.zomboid_backup_api import router as zomboid_backup_router

# ---------------- TERMINAL ----------------
from backend.terminal.terminal_api import router as terminal_router, set_event_loop

# ---------------- PROJECT ZOMBOID ----------------
from backend.API.Core.games_api.projectzomboid import (
    PlayersBannedAPI,
    all_players_api,
    steam_notes_api,
    steam_search_player_api,
    api_chatlogs
)

from backend.API.Core.tools_api import ddos_manager_api

# ---------------- ACTIVE GAME SYSTEM ----------------
from backend.API.Core.active_game_api import router as active_game_router


# ---------------- LIFESPAN ----------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    loop = asyncio.get_running_loop()
    set_event_loop(loop)
    yield


# ---------------- APP ----------------
app = FastAPI(
    title="Modix Panel Backend",
    description="WIP / TEST build - Active Game + Terminal Control System",
    lifespan=lifespan
)

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- ROUTERS ----------------
app.include_router(auth_router, prefix="/api")

# GAME SYSTEM
app.include_router(games_router, prefix="/api/games")
app.include_router(active_game_router, prefix="/api")

# CORE SYSTEMS
app.include_router(filemanager_router, prefix="/api/filemanager")
app.include_router(workshop_api.router, prefix="/api/workshop")
app.include_router(modupdates_router, prefix="/api/mods")
app.include_router(modupdates_router, prefix="/api/updater")

# PROJECT ZOMBOID MODULES
app.include_router(PlayersBannedAPI.router, prefix="/api/projectzomboid/banned")
app.include_router(all_players_api.router, prefix="/api/projectzomboid/players")
app.include_router(steam_notes_api.router, prefix="/api/projectzomboid/steam-notes")
app.include_router(steam_search_player_api.router, prefix="/api/projectzomboid/steam-search")
app.include_router(api_chatlogs.chat_bp, prefix="/api/projectzomboid/chat")

# SYSTEM TOOLS
app.include_router(ddos_manager_api.router, prefix="/api/ddos")
app.include_router(performance_router, prefix="/api")
app.include_router(sidebar_router, prefix="/api/sidebar")

# TERMINAL (CORE CONTROL SYSTEM)
app.include_router(terminal_router)

# INFRA / UTILITIES
app.include_router(scheduler_router, prefix="/api/scheduler")
app.include_router(serverports_router, prefix="/api/ports")
app.include_router(steam_installer_router, prefix="/api/steam")
app.include_router(zomboid_backup_router, prefix="/api/zomboid/backup")


# ---------------- ROOT ----------------
@app.get("/")
def root():
    return {
        "status": "running",
        "mode": "WIP / TEST",
        "system": "Modix Active Game + Terminal Control"
    }


# ---------------- START ----------------
if __name__ == "__main__":
    uvicorn.run(
        "backend.api_main:app",
        host="0.0.0.0",
        port=2010,
        reload=True,
        log_level="info"
    )