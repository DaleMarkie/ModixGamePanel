from fastapi import FastAPI
from backend.API.permissions_api import router as permissions_router
from backend.API.database import init_db, create_base_users_from_config
from backend.API.auth import auth_router
from backend.API.terminal_api import router as terminal_router

app = FastAPI()
app.include_router(permissions_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(terminal_router, prefix="/api")

# Initialize the SQLite database and base users on startup
@app.on_event("startup")
def on_startup():
    init_db()
    create_base_users_from_config()
