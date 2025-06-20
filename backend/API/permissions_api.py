from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.API.database import SessionLocal
from backend.API.models import User, Role, UserRole, UserPermission, PERMISSIONS
from passlib.hash import bcrypt
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()
router = APIRouter(tags=["RBAC"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Schemas ---
class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    is_active: Optional[bool] = True
    roles: Optional[List[str]] = []
    permissions: Optional[List[str]] = []

class UserOut(BaseModel):
    id: int
    username: str
    email: Optional[str]
    is_active: bool
    class Config:
        orm_mode = True

class RoleCreate(BaseModel):
    name: str
    hierarchy_level: int
    description: Optional[str] = None

class RoleOut(BaseModel):
    id: int
    name: str
    hierarchy_level: int
    description: Optional[str]
    class Config:
        orm_mode = True

# --- User Endpoints ---
@router.post("/users", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter_by(username=user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    db_user = User(
        username=user.username,
        password_hash=bcrypt.hash(user.password),
        email=user.email or f"{user.username}@modix.local",
        is_active=user.is_active
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    # Assign roles
    for role_name in user.roles:
        role = db.query(Role).filter_by(name=role_name).first()
        if role:
            db.add(UserRole(user_id=db_user.id, role_id=role.id, container_id=None))
    # Assign permissions
    for perm in user.permissions:
        if perm in PERMISSIONS:
            db.add(UserPermission(user_id=db_user.id, permission=perm, value="allow", container_id=None))
    db.commit()
    return db_user

@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# --- Role Endpoints ---
@router.post("/roles", response_model=RoleOut)
def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    if db.query(Role).filter_by(name=role.name).first():
        raise HTTPException(status_code=400, detail="Role already exists")
    db_role = Role(
        name=role.name,
        hierarchy_level=role.hierarchy_level,
        description=role.description
    )
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

@router.get("/roles", response_model=List[RoleOut])
def list_roles(db: Session = Depends(get_db)):
    return db.query(Role).all()

@router.get("/roles/{role_id}", response_model=RoleOut)
def get_role(role_id: int, db: Session = Depends(get_db)):
    role = db.query(Role).filter_by(id=role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

# --- Permission Endpoints ---
class PermissionAssign(BaseModel):
    permission: str
    value: str  # "allow" or "deny"
    container_id: Optional[int] = None

@router.post("/users/{user_id}/permissions")
def assign_permission(user_id: int, perm: PermissionAssign, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if perm.permission not in PERMISSIONS:
        raise HTTPException(status_code=400, detail="Invalid permission")
    db.add(UserPermission(user_id=user_id, permission=perm.permission, value=perm.value, container_id=perm.container_id))
    db.commit()
    return {"status": "ok"}

@router.get("/users/{user_id}/permissions")
def list_user_permissions(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    perms = db.query(UserPermission).filter_by(user_id=user_id).all()
    return [{"permission": p.permission, "value": p.value, "container_id": p.container_id} for p in perms]

# --- Role Assignment Endpoints ---
class RoleAssign(BaseModel):
    role_name: str
    container_id: Optional[int] = None

@router.post("/users/{user_id}/roles")
def assign_role(user_id: int, role: RoleAssign, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    role_obj = db.query(Role).filter_by(name=role.role_name).first()
    if not role_obj:
        raise HTTPException(status_code=404, detail="Role not found")
    db.add(UserRole(user_id=user_id, role_id=role_obj.id, container_id=role.container_id))
    db.commit()
    return {"status": "ok"}

@router.get("/users/{user_id}/roles")
def list_user_roles(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    roles = db.query(UserRole).filter_by(user_id=user_id).all()
    return [{"role": db.query(Role).filter_by(id=r.role_id).first().name, "container_id": r.container_id} for r in roles]
