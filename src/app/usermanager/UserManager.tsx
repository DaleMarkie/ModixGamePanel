import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaPlus,
  FaTimes,
  FaSave,
  FaTrash,
  FaInfoCircle,
  FaLock,
  FaUnlockAlt,
} from "react-icons/fa";
import "./UserManager.css";

// Roles & descriptions
const ROLES = ["Owner", "Admin", "Moderator", "User"];

const ROLE_DESCRIPTIONS = {
  Owner: "Full control including user management and settings.",
  Admin: "Manage users and moderate content, but no owner settings.",
  Moderator: "Moderate content and assist users.",
  User: "Basic access with no admin permissions.",
};

// Example pages that roles/users can access
const ALL_PAGES = [
  { id: "dashboard", label: "Dashboard" },
  { id: "terminal", label: "Terminal" },
  { id: "filemanager", label: "File Manager" },
  { id: "modmanager", label: "Mod Manager" },
  { id: "settings", label: "Settings" },
  { id: "help", label: "Help" },
  { id: "webhooks", label: "Webhooks" },
];

// Default pages per role (for new users)
const DEFAULT_ROLE_PAGES = {
  Owner: ALL_PAGES.map((p) => p.id),
  Admin: [
    "dashboard",
    "terminal",
    "filemanager",
    "modmanager",
    "help",
    "webhooks",
  ],
  Moderator: ["dashboard", "help"],
  User: ["dashboard", "help"],
};

