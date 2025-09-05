"use client";

import { useUser } from "../../UserContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "./MyAccount.css";

// Reusable Tab Button Component
const TabButton = ({ label, active, onClick }) => (
  <button
    className={`tab ${active ? "active" : ""}`}
    onClick={onClick}
    aria-current={active ? "page" : undefined}
  >
    {label.charAt(0).toUpperCase() + label.slice(1)}
  </button>
);

const MyAccount = () => {
  const { user, loading, authenticated, refresh } = useUser();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile");
  const [activity, setActivity] = useState([]);

  // Fetch user activity
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
    if (
      !confirm("⚠️ Are you sure you want to permanently delete your account?")
    )
      return;
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
    return (
      <div className="not-logged">Please log in to access your account.</div>
    );

  const avatar =
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.name || user.username || "User"
    )}`;

  const tabs = [
    "profile",
    "security",
    "games",
    "backups",
    "activity",
    "subscription",
    "settings",
  ];

  return (
    <div className="myaccount-container">
      <h1>⚙️ My Account</h1>

      {/* Navigation Tabs */}
      <nav className="tabs" aria-label="Account navigation">
        {tabs.map((tab) => (
          <TabButton
            key={tab}
            label={tab}
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          />
        ))}
      </nav>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <section className="profile-card">
          <img src={avatar} alt="User Avatar" className="avatar" />
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
            Log Out
          </button>
        </section>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <section className="card">
          <h3>🔐 Security</h3>
          <ul>
            <li>2FA: {user.tfa_enabled ? "Enabled" : "Disabled"}</li>
            <li>Last Login: {new Date(user.last_login).toLocaleString()}</li>
            <li>Active Sessions: {user.sessions?.length || 0}</li>
          </ul>
          <button className="manage-sessions-btn">Manage Sessions</button>
        </section>
      )}

      {/* Games Tab */}
      {activeTab === "games" && (
        <section className="card">
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
            <p>No linked games.</p>
          )}
        </section>
      )}

      {/* Backups Tab */}
      {activeTab === "backups" && (
        <section className="card">
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
        </section>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <section className="card">
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
        </section>
      )}

      {/* Subscription Tab */}
      {activeTab === "subscription" && (
        <section className="card subscription-card">
          <h3>📦 Subscription</h3>
          <p>
            <strong>Plan:</strong> Personal Use License
          </p>
          <p>
            <strong>Status:</strong> Active ✅
          </p>
          <p>
            This license allows unlimited non-commercial use of the service.
          </p>
          <div className="sub-actions">
            <button className="upgrade-btn" disabled>
              Upgrade (Coming Soon)
            </button>
          </div>
        </section>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <section className="card">
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
            <button className="save-btn">Save Changes</button>
          </form>
        </section>
      )}

      {/* Danger Zone */}
      <section className="danger-zone">
        <h3>⚠️ Danger Zone</h3>
        <p>Deleting your account is permanent and cannot be undone.</p>
        <button className="delete-account-btn" onClick={handleDeleteAccount}>
          Delete My Account
        </button>
      </section>
    </div>
  );
};

export default MyAccount;
