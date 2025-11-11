"use client";

import React, { useEffect, useState } from "react";
import { getServerUrl } from "@/app/config";
import "./Users.css";

export interface SubUser {
  id: string;
  username: string;
  email?: string;
  role: "Owner" | "Admin" | "SubUser";
  status: "active" | "suspended" | "banned";
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
              status: u.active ? "active" : "suspended",
              source: "server" as const,
              pages: u.pages || [],
            }));
          }
        }
      } catch {}

      let localUsers: SubUser[] = [];
      try {
        const savedUsers = JSON.parse(
          localStorage.getItem(LOCAL_USERS_KEY) || "[]"
        );
        localUsers = savedUsers.map((u: any) => ({
          id: u.username,
          username: u.username,
          email: u.email,
          role: u.role || "SubUser",
          status: u.status || "active",
          source: "local",
          password: u.password,
          pages: u.pages || [],
        }));
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

  const saveEdit = async () => {
    if (!editingUser) return;

    // Local user save
    if (editingUser.source === "local") {
      if (!isOwner && editingUser.role === "Owner") {
        alert("Only the Owner can assign Owner role.");
        return;
      }

      let users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
      if (editingUser.id) {
        users = users.map((u: any) =>
          u.username === editingUser.id ? { ...u, ...editingUser } : u
        );
      } else {
        users.push({ ...editingUser, id: editingUser.username });
      }
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      setSubUsers(users);

      // Sync pages to backend if Owner
      if (isOwner) {
        try {
          await fetch(`${getServerUrl()}/api/update_pages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              target_username: editingUser.username,
              pages: editingUser.pages || [],
              requester: currentUser?.username,
            }),
          });
        } catch (err) {
          console.error("Failed to update pages on backend:", err);
        }
      }

      setModalOpen(false);
      setEditingUser(null);
    } else {
      alert("Server users must be edited via backend.");
    }
  };

  const deleteUser = (user: SubUser) => {
    if (!window.confirm(`Delete user ${user.username}?`)) return;
    if (user.source === "local") {
      if (!isOwner && user.role === "Owner") {
        alert("Only the Owner can delete another Owner.");
        return;
      }
      let users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
      users = users.filter((u: any) => u.username !== user.id);
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      setSubUsers(users);
    } else {
      alert("Server users must be deleted via backend.");
    }
  };

  if (loading) return <div>Loading users...</div>;

  // ✅ Full list of all pages in Modix
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

  return (
    <div className="subusers-container">
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
                status: "active",
                source: "local",
                pages: [],
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
              <th>Status</th>
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
                <td>{user.status}</td>
                <td>{(user.pages || []).join(", ") || "-"}</td>
                <td>
                  {isOwner || currentUser?.username === user.username ? (
                    <>
                      <button onClick={() => openEditModal(user)}>Edit</button>
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

            <label>Status</label>
            <select
              value={editingUser.status}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  status: e.target.value as any,
                })
              }
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
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
                      if (e.target.checked) {
                        newPages.push(page);
                      } else {
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
              <button onClick={saveEdit}>Save</button>
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
