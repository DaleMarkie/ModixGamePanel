"use client";

import React, { useEffect, useState } from "react";
import { getServerUrl } from "@/app/config";
import "./Users.css";

export interface SubUser {
  id: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
  source: "server" | "local";
}

const Users = () => {
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("modix_token");

      // 1️⃣ Fetch server users
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
              active: u.active,
              source: "server" as const,
            }));
          }
        }
      } catch (err) {
        console.warn("Server users not available, using local only", err);
      }

      // 2️⃣ Get local staff users
      let localStaff: SubUser[] = [];
      try {
        const savedStaff = JSON.parse(
          localStorage.getItem("local_staff") || "[]"
        );
        localStaff = savedStaff.map((u: any) => ({
          id: u.username,
          username: u.username,
          email: u.email,
          role: "staff",
          active: true,
          source: "local" as const,
        }));
      } catch (err) {
        console.error("Failed to parse local staff users", err);
      }

      // 3️⃣ Merge and update state
      setSubUsers([...serverUsers, ...localStaff]);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubUsers();
  }, []);

  const handleAddStaffUser = () => {
    const username = prompt("Enter username for new staff user:");
    const email = prompt("Enter email for new staff user:");
    const password = prompt("Enter password for new staff user:");
    if (!username || !email || !password) return;

    // Save locally
    const staffUser = { username, email, password, account_type: "staff" };
    let localStaff = JSON.parse(localStorage.getItem("local_staff") || "[]");
    localStaff.push(staffUser);
    localStorage.setItem("local_staff", JSON.stringify(localStaff));

    // Refresh table
    fetchSubUsers();
  };

  const handleEdit = (id: string) => {
    const user = subUsers.find((u) => u.id === id);
    if (!user) return;

    if (user.source === "local") {
      const newEmail = prompt("Enter new email:", user.email);
      const newPassword =
        prompt("Enter new password (leave blank to keep same):") || undefined;
      if (!newEmail && !newPassword) return;

      // Update local storage
      let localStaff = JSON.parse(localStorage.getItem("local_staff") || "[]");
      localStaff = localStaff.map((u: any) =>
        u.username === id
          ? {
              ...u,
              email: newEmail || u.email,
              password: newPassword || u.password,
            }
          : u
      );
      localStorage.setItem("local_staff", JSON.stringify(localStaff));

      fetchSubUsers();
    } else {
      alert("Server users must be edited via backend (not implemented here).");
    }
  };

  const handleDelete = (id: string) => {
    const user = subUsers.find((u) => u.id === id);
    if (!user) return;
    if (!window.confirm(`Are you sure you want to delete ${user.username}?`))
      return;

    if (user.source === "local") {
      let localStaff = JSON.parse(localStorage.getItem("local_staff") || "[]");
      localStaff = localStaff.filter((u: any) => u.username !== id);
      localStorage.setItem("local_staff", JSON.stringify(localStaff));
      fetchSubUsers();
    } else {
      alert("Server users must be deleted via backend (not implemented here).");
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="subusers-container">
      <header className="users-header">
        <h2>👥 Users</h2>
        <button className="add-subuser-btn" onClick={handleAddStaffUser}>
          + Add Staff User
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
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.active ? "Active ✅" : "Inactive ❌"}</td>
                <td>{user.source}</td>
                <td>
                  <button onClick={() => handleEdit(user.id)}>Edit</button>
                  <button onClick={() => handleDelete(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Users;
