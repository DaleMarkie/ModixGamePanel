"use client";
import { useUser } from "../../UserContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "./MyAccount.css";

const MyAccount = () => {
  const { user, loading, authenticated, refresh } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState("profile");
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    if (authenticated) {
      fetch("/api/account/activity", { credentials: "include" })
        .then((res) => res.json())
        .then(setActivity)
        .catch(() => setActivity([]));
    }
  }, [authenticated]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    localStorage.clear();
    refresh();
    router.push("/auth/login");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("⚠️ Really delete your account? This is permanent.")) return;
    await fetch("/api/account/delete", {
      method: "DELETE",
      credentials: "include",
    });
    localStorage.clear();
    refresh();
    router.push("/");
  };

  if (loading) return <div className="loading">Loading account...</div>;
  if (!authenticated || !user)
    return <div className="not-logged">Please log in first.</div>;

  const avatar =
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.name || user.username || "User"
    )}`;

  return (
    <div className="myaccount-container">
      <h1>⚙️ My Account</h1>

      {/* Navigation Tabs */}
      <div className="tabs">
        {[
          "profile",
          "security",
          "games",
          "backups",
          "activity",
          "subscription",
          "settings",
        ].map((t) => (
          <button
            key={t}
            className={tab === t ? "tab active" : "tab"}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === "profile" && (
        <div className="profile-card">
          <img src={avatar} alt="Avatar" className="avatar" />
          <div className="profile-details">
            <h2>{user.name || user.username}</h2>
            <p className="username">@{user.username}</p>
            <p className="email">{user.email}</p>
            <div className="meta">
              <span>
                Joined: {new Date(user.created_at).toLocaleDateString()}
              </span>
              <span>Status: {user.active ? "Active ✅" : "Inactive ❌"}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}

      {/* Security Tab */}
      {tab === "security" && (
        <div className="card">
          <h3>🔐 Security</h3>
          <ul>
            <li>2FA: {user.tfa_enabled ? "Enabled" : "Disabled"}</li>
            <li>Last Login: {user.last_login}</li>
            <li>Active Sessions: {user.sessions?.length || 0}</li>
          </ul>
          <button>Manage Sessions</button>
        </div>
      )}

      {/* Games Tab */}
      {tab === "games" && (
        <div className="card">
          <h3>🎮 Your Games</h3>
          {user.games?.length ? (
            <ul>
              {user.games.map((g) => (
                <li key={g.id}>
                  {g.title} — Level {g.level}
                </li>
              ))}
            </ul>
          ) : (
            <p>No games linked yet.</p>
          )}
        </div>
      )}

      {/* Backups Tab */}
      {tab === "backups" && (
        <div className="card">
          <h3>💾 Backups</h3>
          {user.backups?.length ? (
            <ul>
              {user.backups.map((b) => (
                <li key={b.id}>
                  {b.game} — {new Date(b.date).toLocaleString()}
                  <div className="backup-actions">
                    <button>Restore</button>
                    <button>Download</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No backups available.</p>
          )}
        </div>
      )}

      {/* Activity Tab */}
      {tab === "activity" && (
        <div className="card">
          <h3>📜 Recent Activity</h3>
          {activity.length ? (
            <ul>
              {activity.map((a, i) => (
                <li key={i}>
                  {a.action} — {new Date(a.timestamp).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent activity.</p>
          )}
        </div>
      )}

      {/* Subscription Tab */}
      {tab === "subscription" && (
        <div className="card subscription-card">
          <h3>📦 Subscription</h3>
          <p>
            <strong>Plan:</strong> Personal Use License
          </p>
          <p>
            <strong>Status:</strong> Active ✅
          </p>
          <p>
            All users currently have access under a{" "}
            <em>Personal Use License</em>. This license allows unlimited use of
            the service for non-commercial purposes.
          </p>
          <div className="sub-actions">
            <button disabled className="upgrade-btn">
              Upgrade (Coming Soon)
            </button>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {tab === "settings" && (
        <div className="card">
          <h3>⚙️ Settings</h3>
          <form className="settings-form">
            <label>
              Display Name
              <input type="text" defaultValue={user.name || ""} />
            </label>
            <label>
              Email
              <input type="email" defaultValue={user.email || ""} />
            </label>
            <button className="save-btn">Save</button>
          </form>
        </div>
      )}

      {/* Danger Zone */}
      <div className="danger-zone">
        <h3>⚠️ Danger Zone</h3>
        <p>Deleting your account is permanent. This action cannot be undone.</p>
        <button className="delete-account-btn" onClick={handleDeleteAccount}>
          Delete My Account
        </button>
      </div>
    </div>
  );
};

export default MyAccount;
