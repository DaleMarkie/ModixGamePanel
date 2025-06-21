from fastapi import APIRouter, Depends, HTTPException, status
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
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    config = get_modix_config()
    require_auth = config.get("MODIX_REQUIRE_AUTH")
    session_timeout = config.get("MODIX_SESSION_TIMEOUT")
    # If auth is not required, allow any username and skip password check
    if require_auth is False or require_auth is None:
        username = form_data.username or "guest"
        expires_delta = timedelta(hours=24) if session_timeout is None else timedelta(minutes=int(session_timeout))
        access_token = create_access_token(data={"sub": username}, expires_delta=expires_delta)
        return {"access_token": access_token, "token_type": "bearer"}
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    expires_delta = timedelta(hours=24) if session_timeout is None else timedelta(minutes=int(session_timeout))
    access_token = create_access_token(data={"sub": user.username}, expires_delta=expires_delta)
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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

def require_permission(permission: str, container_id: int = None):
    def dependency(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        # Only allow bypass if BOTH id == 1 AND username == 'root'
        if getattr(current_user, "username", None) == "root" and getattr(current_user, "id", None) == 1:
            return current_user
        # If container_id is provided, fetch container and check per-container permission
        container = None
        if container_id is not None:
            from backend.API.Core.models import Container
            container = db.query(Container).filter_by(id=container_id).first()
        allowed = resolve_permission(db, current_user, permission, container)
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission: {permission}"
            )
        return current_user
    return dependency

from fastapi import Request

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
