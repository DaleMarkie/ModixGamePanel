# This module handles database setup and config-driven initialization for Modix RBAC
# It ensures roles, users, and permissions from config are present in the DB, but never deletes or overwrites existing DB entries.
# Safe for production: host can delete or modify DB entries and they will not be re-created unless present in config.

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base
import json
from passlib.hash import bcrypt
from API.Core.models import User, Role, UserRole, UserPermission, ROLE_TEMPLATES, PERMISSIONS
from sqlalchemy.orm import Session
from pathlib import Path

# For YAML parsing and file scanning
import yaml
import os

# SQLite database file (relative to backend directory)
SQLALCHEMY_DATABASE_URL = "sqlite:///backend/modix.db"

# SQLAlchemy engine and session setup
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Create all tables if they do not exist."""
    Base.metadata.create_all(bind=engine)

def create_base_users_from_config():
    """
    Sync roles, users, and permissions from modix_config.json and ROLE_TEMPLATES.
    - Only creates or updates entries if missing or changed.
    - Never deletes or overwrites DB entries missing from config/templates.
    - Host can safely delete or modify DB entries without them being re-created unless present in config.
    """
    config_path = Path(__file__).parent.parent.parent / "modix_config" / "modix_config.json"
    with open(config_path) as f:
        config = json.load(f)

    db: Session = SessionLocal()
    # Ensure all roles from ROLE_TEMPLATES exist (never deletes roles not in templates)
    from backend.API.Core.models import RolePermission, PermissionValue
    for tmpl in ROLE_TEMPLATES:
        role = db.query(Role).filter_by(name=tmpl["name"]).first()
        if not role:
            # Create the role
            role = Role(name=tmpl["name"], hierarchy_level=tmpl["hierarchy_level"], description=tmpl["description"])
            db.add(role)
            db.commit()
            # Assign permissions from template (if any)
            perms = tmpl.get("permissions", [])
            for perm in perms:
                # Normalize permission name
                perm_name = str(perm).replace(":", "_").lower()
                # Only add if not already present
                if not db.query(RolePermission).filter_by(role_id=role.id, permission=perm_name).first():
                    db.add(RolePermission(role_id=role.id, permission=perm_name, value=PermissionValue.allow))
        # Optionally update role description/hierarchy if changed in template
        elif role.description != tmpl["description"] or role.hierarchy_level != tmpl["hierarchy_level"]:
            role.description = tmpl["description"]
            role.hierarchy_level = tmpl["hierarchy_level"]
    db.commit()
    # Create root Modix user if not present, or update password if specified in config
    username = config.get("MODIX_USERNAME") or "root"
    password = config.get("MODIX_PASSWORD")  # can be None
    email = f"{username}@modix.local"
    user = db.query(User).filter_by(username=username).first()
    if not user:
        # If password is not set, require password on first login (set to None or empty string)
        password_hash = bcrypt.hash(password) if password else None
        user = User(
            username=username,
            password_hash=password_hash,
            email=email,
            is_active=True
        )
        db.add(user)
        db.commit()
    else:
        # If password is specified in config and different from current, update it
        if password:
            if not bcrypt.verify(password, user.password_hash):
                user.password_hash = bcrypt.hash(password)
                db.commit()
    # Print root password if in debug mode
    debug_mode = config.get("MODIX_DEBUG_LOG", False)
    if debug_mode and password:
        print(f"[DEBUG] Root user password: {password}")
    # Assign all permissions to root user (never removes permissions)
    for perm in PERMISSIONS:
        if not db.query(UserPermission).filter_by(user_id=user.id, permission=perm).first():
            db.add(UserPermission(user_id=user.id, permission=perm, value="allow", container_id=None))
    # Assign Owner role to root user if not already assigned
    owner_role = db.query(Role).filter_by(name="Owner").first()
    if owner_role and not db.query(UserRole).filter_by(user_id=user.id, role_id=owner_role.id).first():
        db.add(UserRole(user_id=user.id, role_id=owner_role.id, container_id=None))
    db.commit()
    # Create additional users from MODIX_USERS (never deletes users not in config)
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
        # Assign roles (never removes roles not in config)
        for role_name in u.get("roles", []):
            role = db.query(Role).filter_by(name=role_name).first()
            if role and not db.query(UserRole).filter_by(user_id=user.id, role_id=role.id).first():
                db.add(UserRole(user_id=user.id, role_id=role.id, container_id=None))
        # Assign permissions (never removes permissions not in config)
        for perm in u.get("permissions", []):
            if not db.query(UserPermission).filter_by(user_id=user.id, permission=perm).first():
                db.add(UserPermission(user_id=user.id, permission=perm, value="allow", container_id=None))
    db.commit()
    db.close()


def register_module_permissions(module_base_path="module_system"):
    """
    Scan all module.yaml files in module_base_path, extract permissions (from permissions list and frontend routes/nav_items),
    and add them to the database if not already present.
    """
    db: Session = SessionLocal()
    permissions_found = set()
    for root, dirs, files in os.walk(module_base_path):
        for file in files:
            if file == "module.yaml":
                yaml_path = os.path.join(root, file)
                with open(yaml_path, "r") as f:
                    try:
                        data = yaml.safe_load(f)
                    except Exception as e:
                        print(f"[WARN] Could not parse {yaml_path}: {e}")
                        continue
                # Use nickname if present, else name
                module_prefix = (data.get("nickname") or data.get("name") or "UnknownModule").lower()
                # If under Game_Modules, use folder above as first section
                if "Game_Modules" in yaml_path:
                    parts = yaml_path.split(os.sep)
                    try:
                        idx = parts.index("Game_Modules")
                        game_folder = parts[idx+1].lower()
                        module_prefix = f"{game_folder}_{module_prefix}"
                    except Exception:
                        pass
                module_prefix = module_prefix + "_"
                # Only use declared permissions
                perms = data.get("permissions", [])
                for perm in perms:
                    if perm:
                        clean_perm = (module_prefix + str(perm).replace(":", "_")).lower()
                        permissions_found.add(clean_perm)
    # Ensure root user has all permissions found (static and dynamic), in sorted order
    root_user = db.query(User).filter_by(username="root").first()
    all_perms = set()
    # Add static permissions (with no prefix, but replace ':' with '_')
    for perm in PERMISSIONS:
        all_perms.add(str(perm).replace(":", "_").lower())
    all_perms.update(permissions_found)
    for perm in sorted(all_perms):
        if root_user and not db.query(UserPermission).filter_by(user_id=root_user.id, permission=perm).first():
            db.add(UserPermission(user_id=root_user.id, permission=perm, value="allow", container_id=None))
    db.commit()
    db.close()