const UserManager = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "Owner",
      pages: DEFAULT_ROLE_PAGES.Owner,
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@example.com",
      role: "Admin",
      pages: DEFAULT_ROLE_PAGES.Admin,
    },
    {
      id: 3,
      name: "Cathy Brown",
      email: "cathy@example.com",
      role: "Moderator",
      pages: DEFAULT_ROLE_PAGES.Moderator,
    },
    {
      id: 4,
      name: "David Lee",
      email: "david@example.com",
      role: "User",
      pages: DEFAULT_ROLE_PAGES.User,
    },
  ]);

  const [addingUser, setAddingUser] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "User",
    pages: DEFAULT_ROLE_PAGES.User,
  });

  // Toggle Add User form
  const toggleAddUser = () => {
    setAddingUser(!addingUser);
    setForm({
      name: "",
      email: "",
      role: "User",
      pages: DEFAULT_ROLE_PAGES.User,
    });
  };

  // Handle text/select input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // When role changes, update pages to default for that role
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      pages: DEFAULT_ROLE_PAGES[form.role] || [],
    }));
  }, [form.role]);

  // Toggle page selection in form.pages
  const togglePage = (pageId) => {
    setForm((prev) => {
      const newPages = prev.pages.includes(pageId)
        ? prev.pages.filter((p) => p !== pageId)
        : [...prev.pages, pageId];
      return { ...prev, pages: newPages };
    });
  };

  // Add user
  const handleAddUser = () => {
    if (!form.name.trim() || !form.email.trim()) {
      alert("Please provide both Name and Email.");
      return;
    }
    setUsers((prevUsers) => [
      ...prevUsers,
      {
        id: Date.now(),
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        pages: form.pages,
      },
    ]);
    toggleAddUser();
  };

  // Delete user with checks
  const handleDeleteUser = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (user.role === "Owner") {
      const ownerCount = users.filter((u) => u.role === "Owner").length;
      if (ownerCount <= 1) {
        alert("Cannot delete the last Owner to prevent lockout.");
        return;
      }
    }

    if (window.confirm(`Remove user "${user.name}"?`)) {
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
    }
  };

  // Update user's role and reset pages to default for new role
  const handleRoleChange = (userId, newRole) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === userId
          ? { ...u, role: newRole, pages: DEFAULT_ROLE_PAGES[newRole] || [] }
          : u
      )
    );
  };

  // Toggle page access for existing user
  const toggleUserPageAccess = (userId, pageId) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === userId) {
          const hasPage = u.pages.includes(pageId);
          const newPages = hasPage
            ? u.pages.filter((p) => p !== pageId)
            : [...u.pages, pageId];
          return { ...u, pages: newPages };
        }
        return u;
      })
    );
  };

  // Group users by role
  const usersByRole = ROLES.reduce((acc, role) => {
    acc[role] = users.filter((u) => u.role === role);
    return acc;
  }, {});

  return (
    <main
      className="user-manager-wrapper"
      style={{ maxWidth: 900, margin: "auto" }}
    >
      <header
        className="header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1>
          <FaUsers aria-hidden="true" /> User Management
        </h1>
        <button
          className="btn add-new"
          onClick={toggleAddUser}
          aria-expanded={addingUser}
          aria-controls="add-user-section"
          aria-label={addingUser ? "Cancel adding new user" : "Add new user"}
          type="button"
          style={{ fontSize: 16, padding: "6px 12px" }}
        >
          {addingUser ? (
            <>
              <FaTimes aria-hidden="true" /> Cancel
            </>
          ) : (
            <>
              <FaPlus aria-hidden="true" /> Add New User
            </>
          )}
        </button>
      </header>

      <p
        className="page-description"
        style={{ marginBottom: 24, fontSize: 14, color: "#aaa" }}
      >
        Add users and assign roles. Customize which pages each user can access.
      </p>

      {addingUser && (
        <section
          id="add-user-section"
          aria-label="Add new user form"
          style={{
            marginBottom: 40,
            padding: 16,
            border: "1px solid #333",
            borderRadius: 6,
            backgroundColor: "#1f1f1f",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <label
              htmlFor="name-input"
              style={{ display: "block", marginBottom: 6 }}
            >
              Full Name{" "}
              <span aria-hidden="true" style={{ color: "#f00" }}>
                *
              </span>
            </label>
            <input
              id="name-input"
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              autoFocus
              required
              style={{
                width: "100%",
                padding: 8,
                fontSize: 16,
                borderRadius: 4,
                border: "1px solid #444",
                backgroundColor: "#222",
                color: "#eee",
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label
              htmlFor="email-input"
              style={{ display: "block", marginBottom: 6 }}
            >
              Email Address{" "}
              <span aria-hidden="true" style={{ color: "#f00" }}>
                *
              </span>
            </label>
            <input
              id="email-input"
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: 8,
                fontSize: 16,
                borderRadius: 4,
                border: "1px solid #444",
                backgroundColor: "#222",
                color: "#eee",
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label
              htmlFor="role-select"
              style={{ display: "block", marginBottom: 6 }}
            >
              Role
            </label>
            <select
              id="role-select"
              name="role"
              value={form.role}
              onChange={handleChange}
              aria-describedby="role-desc"
              style={{
                width: "100%",
                padding: 8,
                fontSize: 16,
                borderRadius: 4,
                border: "1px solid #444",
                backgroundColor: "#222",
                color: "#eee",
              }}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <p
              id="role-desc"
              className="role-description"
              style={{
                fontSize: 13,
                color: "#bbb",
                marginTop: 6,
                display: "flex",
                alignItems: "center",
              }}
            >
              <FaInfoCircle aria-hidden="true" style={{ marginRight: 6 }} />{" "}
              {ROLE_DESCRIPTIONS[form.role]}
            </p>
          </div>

          <fieldset
            style={{
              border: "1px solid #444",
              padding: 12,
              borderRadius: 6,
              marginBottom: 16,
            }}
            aria-label="Select pages user can access"
          >
            <legend
              style={{
                marginBottom: 8,
                fontWeight: "bold",
                fontSize: 14,
                color: "#ddd",
              }}
            >
              Select Pages Access <FaLock aria-hidden="true" />
            </legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {ALL_PAGES.map(({ id, label }) => (
                <label
                  key={id}
                  htmlFor={`page-${id}`}
                  style={{
                    cursor: "pointer",
                    backgroundColor: form.pages.includes(id)
                      ? "#4a90e2"
                      : "#333",
                    padding: "6px 12px",
                    borderRadius: 20,
                    userSelect: "none",
                    color: form.pages.includes(id) ? "#fff" : "#ccc",
                    fontSize: 14,
                    transition: "background-color 0.3s",
                  }}
                >
                  <input
                    type="checkbox"
                    id={`page-${id}`}
                    checked={form.pages.includes(id)}
                    onChange={() => togglePage(id)}
                    style={{ display: "none" }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <button
            className="btn save"
            onClick={handleAddUser}
            type="button"
            style={{ padding: "8px 16px", fontSize: 16, cursor: "pointer" }}
          >
            <FaSave aria-hidden="true" /> Save User
          </button>
        </section>
      )}

      {/* Users grouped by roles */}
      {ROLES.map((role) => (
        <section
          key={role}
          className="user-list"
          aria-label={`${role} users`}
          style={{ marginBottom: 40 }}
        >
          <h2
            style={{
              borderBottom: "1px solid #444",
              paddingBottom: 8,
              marginBottom: 16,
            }}
          >
            {role}s
          </h2>
          {usersByRole[role].length === 0 ? (
            <p className="empty-msg" style={{ color: "#666" }}>
              No {role.toLowerCase()}s found.
            </p>
          ) : (
            <div
              className="user-cards-container"
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              {usersByRole[role].map(({ id, name, email, role, pages }) => (
                <article
                  key={id}
                  className="user-card"
                  tabIndex={0}
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    backgroundColor: "#222",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "0 0 10px #111",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, marginBottom: 6 }}>{name}</h3>
                    <p style={{ margin: 0, marginBottom: 12, color: "#aaa" }}>
                      {email}
                    </p>

                    <label
                      htmlFor={`role-select-${id}`}
                      className="role-label"
                      style={{
                        display: "block",
                        marginBottom: 6,
                        fontWeight: "bold",
                      }}
                    >
                      Role
                    </label>
                    <select
                      id={`role-select-${id}`}
                      className="role-select-inline"
                      value={role}
                      onChange={(e) => handleRoleChange(id, e.target.value)}
                      aria-describedby={`role-desc-${id}`}
                      style={{
                        width: 150,
                        padding: 6,
                        fontSize: 14,
                        borderRadius: 4,
                        border: "1px solid #444",
                        backgroundColor: "#222",
                        color: "#eee",
                        marginBottom: 6,
                      }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <p
                      id={`role-desc-${id}`}
                      className="role-description small"
                      style={{
                        fontSize: 12,
                        color: "#bbb",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 12,
                      }}
                    >
                      <FaInfoCircle aria-hidden="true" />{" "}
                      {ROLE_DESCRIPTIONS[role]}
                    </p>

                    <fieldset
                      style={{
                        border: "1px solid #444",
                        padding: 10,
                        borderRadius: 6,
                        maxWidth: 400,
                      }}
                      aria-label={`Pages access for ${name}`}
                    >
                      <legend
                        style={{
                          fontWeight: "bold",
                          fontSize: 13,
                          color: "#ddd",
                          marginBottom: 6,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        Accessible Pages <FaUnlockAlt aria-hidden="true" />
                      </legend>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 10 }}
                      >
                        {ALL_PAGES.map(({ id: pageId, label }) => {
                          const hasAccess = pages.includes(pageId);
                          return (
                            <label
                              key={pageId}
                              htmlFor={`user-${id}-page-${pageId}`}
                              style={{
                                cursor: "pointer",
                                backgroundColor: hasAccess ? "#3a95f7" : "#444",
                                padding: "4px 10px",
                                borderRadius: 20,
                                userSelect: "none",
                                color: hasAccess ? "#fff" : "#ccc",
                                fontSize: 12,
                                transition: "background-color 0.3s",
                              }}
                            >
                              <input
                                type="checkbox"
                                id={`user-${id}-page-${pageId}`}
                                checked={hasAccess}
                                onChange={() =>
                                  toggleUserPageAccess(id, pageId)
                                }
                                style={{ display: "none" }}
                              />
                              {label}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  </div>

                  <button
                    className="btn btn-delete"
                    onClick={() => handleDeleteUser(id)}
                    aria-label={`Remove user ${name}`}
                    type="button"
                    title="Remove User"
                    style={{
                      backgroundColor: "#b83232",
                      border: "none",
                      borderRadius: 6,
                      color: "#fff",
                      fontSize: 18,
                      cursor: "pointer",
                      padding: "8px 12px",
                      marginLeft: 20,
                      alignSelf: "flex-start",
                      height: 40,
                      transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#d9534f")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#b83232")
                    }
                  >
                    <FaTrash aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      ))}
    </main>
  );
};

export default UserManager;
