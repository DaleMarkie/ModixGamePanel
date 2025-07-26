"use client";

import React, { useState, useEffect } from "react";

const ALL_ROLES = ["Admin", "Moderator", "User", "Guest"] as const;
const PERMISSION_GROUPS: Record<string, string[]> = {
  Dashboard: ["modix_dashboard_access"],
  Users: ["modix_user_manage"],
  Servers: ["modix_server_manage"],
  Modules: ["modix_module_manage"],
};

type User = {
  username: string;
  email: string;
  password: string;
  roles: string[];
  permissions: string[];
};

export default function RBACManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [auditLog, setAuditLog] = useState<string[]>([]);
  const [permissionSearch, setPermissionSearch] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const saved = localStorage.getItem("rbacUsers");
    if (saved) setUsers(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("rbacUsers", JSON.stringify(users));
  }, [users]);

  const logAction = (msg: string) => {
    setAuditLog((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${msg}`,
    ]);
  };

  const addUser = () => {
    if (!newUser.username || !newUser.email || !newUser.password)
      return alert("Fill all fields");
    if (users.find((u) => u.username === newUser.username))
      return alert("Username already exists");

    const newEntry = { ...newUser, roles: [], permissions: [] };
    setUsers([...users, newEntry]);
    logAction(`➕ Added user "${newUser.username}"`);
    setNewUser({ username: "", email: "", password: "" });
  };

  const removeUser = (username: string) => {
    if (!confirm(`Remove user "${username}"?`)) return;
    setUsers(users.filter((u) => u.username !== username));
    logAction(`❌ Removed user "${username}"`);
  };

  const toggleRole = (username: string, role: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.username === username
          ? {
              ...u,
              roles: u.roles.includes(role)
                ? (logAction(`🔽 Removed role "${role}" from ${username}`),
                  u.roles.filter((r) => r !== role))
                : (logAction(`🔼 Added role "${role}" to ${username}`),
                  [...u.roles, role]),
            }
          : u
      )
    );
  };

  const togglePermission = (username: string, permission: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.username === username
          ? {
              ...u,
              permissions: u.permissions.includes(permission)
                ? (logAction(`🚫 Revoked "${permission}" from ${username}`),
                  u.permissions.filter((p) => p !== permission))
                : (logAction(`✅ Granted "${permission}" to ${username}`),
                  [...u.permissions, permission]),
            }
          : u
      )
    );
  };

  const updateUserField = (
    username: string,
    field: "email" | "password",
    value: string
  ) => {
    setUsers((prev) =>
      prev.map((u) => (u.username === username ? { ...u, [field]: value } : u))
    );
    logAction(`✏️ Updated ${field} for ${username}`);
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={container}>
      <h1 style={heading}>RBAC Panel</h1>
      <p
        style={{ marginBottom: 24, fontSize: 14, color: "#bbb", maxWidth: 600 }}
      >
        Manage user access and permissions efficiently with this Role-Based
        Access Control (RBAC) panel. Add and remove users, assign roles and
        granular permissions, update credentials, and track all changes in the
        audit log — ensuring you have full control over who can access and
        manage different parts of the MODIX system.
      </p>

      {/* Global Search */}
      <input
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ ...inputSmall, marginBottom: 16 }}
      />

      {/* Add User */}
      <div style={card}>
        <h2 style={subheading}>Add User</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            placeholder="Username"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            style={inputSmall}
          />
          <input
            placeholder="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            style={inputSmall}
          />
          <input
            placeholder="Password"
            type="password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            style={inputSmall}
          />
          <button onClick={addUser} style={btnPrimary}>
            ➕ Add
          </button>
        </div>
      </div>

      {/* Users */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filteredUsers.map((user) => {
          const query = permissionSearch[user.username] || "";
          return (
            <div key={user.username} style={card}>
              <div style={cardHeader}>
                <strong style={{ fontSize: 16 }}>{user.username}</strong>
                <button
                  onClick={() => removeUser(user.username)}
                  style={btnDanger}
                >
                  ✖
                </button>
              </div>

              {/* Email / Password */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                <label style={labelCompact}>
                  Email:
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) =>
                      updateUserField(user.username, "email", e.target.value)
                    }
                    style={inputInline}
                  />
                </label>
                <label style={labelCompact}>
                  Password:
                  <input
                    type="password"
                    value={user.password}
                    onChange={(e) =>
                      updateUserField(user.username, "password", e.target.value)
                    }
                    style={inputInline}
                  />
                </label>
              </div>

              {/* Roles */}
              <div style={{ marginBottom: 12 }}>
                <span style={labelTitle}>Roles</span>
                <div style={badgeRow}>
                  {ALL_ROLES.map((role) => {
                    const active = user.roles.includes(role);
                    return (
                      <span
                        key={role}
                        title={`Toggle ${role} role`}
                        style={{
                          ...badge,
                          backgroundColor: active ? "#2196F3" : "#333",
                          color: active ? "#fff" : "#aaa",
                        }}
                        onClick={() => toggleRole(user.username, role)}
                      >
                        {role}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Permission Search */}
              <input
                placeholder="Search permissions..."
                value={permissionSearch[user.username] || ""}
                onChange={(e) =>
                  setPermissionSearch({
                    ...permissionSearch,
                    [user.username]: e.target.value,
                  })
                }
                style={{ ...inputSmall, marginBottom: 10, width: "100%" }}
              />

              {/* Permissions */}
              <div>
                <span style={labelTitle}>Permissions</span>
                {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => {
                  const visiblePerms = perms.filter((p) =>
                    p.toLowerCase().includes(query.toLowerCase())
                  );
                  if (visiblePerms.length === 0) return null;

                  return (
                    <div key={group} style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, marginBottom: 4 }}>
                        {group}
                      </div>
                      <div style={badgeRow}>
                        {visiblePerms.map((perm) => {
                          const active = user.permissions.includes(perm);
                          return (
                            <span
                              key={perm}
                              title={`Toggle ${perm}`}
                              style={{
                                ...badge,
                                backgroundColor: active ? "#4CAF50" : "#333",
                                color: active ? "#fff" : "#aaa",
                              }}
                              onClick={() =>
                                togglePermission(user.username, perm)
                              }
                            >
                              {perm}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Log */}
      {auditLog.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h3 style={{ fontSize: 15, color: "#aaa", marginBottom: 8 }}>
            Audit Log
          </h3>
          <div
            style={{
              backgroundColor: "#111",
              padding: 12,
              borderRadius: 6,
              fontSize: 12,
              color: "#999",
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            {auditLog.map((entry, i) => (
              <div key={i}>{entry}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Styles (only badgeRow changed)
const container: React.CSSProperties = {
  backgroundColor: "#1c1c1c",
  color: "#e2e2e2",
  minHeight: "100vh",
  padding: "24px",
  fontFamily: "Inter, system-ui, sans-serif",
  maxWidth: 1200,
  margin: "0 auto",
};

const heading: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  marginBottom: 16,
};

const subheading: React.CSSProperties = {
  fontSize: 16,
  marginBottom: 12,
};

const card: React.CSSProperties = {
  backgroundColor: "#262626",
  padding: 16,
  borderRadius: 6,
  border: "1px solid #333",
};

const cardHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 8,
  alignItems: "center",
};

const inputSmall: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 4,
  border: "1px solid #444",
  backgroundColor: "#121212",
  color: "#ddd",
  fontSize: 14,
  outline: "none",
  minWidth: 140,
};

const inputInline: React.CSSProperties = {
  marginLeft: 8,
  padding: "4px 8px",
  borderRadius: 4,
  border: "1px solid #444",
  backgroundColor: "#121212",
  color: "#ddd",
  fontSize: 14,
  outline: "none",
};

const labelCompact: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  fontSize: 14,
  gap: 6,
};

const labelTitle: React.CSSProperties = {
  fontWeight: "600",
  fontSize: 13,
  marginBottom: 6,
  display: "inline-block",
};

const btnPrimary: React.CSSProperties = {
  backgroundColor: "#2196F3",
  border: "none",
  color: "white",
  padding: "6px 14px",
  borderRadius: 4,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
};

const btnDanger: React.CSSProperties = {
  backgroundColor: "#f44336",
  border: "none",
  color: "white",
  padding: "4px 10px",
  borderRadius: 4,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
};

const badge: React.CSSProperties = {
  cursor: "pointer",
  userSelect: "none",
  padding: "4px 10px",
  borderRadius: 12,
  fontSize: 12,
  border: "1px solid #444",
  whiteSpace: "nowrap",
  transition: "background-color 0.3s, color 0.3s",
};

// THIS IS THE ONLY CHANGE:
// badgeRow now forces one horizontal row with horizontal scroll if overflow
const badgeRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "nowrap",
  gap: 8,
  marginTop: 6,
  overflowX: "auto",
};
