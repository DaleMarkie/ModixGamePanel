from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base
import json
from passlib.hash import bcrypt
from backend.API.models import User, Role, UserRole, UserPermission, ROLE_TEMPLATES, PERMISSIONS
from sqlalchemy.orm import Session
from pathlib import Path

# SQLite database file (relative to backend directory)
SQLALCHEMY_DATABASE_URL = "sqlite:///backend/modix.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def create_base_users_from_config():
    config_path = Path(__file__).parent.parent / "modix_config" / "modix_config.json"
    with open(config_path) as f:
        config = json.load(f)

    db: Session = SessionLocal()
    # Ensure all roles from ROLE_TEMPLATES exist
    for tmpl in ROLE_TEMPLATES:
        if not db.query(Role).filter_by(name=tmpl["name"]).first():
            db.add(Role(name=tmpl["name"], hierarchy_level=tmpl["hierarchy_level"], description=tmpl["description"]))
    db.commit()
    # Create root Modix user
    username = config.get("MODIX_USERNAME") or "root"
    password = config.get("MODIX_PASSWORD") or "root"
    email = f"{username}@modix.local"
    user = db.query(User).filter_by(username=username).first()
    if not user:
        user = User(
            username=username,
            password_hash=bcrypt.hash(password),
            email=email,
            is_active=True
        )
        db.add(user)
        db.commit()
    # Assign all permissions to root user
    for perm in PERMISSIONS:
        if not db.query(UserPermission).filter_by(user_id=user.id, permission=perm).first():
            db.add(UserPermission(user_id=user.id, permission=perm, value="allow", container_id=None))
    db.commit()
    # Create additional users from MODIX_USERS
    for u in config.get("MODIX_USERS", []):
        uname = u.get("username") or "user"
        pwd = u.get("password") or "password"
        email = u.get("email") or f"{uname}@modix.local"
        user = db.query(User).filter_by(username=uname).first()
        if not user:
            user = User(
                username=uname,
                password_hash=bcrypt.hash(pwd),
                email=email,
                is_active=True
            )
            db.add(user)
            db.commit()
        # Assign roles
        for role_name in u.get("roles", []):
            role = db.query(Role).filter_by(name=role_name).first()
            if role and not db.query(UserRole).filter_by(user_id=user.id, role_id=role.id).first():
                db.add(UserRole(user_id=user.id, role_id=role.id, container_id=None))
        # Assign permissions
        for perm in u.get("permissions", []):
            if not db.query(UserPermission).filter_by(user_id=user.id, permission=perm).first():
                db.add(UserPermission(user_id=user.id, permission=perm, value="allow", container_id=None))
    db.commit()
    db.close()
