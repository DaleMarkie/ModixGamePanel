from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import json
import os

auth_router = APIRouter()

LOCAL_USERS_FILE = os.path.expanduser("~/modix_local_users.json")

# Initialize local users file if missing
if not os.path.exists(LOCAL_USERS_FILE):
    test_users = [
        {"username": "1", "password": "1", "role": "Owner", "roles": ["Owner"]},
        {"username": "admin", "password": "admin123", "role": "Admin", "roles": ["Admin"]},
        {"username": "subuser1", "password": "password1", "role": "SubUser", "roles": ["SubUser"]},
    ]
    with open(LOCAL_USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(test_users, f, indent=2)


def load_local_users():
    try:
        with open(LOCAL_USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def save_local_users(users):
    with open(LOCAL_USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)


@auth_router.post("/login")
async def login(request: Request):
    """
    Login endpoint for frontend.
    Accepts JSON: { "username": "user", "password": "pass" }
    """
    try:
        data = await request.json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return JSONResponse({"error": "Username and password required"}, status_code=400)

        users = load_local_users()
        user = next((u for u in users if u["username"] == username), None)

        if not user or user["password"] != password:
            return JSONResponse({"error": "Invalid username or password"}, status_code=401)

        # Update lastLogin
        user["lastLogin"] = __import__("datetime").datetime.utcnow().isoformat()
        save_local_users(users)

        # Return user info (without password)
        user_data = {k: v for k, v in user.items() if k != "password"}
        return {"user": user_data}

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
