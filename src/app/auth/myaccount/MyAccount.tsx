"use client";
import { useUser } from "../../UserContext";
import { useRouter } from "next/navigation";
import "./MyAccount.css";

const MyAccount = () => {
  const { user, loading, authenticated, refresh } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("user");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("auth_token");
      refresh();
      router.push("/auth/login");
    } catch (e) {
      alert("Logout failed. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "⚠️ Are you sure you want to DELETE your account? This action is irreversible and all your data will be permanently lost."
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(
          `Failed to delete account: ${errorData.message || res.statusText}`
        );
        return;
      }

      alert("Your account has been deleted. You will be logged out now.");
      // Logout user after deletion
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("user");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("auth_token");
      refresh();
      router.push("/");
    } catch (e) {
      alert("An error occurred while deleting your account. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="myaccount-container">
        <h1>My Account</h1>
        <div className="status-message">
          Loading your account information...
        </div>
      </div>
    );
  if (!authenticated || !user) {
    return (
      <div className="myaccount-container">
        <h1>My Account</h1>
        <div className="status-message not-logged-in">
          <p>You are not logged in.</p>
          <p>
            <a href="/auth/login" className="login-link">
              Log in
            </a>{" "}
            or{" "}
            <a href="/signup" className="signup-link">
              Sign up
            </a>{" "}
            to access your account.
          </p>
        </div>
      </div>
    );
  }

  const avatar =
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.name || user.username || "User"
    )}`;

  return (
    <div className="myaccount-container">
      <h1>My Account</h1>

      {/* Compact Profile Card */}
      <div className="profile-card">
        <img src={avatar} alt="Avatar" className="avatar" />
        <div className="profile-details">
          <h2>{user.name || user.username}</h2>
          <p className="username">@{user.username}</p>
          <p className="email">{user.email}</p>
          <div className="meta">
            <span>
              <strong>Status:</strong> {user.is_active ? "Active" : "Inactive"}
            </span>
            <span>
              <strong>ID:</strong> {user.id}
            </span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Log out
        </button>
      </div>

      {/* Roles and Permissions */}
      <div className="license-card">
        <h3>Roles & Permissions</h3>

        <div className="roles-section">
          <h4>Roles</h4>
          <ul className="roles-list">
            {user.roles && user.roles.length > 0 ? (
              user.roles.map((role) => <li key={role}>{role}</li>)
            ) : (
              <li>No roles assigned</li>
            )}
          </ul>
        </div>

        <div className="direct-permissions-section">
          <h4>Direct Permissions</h4>
          <ul className="direct-permissions-list">
            {user.direct_permissions && user.direct_permissions.length > 0 ? (
              user.direct_permissions.map((perm, idx) => (
                <li key={idx}>
                  {perm.permission} ({perm.value})
                  {perm.scope !== "global" && ` [${perm.scope}]`}
                  {perm.container_id && ` (Container: ${perm.container_id})`}
                </li>
              ))
            ) : (
              <li>No direct permissions</li>
            )}
          </ul>
        </div>

        <div className="role-permissions-section">
          <h4>Role Permissions</h4>
          <ul className="role-permissions-list">
            {user.role_permissions && user.role_permissions.length > 0 ? (
              user.role_permissions.map((perm, idx) => (
                <li key={idx}>
                  {perm.permission} ({perm.value})
                  {perm.scope !== "global" && ` [${perm.scope}]`}
                  {perm.container_id && ` (Container: ${perm.container_id})`}
                </li>
              ))
            ) : (
              <li>No role permissions</li>
            )}
          </ul>
        </div>
      </div>

      {/* Settings */}
      <div className="settings-card">
        <h3>⚙️ Profile Settings</h3>
        <form className="settings-form">
          <div className="form-group">
            <label>Name</label>
            <input type="text" defaultValue={user.name} />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input type="text" defaultValue={user.username} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" defaultValue={user.email} />
          </div>
          <button type="submit" className="save-btn">
            💾 Save
          </button>
        </form>

        {/* DELETE ACCOUNT */}
        <hr style={{ margin: "1.5rem 0", borderColor: "#bb1f1f" }} />
        <div className="delete-account-section">
          <h3 style={{ color: "#f44336" }}>⚠️ Delete Account</h3>
          <p style={{ color: "#f44336", marginBottom: "0.8rem" }}>
            Deleting your account is permanent and{" "}
            <strong>cannot be undone.</strong> All your data will be lost.
          </p>
          <button
            className="delete-account-btn"
            onClick={handleDeleteAccount}
            type="button"
          >
            🗑️ Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
