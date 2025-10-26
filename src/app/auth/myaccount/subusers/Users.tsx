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
}

const LOCAL_USERS_KEY = "modix_local_users";

const Users = () => {
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<SubUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
              role: u.account_type || "master",
              status: u.active ? "active" : "suspended",
              source: "server" as const,
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
    setEditingUser({ ...user }); // copy to avoid direct mutation
    setModalOpen(true);
  };

  const saveEdit = () => {
    if (!editingUser) return;

    if (editingUser.source === "local") {
      let users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
      users = users.map((u: any) =>
        u.username === editingUser.id
          ? {
              ...u,
              username: editingUser.username,
              email: editingUser.email,
              role: editingUser.role,
              status: editingUser.status,
              password: editingUser.password || u.password,
            }
          : u
      );
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      fetchSubUsers();
      setModalOpen(false);
      setEditingUser(null);
    } else {
      alert("Server users must be edited via backend.");
    }
  };

  const deleteUser = (user: SubUser) => {
    if (!window.confirm(`Delete user ${user.username}?`)) return;
    if (user.source === "local") {
      let users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
      users = users.filter((u: any) => u.username !== user.id);
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      fetchSubUsers();
    } else {
      alert("Server users must be deleted via backend.");
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="subusers-container">
      <header className="users-header">
        <h2>👥 Users</h2>
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
            })
          }
        >
          + Add User
        </button>
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
              <th>Source</th>
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
                <td>{user.source}</td>
                <td>
                  <button onClick={() => openEditModal(user)}>Edit</button>
                  <button onClick={() => deleteUser(user)}>Delete</button>
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
