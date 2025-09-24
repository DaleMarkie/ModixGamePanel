"use client";

import React, { useState, useEffect } from "react";
import { getServerUrl } from "@/app/config";
import "./Users.css";

export interface SubUser {
  id: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
}

const Users = () => {
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxSubUsers, setMaxSubUsers] = useState<number>(0);

  const fetchSubUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("modix_token");
      const res = await fetch(`${getServerUrl()}/api/subusers`, {
        headers: { Authorization: token || "" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSubUsers(data.subUsers || []);

      if (data.license_info && data.license_info.plan) {
        setMaxSubUsers(data.license_info.max_users || 1);
      }
    } catch (err) {
      console.error("Failed to fetch sub-users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubUsers();
  }, []);

  const handleAddSubUser = async () => {
    if (subUsers.length >= maxSubUsers) {
      alert(`You reached your plan limit (${maxSubUsers})!`);
      return;
    }

    const username = prompt("Enter username for new sub-user:");
    const email = prompt("Enter email for new sub-user:");
    if (!username || !email) return;

    try {
      const token = localStorage.getItem("modix_token");
      const res = await fetch(`${getServerUrl()}/api/subusers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token || "" },
        body: JSON.stringify({ username, email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSubUsers([...subUsers, data.subUser]);
    } catch (err: any) {
      alert("Failed to add sub-user: " + err.message);
    }
  };

  const handleEdit = async (id: string) => {
    const subUser = subUsers.find((u) => u.id === id);
    if (!subUser) return;
    const newEmail = prompt("Enter new email:", subUser.email);
    if (!newEmail) return;

    try {
      const token = localStorage.getItem("modix_token");
      const res = await fetch(`${getServerUrl()}/api/subusers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token || "" },
        body: JSON.stringify({ email: newEmail }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSubUsers(subUsers.map((u) => (u.id === id ? { ...u, email: newEmail } : u)));
    } catch (err: any) {
      alert("Failed to edit sub-user: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this sub-user?")) return;

    try {
      const token = localStorage.getItem("modix_token");
      const res = await fetch(`${getServerUrl()}/api/subusers/${id}`, {
        method: "DELETE",
        headers: { Authorization: token || "" },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSubUsers(subUsers.filter((u) => u.id !== id));
    } catch (err: any) {
      alert("Failed to delete sub-user: " + err.message);
    }
  };

  if (loading) return <div>Loading Sub-Users...</div>;

  return (
    <div className="subusers-container">
      <header className="users-header">
        <h2>👥 Sub-Users</h2>
        <button className="add-subuser-btn" onClick={handleAddSubUser}>
          + Add New Sub-User
        </button>
      </header>

      {subUsers.length === 0 ? (
        <p>No sub-users found.</p>
      ) : (
        <table className="subusers-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.active ? "Active ✅" : "Inactive ❌"}</td>
                <td>
                  <button onClick={() => handleEdit(user.id)}>Edit</button>
                  <button onClick={() => handleDelete(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="plan-info">
        Plan limit: {subUsers.length} / {maxSubUsers} sub-users used
      </p>
    </div>
  );
};

export default Users;
