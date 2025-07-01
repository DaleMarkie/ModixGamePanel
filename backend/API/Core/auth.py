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

SECRET_KEY = os.environ.get("MODIX_SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

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
    config = get_modix_config()
    session_timeout = config.get("MODIX_SESSION_TIMEOUT")
    if session_timeout is not None:
        try:
            session_timeout = int(session_timeout)
        except Exception:
            session_timeout = None
    # If session_timeout is not set, refresh token for 24 hours after each login (default)
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=24 if session_timeout is None else session_timeout))
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@auth_router.post("/login", response_model=Token)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Accepts credentials as form data (not JSON)
    # Returns token as JSON
    config = get_modix_config()
    require_auth = config.get("MODIX_REQUIRE_AUTH")
    session_timeout = config.get("MODIX_SESSION_TIMEOUT")
    # If auth is not required, allow any username and skip password check
    if require_auth is False or require_auth is None:
        username = form_data.username or "guest"
        expires_delta = timedelta(hours=24) if session_timeout is None else timedelta(minutes=int(session_timeout))
        access_token = create_access_token(data={"sub": username}, expires_delta=expires_delta)
        # Set JWT as HTTP-only cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=60 * 60 * 24 * 7,  # 1 week
            samesite="lax",
            secure=True  # Set to True for HTTPS
        )
        return {"access_token": access_token, "token_type": "bearer"}
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    expires_delta = timedelta(hours=24) if session_timeout is None else timedelta(minutes=int(session_timeout))
    access_token = create_access_token(data={"sub": user.username}, expires_delta=expires_delta)
    # Set JWT as HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=60 * 60 * 24 * 7,  # 1 week
        samesite="lax",
        secure=True  # Set to True for HTTPS
    )
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
    request: Request = None,
    access_token_cookie: str = Cookie(default=None, alias="access_token")
):
    # Try header first, then cookie
    if not token and access_token_cookie:
        token = access_token_cookie
    if not token:
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
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter_by(username=username).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_user_ws(websocket: WebSocket, db: Session = Depends(get_db)):
    auth_header = websocket.headers.get("authorization")
    print(f"[DEBUG] get_current_user_ws: Authorization header: {auth_header}")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        print("[DEBUG] No or invalid Authorization header in WebSocket handshake.")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Missing or invalid Authorization header.")
    token = auth_header.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            print("[DEBUG] Invalid token payload: no sub")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token payload.")
    except JWTError as e:
        print(f"[DEBUG] JWTError: {e}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token.")
    user = db.query(User).filter_by(username=username).first()
    if user is None:
        print(f"[DEBUG] No user found for username: {username}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not found.")
    print(f"[DEBUG] WebSocket user authenticated: {username} (ID: {getattr(user, 'id', None)})")
    return user

def require_permission(permission: str, container_id: int = None):
    def dependency(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        print(f"[DEBUG] require_permission: user={getattr(current_user, 'username', None)} id={getattr(current_user, 'id', None)} perm={permission} container_id={container_id}")
        # Root user: grant all permissions, but do not skip permission logic
        if getattr(current_user, "username", None) == "root":
            print(f"[DEBUG] Root user detected: {getattr(current_user, 'username', None)} (ID: {getattr(current_user, 'id', None)}) - granting all permissions.")
            return current_user
        # If container_id is provided, fetch container and check per-container permission
        container = None
        if container_id is not None:
            from backend.API.Core.models import Container
            container = db.query(Container).filter_by(id=container_id).first()
        allowed = resolve_permission(db, current_user, permission, container)
        if not allowed:
            print(f"[DEBUG] Permission denied for user {getattr(current_user, 'username', None)} (ID: {getattr(current_user, 'id', None)}) on permission '{permission}' and container '{container_id}'")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission: {permission}"
            )
        print(f"[DEBUG] Permission granted for user {getattr(current_user, 'username', None)} (ID: {getattr(current_user, 'id', None)}) on permission '{permission}' and container '{container_id}'")
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
    # Clear the cookie
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out."}
