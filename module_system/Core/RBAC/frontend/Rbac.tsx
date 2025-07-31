
"use client";

import { useState, useEffect } from "react";
import { apiHandler } from "@/utils/apiHandler";

// --- Styles ---
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
const card: React.CSSProperties = {
  backgroundColor: "#262626",
  padding: 16,
  borderRadius: 6,
  border: "1px solid #333",
  marginBottom: 8,
};
const cardHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 8,
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

// --- Types ---
type User = {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  roles?: string[];
  permissions?: string[];
};

type Role = {
  id: number;
  name: string;
  hierarchy_level: number;
  description?: string;
};

type UserRole = { role: string; container_id?: number };
type UserPermission = { permission: string; value: string; container_id?: number };

// --- Component ---

export default function RBACManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "Viewer",
    active: true,
  });
  const [adding, setAdding] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [userRoles, setUserRoles] = useState<Record<number, UserRole[]>>({});
  const [userPerms, setUserPerms] = useState<Record<number, UserPermission[]>>({});
  const [loadingRolesPerms, setLoadingRolesPerms] = useState(false);

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiHandler<User[]>("/api/rbac/users");
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all roles and permissions
  const fetchRolesAndPerms = async () => {
    setLoadingRolesPerms(true);
    try {
      const [rolesData, permsData] = await Promise.all([
        apiHandler<Role[]>("/api/rbac/roles"),
        apiHandler<{ permissions: string[] }>("/api/rbac/permissions"),
      ]);
      setRoles(rolesData);
      setAllPermissions(permsData.permissions);
    } catch (err) {
      // ignore for now
    } finally {
      setLoadingRolesPerms(false);
    }
  };

  // Fetch roles and permissions for each user
  const fetchUserRolesPerms = async (userId: number) => {
    try {
      const [roles, perms] = await Promise.all([
        apiHandler<UserRole[]>(`/api/rbac/users/${userId}/roles`),
        apiHandler<UserPermission[]>(`/api/rbac/users/${userId}/permissions`),
      ]);
      setUserRoles(prev => ({ ...prev, [userId]: roles }));
      setUserPerms(prev => ({ ...prev, [userId]: perms }));
    } catch (err) {
      // ignore for now
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRolesAndPerms();
  }, []);

  useEffect(() => {
    users.forEach(u => fetchUserRolesPerms(u.id));
    // eslint-disable-next-line
  }, [users.length]);

  // Add new user
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      await apiHandler("/api/rbac/users", {
        fetchInit: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: newUser.username,
            password: newUser.password,
            email: newUser.email,
            is_active: newUser.active,
            roles: [newUser.role],
            permissions: [],
          }),
        },
      });
      setNewUser({ username: "", email: "", password: "", role: "Viewer", active: true });
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to add user");
    } finally {
      setAdding(false);
    }
  };

  // Remove user
  const handleRemoveUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    setError(null);
    try {
      await apiHandler(`/api/rbac/users/${userId}`, {
        fetchInit: { method: "DELETE" },
      });
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to remove user");
    }
  };

  // Toggle user role
  const handleToggleRole = async (userId: number, roleName: string, hasRole: boolean) => {
    setError(null);
    try {
      if (hasRole) {
        // Remove role: not directly supported, so could be a custom endpoint; for now, skip
        alert("Role removal not implemented in backend");
      } else {
        await apiHandler(`/api/rbac/users/${userId}/roles`, {
          fetchInit: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role_name: roleName }),
          },
        });
        fetchUserRolesPerms(userId);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    }
  };

  // Toggle user permission
  const handleTogglePerm = async (userId: number, perm: string, hasPerm: boolean) => {
    setError(null);
    try {
      await apiHandler(`/api/rbac/users/${userId}/permissions`, {
        fetchInit: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permission: perm, value: hasPerm ? "deny" : "allow" }),
        },
      });
      fetchUserRolesPerms(userId);
    } catch (err: any) {
      setError(err.message || "Failed to update permission");
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={container}>
      <h1 style={heading}>RBAC Panel</h1>
      <p style={{ marginBottom: 24, fontSize: 14, color: "#bbb", maxWidth: 600 }}>
        Manage user access and permissions efficiently with this Role-Based
        Access Control (RBAC) panel. View all users in the system below.
      </p>

      {/* Global Search */}
      <input
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ ...inputSmall, marginBottom: 16 }}
      />

      {/* Add User Form */}
      <form onSubmit={handleAddUser} style={{ ...card, marginBottom: 24, display: "flex", gap: 12, alignItems: "center" }}>
        <input
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={e => setNewUser({ ...newUser, username: e.target.value })}
          style={inputSmall}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={e => setNewUser({ ...newUser, email: e.target.value })}
          style={inputSmall}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={e => setNewUser({ ...newUser, password: e.target.value })}
          style={inputSmall}
          required
        />
        <select
          value={newUser.role}
          onChange={e => setNewUser({ ...newUser, role: e.target.value })}
          style={inputSmall}
        >
          {roles.map(r => (
            <option key={r.name}>{r.name}</option>
          ))}
        </select>
        <label style={{ color: "#bbb", fontSize: 14 }}>
          Active
          <input
            type="checkbox"
            checked={newUser.active}
            onChange={e => setNewUser({ ...newUser, active: e.target.checked })}
            style={{ marginLeft: 6 }}
          />
        </label>
        <button type="submit" disabled={adding} style={{ ...inputSmall, background: "#4CAF50", color: "#fff", cursor: adding ? "not-allowed" : "pointer" }}>
          {adding ? "Adding..." : "Add User"}
        </button>
      </form>

      {loading && <div>Loading users...</div>}
      {error && <div style={{ color: "#f44336" }}>{error}</div>}

      {/* Users */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filteredUsers.map((user) => (
          <div key={user.id} style={card}>
            <div style={cardHeader}>
              <strong style={{ fontSize: 16 }}>{user.username}</strong>
              <span style={{ color: user.is_active ? "#4CAF50" : "#f44336", fontWeight: 600, marginLeft: 8 }}>
                {user.is_active ? "Active" : "Inactive"}
              </span>
              <button
                onClick={() => handleRemoveUser(user.id)}
                style={{ marginLeft: "auto", background: "#f44336", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer" }}
              >
                Remove
              </button>
            </div>
            <div style={{ fontSize: 14, color: "#bbb" }}>Email: {user.email}</div>

            {/* Roles */}
            <div style={{ marginTop: 8 }}>
              <strong>Roles:</strong>
              {loadingRolesPerms ? (
                <span style={{ marginLeft: 8 }}>Loading...</span>
              ) : (
                <>
                  {roles.map(role => {
                    const hasRole = (userRoles[user.id] || []).some(r => r.role === role.name);
                    return (
                      <label key={role.name} style={{ marginLeft: 12, fontWeight: 400 }}>
                        <input
                          type="checkbox"
                          checked={hasRole}
                          onChange={() => handleToggleRole(user.id, role.name, hasRole)}
                          disabled={hasRole} // Only allow adding for now
                        />
                        {role.name}
                      </label>
                    );
                  })}
                </>
              )}
            </div>

            {/* Permissions */}
            <div style={{ marginTop: 8 }}>
              <strong>Permissions:</strong>
              {loadingRolesPerms ? (
                <span style={{ marginLeft: 8 }}>Loading...</span>
              ) : (
                <>
                  {allPermissions.map(perm => {
                    const hasPerm = (userPerms[user.id] || []).some(p => p.permission === perm && p.value === "allow");
                    return (
                      <label key={perm} style={{ marginLeft: 12, fontWeight: 400 }}>
                        <input
                          type="checkbox"
                          checked={hasPerm}
                          onChange={() => handleTogglePerm(user.id, perm, hasPerm)}
                        />
                        {perm}
                      </label>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
