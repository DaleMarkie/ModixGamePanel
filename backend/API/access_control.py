# access_control.py
# ----------------
# Contains the core RBAC permission resolution logic for Modix.
# This module is used by API dependencies to check if a user has a specific permission,
# either globally or for a specific container, using both user and role assignments.

from sqlalchemy.orm import Session
from .models import User, Role, UserRole, RolePermission, UserPermission, Container, PermissionValue
from typing import Optional

def resolve_permission(db: Session, user: User, permission: str, container: Optional[Container] = None) -> Optional[PermissionValue]:
    """
    Resolves whether a user has a given permission, optionally scoped to a container.
    Checks (in order):
      0. If user is root (superuser), always allow
      1. Explicit user permission (container-specific, then global)
      2. Permissions from user's roles (container-specific, then global, highest hierarchy wins)
      3. Default: deny (returns None)
    Returns:
      PermissionValue.allow, PermissionValue.deny, or None (if not set)
    """
    # 0. Superuser/root check (by username)
    ROOT_USERNAMES = ["root"]
    import os
    from pathlib import Path
    import json
    config_path = Path(__file__).parent.parent / "modix_config" / "modix_config.json"
    try:
        with open(config_path) as f:
            config = json.load(f)
            root_username = config.get("MODIX_USERNAME", "root")
            ROOT_USERNAMES.append(root_username)
    except Exception:
        pass
    if user.username in ROOT_USERNAMES:
        return PermissionValue.allow

    # 1. Check explicit user permission (container-specific, then global)
    if container:
        up = db.query(UserPermission).filter_by(user_id=user.id, permission=permission, scope="container", container_id=container.id).first()
        if up:
            return up.value
    up = db.query(UserPermission).filter_by(user_id=user.id, permission=permission, scope="global").first()
    if up:
        return up.value

    # 2. Check roles (container-specific, then global), highest hierarchy wins
    roles = db.query(UserRole).filter_by(user_id=user.id).all()
    # Sort roles by hierarchy_level descending
    roles = sorted(roles, key=lambda r: r.role.hierarchy_level, reverse=True)
    for role_assoc in roles:
        if container and role_assoc.scope == "container" and role_assoc.container_id == container.id:
            rp = db.query(RolePermission).filter_by(role_id=role_assoc.role_id, permission=permission, scope="container", container_id=container.id).first()
            if rp:
                return rp.value
        if role_assoc.scope == "global":
            rp = db.query(RolePermission).filter_by(role_id=role_assoc.role_id, permission=permission, scope="global").first()
            if rp:
                return rp.value
    # 3. Default: deny
    return None
