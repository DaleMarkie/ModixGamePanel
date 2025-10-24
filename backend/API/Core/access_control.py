# access_control.py
# ----------------
# Core RBAC permission resolution for Modix.
# Checks user and role permissions, globally or container-scoped.

from sqlalchemy.orm import Session
from typing import Optional
from pathlib import Path
import json

from .models import (
    User,
    Role,
    UserRole,
    RolePermission,
    UserPermission,
    Container,
    PermissionValue,
)

# ---------------------------
# Root / Superuser Detection
# ---------------------------
def get_root_usernames() -> list[str]:
    """Return a list of usernames considered root/superuser."""
    root_usernames = ["root"]
    config_path = Path(__file__).parent.parent / "modix_config" / "modix_config.json"
    try:
        with open(config_path, "r") as f:
            config = json.load(f)
            root_usernames.append(config.get("MODIX_USERNAME", "root"))
    except Exception:
        # Ignore if config missing or invalid
        pass
    return root_usernames


# ---------------------------
# Core Permission Resolver
# ---------------------------
def resolve_permission(
    db: Session, 
    user: User, 
    permission: str, 
    container: Optional[Container] = None
) -> Optional[PermissionValue]:
    """
    Resolves a user's permission value for a given permission string,
    optionally scoped to a container.

    Resolution order:
      1. Root users always allowed
      2. Explicit user permissions (container-specific, then global)
      3. Roles (container-specific, then global, highest hierarchy first)
      4. Default: None (deny)
    """
    # 1️⃣ Root user check
    if user.username in get_root_usernames():
        return PermissionValue.allow

    # 2️⃣ Explicit user permissions
    if container:
        up_container = (
            db.query(UserPermission)
            .filter_by(user_id=user.id, permission=permission, scope="container", container_id=container.id)
            .first()
        )
        if up_container:
            return up_container.value

    up_global = (
        db.query(UserPermission)
        .filter_by(user_id=user.id, permission=permission, scope="global")
        .first()
    )
    if up_global:
        return up_global.value

    # 3️⃣ Role-based permissions
    roles_assoc = db.query(UserRole).filter_by(user_id=user.id).all()
    # Sort roles by hierarchy descending
    roles_assoc.sort(key=lambda r: r.role.hierarchy_level, reverse=True)

    for role_assoc in roles_assoc:
        # Container-scoped role
        if container and role_assoc.scope == "container" and role_assoc.container_id == container.id:
            rp_container = (
                db.query(RolePermission)
                .filter_by(role_id=role_assoc.role_id, permission=permission, scope="container", container_id=container.id)
                .first()
            )
            if rp_container:
                return rp_container.value

        # Global role
        if role_assoc.scope == "global":
            rp_global = (
                db.query(RolePermission)
                .filter_by(role_id=role_assoc.role_id, permission=permission, scope="global")
                .first()
            )
            if rp_global:
                return rp_global.value

    # 4️⃣ Default deny
    return None
