from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship, declarative_base
import enum

Base = declarative_base()

class PermissionValue(enum.Enum):
    allow = "allow"
    deny = "deny"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=True)  # Full name or display name
    password_hash = Column(String, nullable=False)
    email = Column(String, unique=True)
    is_active = Column(Boolean, default=True)
    roles = relationship("UserRole", back_populates="user")
    permissions = relationship("UserPermission", back_populates="user")


# ModixAccount class for future use (can be expanded as needed)
class ModixAccount(Base):
    __tablename__ = "modix_accounts"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_type = Column(String, nullable=False, default="standard")
    created_at = Column(String, nullable=True)
    profile_url = Column(String, nullable=True)
    license_key = Column(String, nullable=True)  # For premium accounts
    # Add more fields as needed

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    hierarchy_level = Column(Integer, nullable=False)  # Higher = more power
    description = Column(Text)
    permissions = relationship("RolePermission", back_populates="role")

class Container(Base):
    __tablename__ = "servers"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    docker_id = Column(String, unique=True, nullable=True)
    script_location = Column(String, nullable=True)
    description = Column(Text)

class UserRole(Base):
    __tablename__ = "user_roles"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role_id = Column(Integer, ForeignKey("roles.id"))
    scope = Column(String, default="global")  # "global" or "server"
    server_id = Column(Integer, ForeignKey("servers.id"), nullable=True)
    user = relationship("User", back_populates="roles")
    role = relationship("Role")
    server = relationship("Server")

class RolePermission(Base):
    __tablename__ = "role_permissions"
    id = Column(Integer, primary_key=True)
    role_id = Column(Integer, ForeignKey("roles.id"))
    permission = Column(String, nullable=False)
    value = Column(Enum(PermissionValue), nullable=False)
    scope = Column(String, default="global")
    server_id = Column(Integer, ForeignKey("servers.id"), nullable=True)
    role = relationship("Role", back_populates="permissions")
    server = relationship("Server")

class UserPermission(Base):
    __tablename__ = "user_permissions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    permission = Column(String, nullable=False)
    value = Column(Enum(PermissionValue), nullable=False)
    scope = Column(String, default="global")
    server_id = Column(Integer, ForeignKey("servers.id"), nullable=True)
    user = relationship("User", back_populates="permissions")
    server = relationship("Server")

# Permission constants for use throughout the app
PERMISSIONS = [
# MODIX-WIDE permissions
    "modix_dashboard_access",         # Can view the Modix dashboard
    # MODIX Server Permissions
    "modix_server_create",            # Can create new servers/containers
    "modix_server_edit",              # Can edit server/container settings
    "modix_server_delete",            # Can delete servers/containers
    "modix_audit_log_view",           # Can view audit logs
    "modix_settings_view",            # Can view Modix settings
    "modix_settings_edit",            # Can edit Modix settings
    "modix_api_key_manage",           # Can create/revoke API keys
    "modix_notification_manage",
    "modix_schemas",                   # Can manage global notifications
    "modix_get_containers",            # Can get a list of all containers
# CONTAINER-LEVEL permissions
    "container_logs_view",                # Can view logs for a container
    "container_logs_download",            # Can download logs for a container
    "container_manage",                   # Can start/stop/restart the container
    "container_backup",                   # Can create/restore backups for a container
    "container_update",                   # Can update the container image
    "container_config_view",              # Can view container configuration
    "container_config_edit",              # Can edit container configuration
    "container_processes_view",           # Can view running processes in the container
    "container_metrics_view",             # Can view container metrics (CPU, RAM, etc.)
    "container_webhook_trigger",          # Can trigger webhooks manually
    # Add more as needed for future features
]

# Example role templates for initial setup or UI
ROLE_TEMPLATES = [
    {
        "name": "Owner",
        "hierarchy_level": 100,
        "description": "Full control over Modix and all containers.",
        "permissions": PERMISSIONS  # All permissions
    },
    {
        "name": "Admin",
        "hierarchy_level": 90,
        "description": "Manage users, servers, and most features.",
        "permissions": [
            "modix_dashboard_access", "modix_user_create", "modix_user_edit", "modix_user_delete", "modix_role_create", "modix_role_edit", "modix_role_delete", "modix_server_create", "modix_server_edit", "modix_server_delete", "modix_audit_log_view", "modix_settings_view", "modix_settings_edit", "modix_api_key_manage", "modix_notification_manage",
            "container_discord_webhook_manage", "container_workshop_manage", "container_terminal_access", "container_terminal_exec", "container_filemanager_access", "container_file_read", "container_file_write", "container_file_delete", "container_logs_view", "container_logs_download", "container_manage", "container_backup", "container_update", "container_config_view", "container_config_edit", "container_player_manage", "container_mod_manager_access", "container_mod_install", "container_mod_remove", "container_mod_update", "container_metrics_view", "container_webhook_trigger"
        ]
    },
    {
        "name": "Operator",
        "hierarchy_level": 70,
        "description": "Can manage containers, terminal, files, and mods.",
        "permissions": [
            "modix_dashboard_access", "modix_server_edit", "modix_audit_log_view", "container_discord_webhook_manage", "container_workshop_manage", "container_terminal_access", "container_terminal_exec", "container_filemanager_access", "container_file_read", "container_file_write", "container_file_delete", "container_logs_view", "container_logs_download", "container_manage", "container_backup", "container_update", "container_config_view", "container_config_edit", "container_player_manage", "container_mod_manager_access", "container_mod_install", "container_mod_remove", "container_mod_update", "container_metrics_view"
        ]
    },
    {
        "name": "Moderator",
        "hierarchy_level": 50,
        "description": "Can manage players, view logs, and use terminal.",
        "permissions": [
            "modix_dashboard_access", "container_terminal_access", "container_terminal_exec", "container_logs_view", "container_player_manage", "container_metrics_view"
        ]
    },
    {
        "name": "Viewer",
        "hierarchy_level": 10,
        "description": "Read-only access to dashboard and logs.",
        "permissions": [
            "modix_dashboard_access", "container_logs_view", "container_metrics_view"
        ]
    }
]
