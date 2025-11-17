from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
import json
import os
import jwt
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

# -------------------------------
# CONFIGURATION
# -------------------------------

auth_router = APIRouter()
LOCAL_USERS_FILE = os.path.expanduser("~/modix_local_users.json")

# JWT configuration
JWT_SECRET = "MODIX_SUPER_SECRET_KEY_CHANGE_THIS"  # ⚠️ Change in production!
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = 720  # 12 hours

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# -------------------------------
# USER FILE INITIALIZATION
# -------------------------------

def ensure_local_users() -> None:
    """
    Ensure the local users JSON file exists. If not, create it with default test users.
    """
    if not os.path.exists(LOCAL_USERS_FILE):
        default_users = [
            {"username": "1", "password": pwd_context.hash("1"), "role": "Owner", "roles": ["Owner"]},
            {"username": "admin", "password": pwd_context.hash("admin123"), "role": "Admin", "roles": ["Admin"]},
            {"username": "subuser1", "password": pwd_context.hash("password1"), "role": "SubUser", "roles": ["SubUser"]},
        ]
        save_local_users(default_users)

def load_local_users() -> List[Dict[str, Any]]:
    """
    Load all users from the local JSON file.
    Returns an empty list if the file is missing or corrupt.
    """
    try:
        with open(LOCAL_USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_local_users(users: List[Dict[str, Any]]) -> None:
    """
    Save the given list of users to the local JSON file.
    """
    with open(LOCAL_USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)

# -------------------------------
# AUTH UTILS
# -------------------------------

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a bcrypt hash.
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """
    Hash a plaintext password using bcrypt.
    """
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Generate a JWT token with the provided data and expiration.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=JWT_EXPIRATION_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT token.
    Raises HTTPException for expired or invalid tokens.
    """
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Dependency to retrieve the currently authenticated user from a JWT token.
    Returns user info without the password.
    """
    payload = decode_access_token(token)
    username: str = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    users = load_local_users()
    user = next((u for u in users if u["username"] == username), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {k: v for k, v in user.items() if k != "password"}

# -------------------------------
# LOGIN ENDPOINT
# -------------------------------

@auth_router.post("/login")
async def login(request: Request) -> dict:
    """
    Authenticate a user with username/password.
    Returns user info and JWT token.
    
    Features:
    - Backward compatibility for plaintext passwords (auto rehash)
    - JWT token creation
    - Last login timestamp update
    """
    try:
        data = await request.json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            raise HTTPException(status_code=400, detail="Username and password required")

        users = load_local_users()
        user = next((u for u in users if u["username"] == username), None)

        if not user:
            raise HTTPException(status_code=401, detail="Invalid username or password")

        # Auto-upgrade old plaintext passwords
        if not user["password"].startswith("$2b$"):
            user["password"] = get_password_hash(user["password"])
            save_local_users(users)

        if not verify_password(password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid username or password")

        # Generate JWT token
        access_token = create_access_token(
            data={"sub": user["username"], "role": user.get("role"), "roles": user.get("roles", [])}
        )

        # Update last login timestamp
        user["lastLogin"] = datetime.utcnow().isoformat()
        save_local_users(users)

        # Return user info without password
        user_data = {k: v for k, v in user.items() if k != "password"}
        return {"user": user_data, "token": access_token}

    except HTTPException as e:
        raise e
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# -------------------------------
# AUTH VALIDATION TEST ROUTE
# -------------------------------

@auth_router.get("/me")
async def read_current_user(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Test route to return the authenticated user.
    """
    return {"user": current_user}

# -------------------------------
# INITIALIZE DATA
# -------------------------------

ensure_local_users()
