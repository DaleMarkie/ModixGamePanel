# ================= JWT Payload Structure =====================
#
# Example JWT payload issued by backend:
# {
#   "sub": "username",            # Username (subject)
#   "permissions": [               # List of allowed permission strings
#     "modix_dashboard_access",
#     "modix_server_create",
#     ...
#   ],
#   "exp": 1722350000              # Expiry timestamp (UTC, seconds)
# }
#
# For refresh tokens, an additional field is present:
#   "type": "refresh"
# =============================================================
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Cookie, WebSocket
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from backend.API.Core.database import SessionLocal
from backend.API.Core.models import User
from passlib.hash import bcrypt
from pydantic import BaseModel
import os
from backend.API.Core.access_control import resolve_permission
import json
from pathlib import Path
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException as FastAPIHTTPException

SECRET_KEY = os.environ.get("MODIX_SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120  # 2 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

auth_router = APIRouter(tags=["Authentication"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter_by(username=username).first()
    if not user or not bcrypt.verify(password, user.password_hash):
        return None
    return user

def get_modix_config():
    config_path = Path(__file__).parent.parent.parent / "modix_config" / "modix_config.json"
    with open(config_path) as f:
        return json.load(f)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    # Set access token expiry to 2 hours by default
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict, expires_delta: timedelta | None = None):
    # Set refresh token expiry to 7 days by default
    expire = datetime.utcnow() + (expires_delta or timedelta(days=7))
    to_encode = data.copy()
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

from fastapi import Form

@auth_router.post("/login", response_model=Token)
def login(
    response: Response,
    username: str = Form(...),
    password: str = Form(...),
    scope: str = Form(''),
    client_id: str = Form('string'),
    client_secret: str = Form('********'),
    db: Session = Depends(get_db)
):
    config = get_modix_config()
    require_auth = config.get("MODIX_REQUIRE_AUTH")
    # If auth is not required, allow any username and skip password check
    if require_auth is False or require_auth is None:
        username = username or "guest"
        access_token = create_access_token(data={"sub": username})
        refresh_token = create_refresh_token(data={"sub": username})
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=60 * 15,  # 15 min
            samesite="lax",
            secure=True
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            max_age=60 * 60 * 24 * 7,  # 7 days
            samesite="lax",
            secure=True
        )
        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
    user = authenticate_user(db, username, password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    # Collect user permissions (direct and via roles), prefix with module name if not already
    def prefix_perm(perm: str) -> str:
        # Guess module from permission name (e.g., for rbac, modix, container, etc.)
        if perm.startswith("rbac_") or perm.startswith("modix_") or perm.startswith("container_"):
            return perm
        # Default to rbac_ for this module (customize as needed)
        return f"rbac_{perm}"

    direct_permissions = [prefix_perm(up.permission) for up in user.permissions if up.value.value == "allow"]
    role_permissions = []
    for ur in user.roles:
        if ur.role:
            for rp in ur.role.permissions:
                if rp.value.value == "allow":
                    role_permissions.append(prefix_perm(rp.permission))
    all_permissions = list(set(direct_permissions + role_permissions))
    access_token = create_access_token(data={"sub": user.username, "permissions": all_permissions})
    refresh_token = create_refresh_token(data={"sub": user.username, "permissions": all_permissions})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=60 * 15,  # 15 min
        samesite="lax",
        secure=True
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=60 * 60 * 24 * 7,  # 7 days
        samesite="lax",
        secure=True
    )
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
# /refresh endpoint to issue new access token using refresh token
@auth_router.post("/refresh")
def refresh_token(
    response: Response,
    db: Session = Depends(get_db),
    refresh_token_cookie: str = Cookie(default=None, alias="refresh_token")
):
    """
    Issue a new access token using a valid refresh token.
    Refresh token must have type 'refresh' and not be expired.
    """
    if not refresh_token_cookie:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    try:
        payload = jwt.decode(refresh_token_cookie, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token type")
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid refresh token payload")
        user = db.query(User).filter_by(username=username).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        # Collect user permissions (direct and via roles), prefix with module name if not already
        def prefix_perm(perm: str) -> str:
            if perm.startswith("rbac_") or perm.startswith("modix_") or perm.startswith("container_"):
                return perm
            return f"rbac_{perm}"

        direct_permissions = [prefix_perm(up.permission) for up in user.permissions if up.value.value == "allow"]
        role_permissions = []
        for ur in user.roles:
            if ur.role:
                for rp in ur.role.permissions:
                    if rp.value.value == "allow":
                        role_permissions.append(prefix_perm(rp.permission))
        all_permissions = list(set(direct_permissions + role_permissions))
        # Issue new access token with permissions (2 hour expiry)
        access_token = create_access_token(data={"sub": username, "permissions": all_permissions})
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=60 * ACCESS_TOKEN_EXPIRE_MINUTES,  # 2 hours
            samesite="lax",
            secure=True
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    access_token_cookie: str = Cookie(default=None, alias="access_token")
):
    # Always check both header and cookie for access_token
    token = None
    auth_header = request.headers.get("authorization")
    # print("[DEBUG] get_current_user: Authorization header:", auth_header)
    # print("[DEBUG] get_current_user: access_token_cookie:", access_token_cookie)
    if auth_header and auth_header.lower().startswith("bearer "):
        token = auth_header.split(" ", 1)[1]
        # print("[DEBUG] Using token from Authorization header.")
    elif access_token_cookie:
        token = access_token_cookie
        # print("[DEBUG] Using access_token from cookie.")
    if not token:
        # print("[DEBUG] No token found, raising 401")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # print(f"[DEBUG] Decoded JWT payload: {payload}")
        username: str = payload.get("sub")
        if username is None:
            # print("[DEBUG] No username in JWT payload, raising 401")
            raise credentials_exception
    except JWTError as e:
        # print(f"[DEBUG] JWTError: {e}")
        raise credentials_exception
    user = db.query(User).filter_by(username=username).first()
    # print(f"[DEBUG] User from DB: {user}")
    if user is None:
        # print("[DEBUG] No user found in DB, raising 401")
        raise credentials_exception
    return user

def get_current_user_ws(websocket: WebSocket, db: Session = Depends(get_db)):
    auth_header = websocket.headers.get("authorization")
    # print(f"[DEBUG] get_current_user_ws: Authorization header: {auth_header}")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        # print("[DEBUG] No or invalid Authorization header in WebSocket handshake.")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Missing or invalid Authorization header.")
    token = auth_header.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            # print("[DEBUG] Invalid token payload: no sub")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token payload.")
    except JWTError as e:
        # print(f"[DEBUG] JWTError: {e}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token.")
    user = db.query(User).filter_by(username=username).first()
    if user is None:
        # print(f"[DEBUG] No user found for username: {username}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not found.")
    # print(f"[DEBUG] WebSocket user authenticated: {username} (ID: {getattr(user, 'id', None)})")
    return user

def require_permission(permission: str, container_id: int = None):
    def dependency(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        # print(f"[DEBUG] require_permission CALLED: user={getattr(current_user, 'username', None)} id={getattr(current_user, 'id', None)} perm={permission} container_id={container_id}")
        # print(f"[DEBUG] require_permission: current_user object: {current_user}")
        # Root user: grant all permissions, but do not skip permission logic
        if getattr(current_user, "username", None) == "root":
            # print(f"[DEBUG] Root user detected: {getattr(current_user, 'username', None)} (ID: {getattr(current_user, 'id', None)}) - granting all permissions.")
            return current_user
        # If container_id is provided, fetch container and check per-container permission
        container = None
        if container_id is not None:
            from backend.API.Core.models import Container
            container = db.query(Container).filter_by(id=container_id).first()
        allowed = resolve_permission(db, current_user, permission, container)
        # print(f"[DEBUG] require_permission: resolve_permission returned: {allowed}")
        if not allowed:
            # print(f"[DEBUG] Permission denied for user {getattr(current_user, 'username', None)} (ID: {getattr(current_user, 'id', None)}) on permission '{permission}' and container '{container_id}'")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission: {permission}"
            )
        # print(f"[DEBUG] Permission granted for user {getattr(current_user, 'username', None)} (ID: {getattr(current_user, 'id', None)}) on permission '{permission}' and container '{container_id}'")
        return current_user
    return dependency

def require_auth_dependency(request: Request):
    config = get_modix_config()
    require_auth = config.get("MODIX_REQUIRE_AUTH")
    if require_auth is False or require_auth is None:
        return  # No-op, allow unauthenticated
    # Otherwise, require authentication (handled by OAuth2PasswordBearer)
    # This is a placeholder for global dependency if needed
    pass

# Example for 3 days session timeout in modix_config.json:
# "MODIX_SESSION_TIMEOUT": 4320  # 3 days in minutes (3*24*60)

@auth_router.post("/logout")
def logout(response: Response):
    """
    Logout endpoint. Since JWT is stateless, clients should delete their token.
    """
    # Clear the cookies
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return {"message": "Successfully logged out."}



# /me endpoint to return current user info with roles and permissions
@auth_router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    # Get user roles
    roles = [ur.role.name for ur in current_user.roles if ur.role]
    # Get user permissions (direct and via roles)
    direct_permissions = [
        {
            "permission": up.permission,
            "value": up.value.value if hasattr(up.value, 'value') else up.value,
            "scope": up.scope,
            "container_id": up.container_id,
        }
        for up in current_user.permissions
    ]
    # Optionally, collect permissions from roles as well
    role_permissions = []
    for ur in current_user.roles:
        if ur.role:
            for rp in ur.role.permissions:
                role_permissions.append({
                    "permission": rp.permission,
                    "value": rp.value.value if hasattr(rp.value, 'value') else rp.value,
                    "scope": rp.scope,
                    "container_id": rp.container_id,
                })

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": getattr(current_user, "email", None),
        "is_active": getattr(current_user, "is_active", None),
        "name": getattr(current_user, "name", None),  # Include name if available
        "roles": roles,
        "direct_permissions": direct_permissions,
        "role_permissions": role_permissions,
    }

@auth_router.get("/status")
def get_status(
    request: Request,
    db: Session = Depends(get_db),
    access_token_cookie: str = Cookie(default=None, alias="access_token")
):
    # Try to get token from Authorization header first, then cookie
    token = None
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.lower().startswith("bearer "):
        token = auth_header.split(" ", 1)[1]
    elif access_token_cookie:
        token = access_token_cookie
    if not token:
        return {"authenticated": False}
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            return {"authenticated": False}
        user = db.query(User).filter_by(username=username).first()
        if not user:
            return {"authenticated": False}
        return {"authenticated": True}
    except Exception:
        return {"authenticated": False}
