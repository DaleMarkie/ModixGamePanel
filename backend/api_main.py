from fastapi import FastAPI
from backend.API.container_info import router as container_info_router
from backend.API.permissions_api import router as permissions_router
from backend.API.database import init_db, create_base_users_from_config

app = FastAPI()
app.include_router(container_info_router, prefix="/api")
app.include_router(permissions_router, prefix="/api")

# Initialize the SQLite database and base users on startup
@app.on_event("startup")
def on_startup():
    init_db()
    create_base_users_from_config()
