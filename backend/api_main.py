from fastapi import FastAPI
from backend.API.Core.database import init_db, create_base_users_from_config
from backend.API.Core.container_manager_api import router as container_manager_router
from backend.backend_module_loader import register_modules
from backend.API.Core.module_api import router as module_api_router
from backend.API.Core.auth import auth_router


app = FastAPI()


app.include_router(auth_router, prefix="/api")
app.include_router(container_manager_router, prefix="/api")
app.include_router(module_api_router, prefix="/api")
register_modules(app)

# Initialize the SQLite database and base users on startup
@app.on_event("startup")
def on_startup():
    init_db()
    create_base_users_from_config()
