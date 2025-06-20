from sqlalchemy.orm import Session
from .models import User, Role, UserRole, RolePermission, UserPermission, Container, PermissionValue
from typing import Optional

def resolve_permission(db: Session, user: User, permission: str, container: Optional[Container] = None) -> Optional[PermissionValue]:
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
