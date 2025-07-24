"use client";
import { useUser } from "../../UserContext";
import { useRouter } from "next/navigation";

const MyAccount = () => {

  const { user, loading, authenticated, refresh } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call backend logout to clear both access and refresh cookies
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      // Remove user and any other auth info from localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("auth_token");
      refresh();
      router.push("/auth/login");
    } catch (e) {
      alert("Logout failed. Please try again.");
    }
  };

  if (loading) return <div className="myaccount-container"><h1>My Account</h1><div className="status-message">Loading your account information...</div></div>;
  if (!authenticated || !user) {
    return (
      <div className="myaccount-container">
        <h1>My Account</h1>
        <div className="status-message not-logged-in">
          <p>You are not logged in.</p>
          <p>
            <a href="/auth/login" className="login-link">Log in</a> or <a href="/signup" className="signup-link">Sign up</a> to access your account.
          </p>
        </div>
      </div>
    );
  }


  // Placeholder avatar if none
  const avatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username || "User")}`;


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
        <button className="logout-btn" onClick={handleLogout}>Log out</button>
      </div>

      {/* Roles and Permissions */}
      <div className="license-card">
        <h3>Roles</h3>
        <ul>
          {user.roles && user.roles.length > 0 ? (
            user.roles.map((role: string) => <li key={role}>{role}</li>)
          ) : (
            <li>No roles assigned</li>
          )}
        </ul>
        <h3>Direct Permissions</h3>
        <ul>
          {user.direct_permissions && user.direct_permissions.length > 0 ? (
            user.direct_permissions.map((perm: any, idx: number) => (
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
        <h3>Role Permissions</h3>
        <ul>
          {user.role_permissions && user.role_permissions.length > 0 ? (
            user.role_permissions.map((perm: any, idx: number) => (
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

      {/* Settings (optional, can be expanded) */}
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
      </div>

      <style jsx>{`
        .status-message {
          text-align: center;
          margin: 2rem 0;
          color: #bbb;
          font-size: 1rem;
        }
        .not-logged-in {
          color: #ff7875;
        }
        .login-link, .signup-link {
          color: #13c2c2;
          text-decoration: underline;
          margin: 0 0.5rem;
        }
        .login-link:hover, .signup-link:hover {
          color: #40a9ff;
        }
        .myaccount-container {
          padding: 2rem;
          max-width: 1000px;
          margin: 0 auto;
          font-family: "Inter", sans-serif;
          color: #e3e3e3;
          font-size: 0.75rem;
        }

        h1 {
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          color: #b5f5ec;
          text-align: center;
        }

        .profile-card,
        .license-card,
        .settings-card {
          background: rgba(30, 30, 30, 0.95);
          border-radius: 16px;
          padding: 1.2rem;
          margin-bottom: 1.2rem;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          border: 1px solid #2d2d2d;
        }

        .profile-card {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
        }

        .profile-details h2 {
          font-size: 0.95rem;
          margin: 0;
        }

        .username,
        .email {
          font-size: 0.7rem;
          color: #bbb;
          margin-top: 0.2rem;
        }

        .meta {
          margin-top: 0.6rem;
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 0.7rem;
        }

        .delete-btn {
          background: #ff4d4f;
          border: none;
          padding: 0.4rem 0.8rem;
          color: #fff;
          border-radius: 8px;
          font-size: 0.7rem;
          cursor: pointer;
          margin-left: auto;
        }

        .logout-btn {
          background: #ff7875;
          border: none;
          padding: 0.4rem 0.8rem;
          color: #fff;
          border-radius: 8px;
          font-size: 0.7rem;
          cursor: pointer;
          margin-left: auto;
        }
        .logout-btn:hover {
          background: #d9363e;
        }

        /* Epic License Section */
        .license-card h4 {
          font-size: 0.9rem;
          margin: 0;
          color: #ffd666;
        }

        .license-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.8rem;
        }

        .license-tier {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .tier-icon {
          font-size: 1.2rem;
        }

        .license-status {
          font-size: 0.7rem;
          color: #aaa;
        }

        .badge {
          padding: 0.3rem 0.6rem;
          font-size: 0.65rem;
          border-radius: 6px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge.active {
          background: #092b00;
          color: #52c41a;
          border: 1px solid #52c41a;
        }

        .badge.expired {
          background: #2a0708;
          color: #ff4d4f;
          border: 1px solid #ff4d4f;
        }

        .progress-wrapper {
          margin-bottom: 0.8rem;
        }

        .progress-bar {
          background: #2d2d2d;
          height: 6px;
          border-radius: 6px;
          overflow: hidden;
        }

        .progress {
          height: 100%;
          background: linear-gradient(90deg, #13c2c2, #52c41a);
          transition: width 0.5s ease;
        }

        .remaining-time {
          font-size: 0.65rem;
          color: #999;
          margin-top: 0.3rem;
        }

        .license-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
        }

        .license-meta div span {
          color: #888;
          display: block;
        }

        .license-meta div p {
          margin: 0.2rem 0 0;
        }

        .settings-card h3 {
          font-size: 0.85rem;
          margin-bottom: 1rem;
          color: #91d5ff;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 0.3rem;
          font-size: 0.7rem;
          color: #aaa;
        }

        .form-group input {
          padding: 0.4rem 0.6rem;
          background: #1c1c1c;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          font-size: 0.75rem;
        }

        .form-group input:focus {
          border-color: #40a9ff;
          outline: none;
        }

        .save-btn {
          align-self: flex-start;
          background: #13c2c2;
          color: #121212;
          border: none;
          padding: 0.45rem 1rem;
          font-size: 0.7rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 0.4rem;
        }

        .save-btn:hover {
          background: #08979c;
        }

        @media (max-width: 500px) {
          .profile-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .delete-btn {
            margin-left: 0;
            margin-top: 0.6rem;
          }

          .license-meta {
            flex-direction: column;
            gap: 0.4rem;
          }
        }
      `}</style>
    </div>
  );
}

export default MyAccount;
