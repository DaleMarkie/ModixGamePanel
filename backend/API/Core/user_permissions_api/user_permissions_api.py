import os
import json
from fastapi import APIRouter, Request, Body, Path
from fastapi.responses import JSONResponse

router = APIRouter()

# ---------------------------
# MODIX Config Helpers
# ---------------------------
MODIX_CONFIG_FILE = os.path.join(os.path.dirname(__file__), "modix_config", "modix_config.json")

def read_modix_config() -> dict:
    if not os.path.isfile(MODIX_CONFIG_FILE):
        return {}
    with open(MODIX_CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def write_modix_config(data: dict):
    os.makedirs(os.path.dirname(MODIX_CONFIG_FILE), exist_ok=True)
    with open(MODIX_CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

# ---------------------------
# MODIX Config & Account Management
# ---------------------------

@router.get("/config")
async def get_modix_config():
    """Return the full MODIX configuration from JSON file."""
    config = read_modix_config()
    return JSONResponse({"success": True, "config": config})

@router.post("/users/update")
async def update_user_details(request: Request):
    try:
        data = await request.json()
    except Exception:
        return JSONResponse({"success": False, "message": "Invalid JSON"}, status_code=400)

    username = data.get("username")
    if not username:
        return JSONResponse({"success": False, "message": "Username is required"}, status_code=400)

    config = read_modix_config()
    users = config.get("MODIX_USERS", [])

    # Find the user
    user = next((u for u in users if u.get("username") == username), None)
    if not user:
        return JSONResponse({"success": False, "message": "User not found"}, status_code=404)

    # Password update
    old_password = data.get("oldPassword")
    new_password = data.get("newPassword")
    if new_password:
        if not old_password:
            return JSONResponse({"success": False, "message": "Current password required to change password"}, status_code=400)
        if old_password != user.get("password"):
            return JSONResponse({"success": False, "message": "Current password is incorrect"}, status_code=400)
        user["password"] = new_password

    # Update other fields
    for field in ["email", "roles", "permissions"]:
        if field in data:
            user[field] = data[field]

    config["MODIX_USERS"] = users
    write_modix_config(config)

    return JSONResponse({"success": True, "message": f"User '{username}' updated successfully", "user": user})

# ---------------------------
# MODIX RBAC User Management
# ---------------------------

@router.get("/rbac/users")
async def list_users():
    config = read_modix_config()
    return config.get("MODIX_USERS", [])

@router.post("/rbac/users")
async def add_user(user: dict = Body(...)):
    config = read_modix_config()
    users = config.get("MODIX_USERS", [])

    if any(u["username"] == user["username"] for u in users):
        return JSONResponse({"success": False, "message": "Username already exists"}, status_code=400)

    new_user = {
        "username": user["username"],
        "password": user["password"],
        "email": user.get("email", ""),
        "roles": user.get("roles", []),
        "permissions": user.get("permissions", []),
    }
    users.append(new_user)
    config["MODIX_USERS"] = users
    write_modix_config(config)

    return {"success": True, "message": "User added", "user": new_user}

@router.delete("/rbac/users/{username}")
async def delete_user(username: str = Path(...)):
    config = read_modix_config()
    users = [u for u in config.get("MODIX_USERS", []) if u["username"] != username]
    config["MODIX_USERS"] = users
    write_modix_config(config)
    return {"success": True, "message": f"User '{username}' removed"}

@router.post("/rbac/users/{username}/roles")
async def add_role_to_user(username: str = Path(...), payload: dict = Body(...)):
    role_name = payload.get("role_name")
    if not role_name:
        return JSONResponse({"success": False, "message": "role_name required"}, status_code=400)

    config = read_modix_config()
    users = config.get("MODIX_USERS", [])
    user = next((u for u in users if u["username"] == username), None)
    if not user:
        return JSONResponse({"success": False, "message": "User not found"}, status_code=404)

    if role_name not in user.get("roles", []):
        user.setdefault("roles", []).append(role_name)
        write_modix_config(config)

    return {"success": True, "message": f"Role '{role_name}' added to {username}", "user": user}

@router.post("/rbac/users/{username}/permissions")
async def add_permission_to_user(username: str = Path(...), payload: dict = Body(...)):
    perm = payload.get("permission")
    value = payload.get("value", "allow")

    if not perm:
        return JSONResponse({"success": False, "message": "permission required"}, status_code=400)

    config = read_modix_config()
    users = config.get("MODIX_USERS", [])
    user = next((u for u in users if u["username"] == username), None)
    if not user:
        return JSONResponse({"success": False, "message": "User not found"}, status_code=404)

    perms = set(user.get("permissions", []))
    if value == "allow":
        perms.add(perm)
    else:
        perms.discard(perm)
    user["permissions"] = list(perms)
    write_modix_config(config)

    return {"success": True, "message": f"Permission '{perm}' updated for {username}", "user": user}
