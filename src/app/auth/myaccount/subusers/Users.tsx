"use client";

import React, { useEffect, useState } from "react";
import { getServerUrl } from "@/app/config";
import "./Users.css";

export interface SubUser {
  id: string;
  username: string;
  email?: string;
  role: "Owner" | "Admin" | "SubUser";
  source: "server" | "local";
  password?: string;
  pages?: string[];
}

const LOCAL_USERS_KEY = "modix_local_users";
const USER_KEY = "modix_user";

const Users = () => {
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<SubUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const allPages = [
    "Dashboard",
    "AllPlayers",
    "PlayersBanned",
    "ChatLogs",
    "StaffChat",
    "Settings",
    "ServerSettings",
    "Mods",
    "ModUpdates",
    "ModManager",
    "Subscriptions",
    "MyAccount",
    "MySettings",
    "FileBrowser",
    "ModUpdater",
    "Terminal",
    "Install",
    "Docs",
    "Help",
    "Workshop",
    "BackUp",
    "DdosManager",
    "Debugger",
    "Performance",
    "PortCheck",
    "SteamPlayerManager",
    "ThemeManager",
    "Language_Region",
    "SecurityPreferences",
    "ApiKeys",
    "Games",
    "EmbededMessages",
  ];

  // ✅ Current user
  const currentUser: SubUser | null = (() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const isOwner = currentUser?.role === "Owner";

  const fetchSubUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("modix_token");

      // --- Server Users ---
      let serverUsers: SubUser[] = [];
      try {
        const res = await fetch(`${getServerUrl()}/api/subusers`, {
          headers: { Authorization: token || "" },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            serverUsers = (data.subUsers || []).map((u: any) => ({
              id: u.username,
              username: u.username,
              email: u.email,
              role: u.account_type || "SubUser",
              source: "server" as const,
              pages: u.pages || [],
            }));
          }
        }
      } catch {}

      // --- Local Users ---
      let localUsers: SubUser[] = [];
      try {
        const savedUsers = JSON.parse(
          localStorage.getItem(LOCAL_USERS_KEY) || "[]"
        );
        localUsers = savedUsers.map((u: any) => {
          let pages = u.pages;
          if (!pages || pages.length === 0) {
            // Owners and Admins get all pages
            pages =
              u.role === "Owner" || u.role === "Admin"
                ? allPages
                : ["Dashboard", "MyAccount"];
          }
          return {
            id: u.username,
            username: u.username,
            email: u.email,
            role: u.role || "SubUser",
            source: "local",
            password: u.password,
            pages,
          };
        });
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
      } catch {}

      setSubUsers([...serverUsers, ...localUsers]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubUsers();
  }, []);

  const openEditModal = (user: SubUser) => {
    setEditingUser({ ...user });
    setModalOpen(true);
  };

  const saveEdit = () => {
    if (!editingUser) return;

    if (!isOwner) {
      alert("Only the Owner can save user settings.");
      return;
    }

    if (editingUser.source === "local") {
      let users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");

      if (editingUser.id) {
        // Update existing
        users = users.map((u: any) =>
          u.username === editingUser.id ? { ...u, ...editingUser } : u
        );
      } else {
        // Add new user
        const defaultPages =
          editingUser.role === "Owner" || editingUser.role === "Admin"
            ? allPages
            : ["Dashboard", "MyAccount"];
        users.push({
          ...editingUser,
          id: editingUser.username,
          pages: defaultPages,
        });
      }

      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      setSubUsers(users);

      setModalOpen(false);
      setEditingUser(null);
    } else {
      alert("Server users must be edited via backend.");
    }
  };

  const deleteUser = (user: SubUser) => {
    if (!window.confirm(`Delete user ${user.username}?`)) return;

    if (!isOwner) {
      alert("Only the Owner can delete users.");
      return;
    }

    if (user.source === "local") {
      let users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
      users = users.filter((u: any) => u.username !== user.id);
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      setSubUsers(users);
    } else {
      alert("Server users must be deleted via backend.");
    }
  };

  if (!currentUser) return <div>⚠️ No valid user logged in.</div>;
  if (loading) return <div>Loading users...</div>;

  return (
    <div className="subusers-container">
      {/* Page Description */}
      <div className="users-description">
        <p>
          This page allows the Admin (Owner) to manage all users. Only the Admin
          can add, edit, or delete users. SubUsers can view users but cannot
          make changes.
        </p>
      </div>

      <header className="users-header">
        <h2>👥 Users</h2>
        {isOwner && (
          <button
            className="add-subuser-btn"
            onClick={() =>
              openEditModal({
                id: "",
                username: "",
                email: "",
                role: "SubUser",
                source: "local",
                pages: ["Dashboard", "MyAccount"],
              })
            }
          >
            + Add User
          </button>
        )}
      </header>

      {subUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="subusers-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Pages Access</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email || "-"}</td>
                <td>{user.role}</td>
                <td>{(user.pages || []).join(", ") || "-"}</td>
                <td>
                  {isOwner || currentUser?.username === user.username ? (
                    <>
                      <button
                        onClick={() => openEditModal(user)}
                        disabled={!isOwner}
                      >
                        Edit
                      </button>
                      {isOwner && (
                        <button onClick={() => deleteUser(user)}>Delete</button>
                      )}
                    </>
                  ) : (
                    <span>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit Modal */}
      {modalOpen && editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {editingUser.id
                ? `Edit User: ${editingUser.username}`
                : "Add New User"}
            </h3>

            <label>Username</label>
            <input
              type="text"
              value={editingUser.username}
              onChange={(e) =>
                setEditingUser({ ...editingUser, username: e.target.value })
              }
              disabled={!isOwner && editingUser.role === "Owner"}
            />

            <label>Email</label>
            <input
              type="email"
              value={editingUser.email || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Leave blank to keep current"
              onChange={(e) =>
                setEditingUser({ ...editingUser, password: e.target.value })
              }
            />

            <label>Role</label>
            <select
              value={editingUser.role}
              onChange={(e) =>
                setEditingUser({ ...editingUser, role: e.target.value as any })
              }
              disabled={!isOwner}
            >
              <option value="Owner">Owner</option>
              <option value="Admin">Admin</option>
              <option value="SubUser">SubUser</option>
            </select>

            <label>Pages Access</label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {allPages.map((page) => (
                <label key={page} style={{ fontSize: "0.9rem" }}>
                  <input
                    type="checkbox"
                    checked={editingUser.pages?.includes(page)}
                    onChange={(e) => {
                      const newPages = editingUser.pages || [];
                      if (e.target.checked) newPages.push(page);
                      else {
                        const index = newPages.indexOf(page);
                        if (index > -1) newPages.splice(index, 1);
                      }
                      setEditingUser({ ...editingUser, pages: newPages });
                    }}
                    disabled={!isOwner}
                  />
                  {page}
                </label>
              ))}
            </div>

            <div className="modal-buttons">
              <button onClick={saveEdit} disabled={!isOwner}>
                Save
              </button>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingUser(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
