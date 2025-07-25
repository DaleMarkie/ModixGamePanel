"use client";

import React, { useState } from "react";

const ALL_ROLES = ["Admin", "Moderator", "User", "Guest"];
const ALL_PERMISSIONS = [
  "modix_dashboard_access",
  "modix_user_manage",
  "modix_server_manage",
  "modix_module_manage",
];

type User = {
  username: string;
  email: string;
  password: string;
  roles: string[];
  permissions: string[];
};

export default function RBACManager() {
  const [users, setUsers] = useState<User[]>([
    {
      username: "test",
      email: "test@example.com",
      password: "test",
      roles: ["Moderator"],
      permissions: ["modix_dashboard_access"],
    },
  ]);

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
  });

  const addUser = () => {
    if (!newUser.username || !newUser.email || !newUser.password)
      return alert("Fill all fields");

    if (users.find((u) => u.username === newUser.username))
      return alert("Username already exists");

    setUsers([...users, { ...newUser, roles: [], permissions: [] }]);
    setNewUser({ username: "", email: "", password: "" });
  };

  const removeUser = (username: string) => {
    if (!confirm(`Remove user "${username}"?`)) return;
    setUsers(users.filter((u) => u.username !== username));
  };

  const toggleRole = (username: string, role: string) => {
    setUsers(
      users.map((u) =>
        u.username === username
          ? {
              ...u,
              roles: u.roles.includes(role)
                ? u.roles.filter((r) => r !== role)
                : [...u.roles, role],
            }
          : u
      )
    );
  };

  const togglePermission = (username: string, permission: string) => {
    setUsers(
      users.map((u) =>
        u.username === username
          ? {
              ...u,
              permissions: u.permissions.includes(permission)
                ? u.permissions.filter((p) => p !== permission)
                : [...u.permissions, permission],
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
    setUsers(
      users.map((u) => (u.username === username ? { ...u, [field]: value } : u))
    );
  };

  return (
    <div
      style={{
        backgroundColor: "#1c1c1c",
        color: "#e2e2e2",
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "Inter, system-ui, sans-serif",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        MODIX: RBAC Panel
      </h1>

      {/* Add User */}
      <div
        style={{
          backgroundColor: "#262626",
          padding: 16,
          borderRadius: 6,
          border: "1px solid #333",
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Add User</h2>
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
        {users.map((user) => (
          <div
            key={user.username}
            style={{
              backgroundColor: "#262626",
              borderRadius: 6,
              padding: 16,
              border: "1px solid #333",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                alignItems: "center",
              }}
            >
              <strong style={{ fontSize: 16 }}>{user.username}</strong>
              <button
                onClick={() => removeUser(user.username)}
                style={btnDanger}
              >
                ✖
              </button>
            </div>

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
            <div style={{ marginBottom: 8 }}>
              <span style={labelTitle}>Roles</span>
              <div style={badgeRow}>
                {ALL_ROLES.map((role) => {
                  const active = user.roles.includes(role);
                  return (
                    <span
                      key={role}
                      style={{
                        ...badge,
                        backgroundColor: active ? "#009688" : "#333",
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

            {/* Permissions */}
            <div>
              <span style={labelTitle}>Permissions</span>
              <div style={badgeRow}>
                {ALL_PERMISSIONS.map((perm) => {
                  const active = user.permissions.includes(perm);
                  return (
                    <span
                      key={perm}
                      style={{
                        ...badge,
                        backgroundColor: active ? "#009688" : "#333",
                        color: active ? "#fff" : "#aaa",
                      }}
                      onClick={() => togglePermission(user.username, perm)}
                    >
                      {perm}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputSmall: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 4,
  border: "1px solid #444",
  backgroundColor: "#1c1c1c",
  color: "#e2e2e2",
  fontSize: 13,
  width: 180,
  outline: "none",
};

const inputInline: React.CSSProperties = {
  padding: "5px 8px",
  borderRadius: 4,
  border: "1px solid #444",
  backgroundColor: "#1c1c1c",
  color: "#ddd",
  fontSize: 13,
  width: 180,
  marginLeft: 8,
};

const btnPrimary: React.CSSProperties = {
  backgroundColor: "#009688",
  color: "#fff",
  border: "none",
  padding: "7px 14px",
  fontWeight: 600,
  borderRadius: 4,
  fontSize: 13,
  cursor: "pointer",
};

const btnDanger: React.CSSProperties = {
  backgroundColor: "#8b0000",
  color: "#fff",
  border: "none",
  padding: "4px 10px",
  borderRadius: 4,
  fontSize: 12,
  cursor: "pointer",
};

const labelCompact: React.CSSProperties = {
  fontSize: 13,
  color: "#aaa",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const labelTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#bbb",
  marginBottom: 4,
  display: "inline-block",
};

const badgeRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 6,
};

const badge: React.CSSProperties = {
  padding: "4px 10px",
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
  userSelect: "none",
  border: "1px solid #444",
  transition: "background-color 0.2s",
};
