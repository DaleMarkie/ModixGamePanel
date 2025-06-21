from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.API.Core.database import SessionLocal
from backend.API.Core.models import User, Role, UserRole, UserPermission, PERMISSIONS
from backend.API.Core.auth import require_permission
from passlib.hash import bcrypt
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(tags=["RBAC"], dependencies=[Depends(require_permission("modix_manage_permissions"))])

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
@router.post("/users", response_model=UserOut, dependencies=[Depends(require_permission("modix_user_create"))])
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

@router.get("/users", response_model=List[UserOut], dependencies=[Depends(require_permission("modix_user_edit"))])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.get("/users/{user_id}", response_model=UserOut, dependencies=[Depends(require_permission("modix_user_edit"))])
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/users/{user_id}", dependencies=[Depends(require_permission("modix_user_delete"))])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"status": "deleted", "user_id": user_id}

# --- Role Endpoints ---
@router.post("/roles", response_model=RoleOut, dependencies=[Depends(require_permission("modix_role_create"))])
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

@router.get("/roles", response_model=List[RoleOut], dependencies=[Depends(require_permission("modix_role_edit"))])
def list_roles(db: Session = Depends(get_db)):
    return db.query(Role).all()

@router.get("/roles/{role_id}", response_model=RoleOut, dependencies=[Depends(require_permission("modix_role_edit"))])
def get_role(role_id: int, db: Session = Depends(get_db)):
    role = db.query(Role).filter_by(id=role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.delete("/roles/{role_id}", dependencies=[Depends(require_permission("modix_role_delete"))])
def delete_role(role_id: int, db: Session = Depends(get_db)):
    role = db.query(Role).filter_by(id=role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    db.delete(role)
    db.commit()
    return {"status": "deleted", "role_id": role_id}

# --- Permission Endpoints ---
class PermissionAssign(BaseModel):
    permission: str
    value: str  # "allow" or "deny"
    container_id: Optional[int] = None

@router.post("/users/{user_id}/permissions", dependencies=[Depends(require_permission("modix_manage_permissions"))])
def assign_permission(user_id: int, perm: PermissionAssign, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if perm.permission not in PERMISSIONS:
        raise HTTPException(status_code=400, detail="Invalid permission")
    db.add(UserPermission(user_id=user_id, permission=perm.permission, value=perm.value, container_id=perm.container_id))
    db.commit()
    return {"status": "ok"}

@router.get("/users/{user_id}/permissions", dependencies=[Depends(require_permission("modix_manage_permissions"))])
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

@router.post("/users/{user_id}/roles", dependencies=[Depends(require_permission("modix_manage_permissions"))])
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

@router.get("/users/{user_id}/roles", dependencies=[Depends(require_permission("modix_manage_permissions"))])
def list_user_roles(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    roles = db.query(UserRole).filter_by(user_id=user_id).all()
    return [{"role": db.query(Role).filter_by(id=r.role_id).first().name, "container_id": r.container_id} for r in roles]

@router.get("/roles/{role_id}/permissions", dependencies=[Depends(require_permission("modix_manage_permissions"))])
def get_role_permissions(role_id: int, db: Session = Depends(get_db)):
    role = db.query(Role).filter_by(id=role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    # Fetch permissions for the role
    role_permissions = db.query(UserPermission).filter_by(user_id=None, container_id=None).all()
    # Actually, should use RolePermission table
    from backend.API.Core.models import RolePermission
    perms = db.query(RolePermission).filter_by(role_id=role_id).all()
    return [
        {
            "permission": p.permission,
            "value": p.value.value if hasattr(p.value, 'value') else p.value,
            "scope": p.scope,
            "container_id": p.container_id
        }
        for p in perms
    ]

@router.get("/permissions", dependencies=[Depends(require_permission("modix_manage_permissions"))])
def list_permissions():
    return {"permissions": list(PERMISSIONS)}
