import React, { useState } from "react";
import './UserSettings.css';

const dummyUsers = [
  { id: 1, username: "alice", email: "alice@example.com", role: "Admin", active: true, password: "" },
  { id: 2, username: "bob", email: "bob@example.com", role: "Moderator", active: true, password: "" },
  { id: 3, username: "charlie", email: "charlie@example.com", role: "Viewer", active: false, password: "" },
];

const currentUserRole = "Admin"; // Simulate logged-in user role

export default function UserSettings() {
  const [users, setUsers] = useState(dummyUsers);

  // New user form state
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "Viewer",
    active: true,
  });

  if (currentUserRole !== "Admin") {
    return (
      <div className="usersettings-container">
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const changeRole = (id, newRole) => {
    setUsers(users.map(u => (u.id === id ? { ...u, role: newRole } : u)));
  };

  const toggleActive = (id) => {
    setUsers(users.map(u => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  const handlePasswordChange = (id, newPassword) => {
    setUsers(users.map(u => (u.id === id ? { ...u, password: newPassword } : u)));
  };

  const submitPasswordChange = (id) => {
    const user = users.find(u => u.id === id);
    if (user && user.password.trim() !== "") {
      alert(`Password for ${user.username} changed to: ${user.password}`);
      handlePasswordChange(id, "");
    } else {
      alert("Please enter a valid password.");
    }
  };

  // Handle new user input changes
  const handleNewUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Add new user to list
  const addNewUser = (e) => {
    e.preventDefault();

    if (!newUser.username.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      alert("Please fill out all fields for the new user.");
      return;
    }

    // Simple email validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(newUser.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const userToAdd = {
      id: newId,
      username: newUser.username.trim(),
      email: newUser.email.trim(),
      role: newUser.role,
      active: newUser.active,
      password: newUser.password.trim(),
    };

    setUsers([...users, userToAdd]);

    // Clear new user form
    setNewUser({
      username: "",
      email: "",
      password: "",
      role: "Viewer",
      active: true,
    });

    alert(`User ${userToAdd.username} added successfully.`);
  };

  return (
    <div className="usersettings-container">
      <h1>User / Staff Management</h1>
      <p>Assign roles, manage your server staff users, and change passwords here.</p>

      <table className="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Active</th>
            <th>Password (Admin only)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => changeRole(user.id, e.target.value)}
                >
                  <option>Admin</option>
                  <option>Moderator</option>
                  <option>Viewer</option>
                </select>
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={user.active}
                  onChange={() => toggleActive(user.id)}
                />
              </td>
              <td>
                <input
                  type="password"
                  placeholder="New Password"
                  value={user.password}
                  onChange={(e) => handlePasswordChange(user.id, e.target.value)}
                  className="password-input"
                />
              </td>
              <td>
                <button onClick={() => submitPasswordChange(user.id)}>Change Password</button>
                <button disabled style={{marginLeft: "10px"}}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={{ margin: "30px 0" }} />

      <h2>Add New User</h2>
      <form className="add-user-form" onSubmit={addNewUser}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={newUser.username}
            onChange={handleNewUserChange}
            required
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={newUser.email}
            onChange={handleNewUserChange}
            required
          />
        </label>

        <label>
          Password:
          <input
            type="password"
            name="password"
            value={newUser.password}
            onChange={handleNewUserChange}
            required
          />
        </label>

        <label>
          Role:
          <select
            name="role"
            value={newUser.role}
            onChange={handleNewUserChange}
          >
            <option>Admin</option>
            <option>Moderator</option>
            <option>Viewer</option>
          </select>
        </label>

        <label className="checkbox-label">
          Active:
          <input
            type="checkbox"
            name="active"
            checked={newUser.active}
            onChange={handleNewUserChange}
          />
        </label>

        <button type="submit" className="add-user-button">Add User</button>
      </form>
    </div>
  );
}
