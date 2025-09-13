"use client";

import { useUser } from "../../UserContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "./MyAccount.css";
import Subscriptions from "../subscriptions/subscriptions";
import Activity from "../activity/Activity"; // adjust based on actual folder


const TabButton = ({ label, active, onClick }: any) => (
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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    localStorage.clear();
    refresh();
    router.push("/auth/login");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("⚠️ Are you sure you want to permanently delete your account?")) return;
    await fetch("/api/account/delete", { method: "DELETE", credentials: "include" });
    localStorage.clear();
    refresh();
    router.push("/");
  };

  if (loading) return <div className="loading">Loading account...</div>;
  if (!authenticated || !user) return <div className="not-logged">Please log in to access your account.</div>;

  const avatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username || "User")}`;

  const tabs = ["profile", "security", "games", "backups", "activity", "subscription", "settings"];

  return (
    <div className="myaccount-container">
      <h1>⚙️ My Account</h1>

      <nav className="tabs" aria-label="Account navigation">
        {tabs.map((tab) => (
          <TabButton key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
        ))}
      </nav>

      {activeTab === "profile" && (
        <section className="profile-card">
          <img src={avatar} alt="User Avatar" className="avatar" />
          <div className="profile-details">
            <h2>{user.name || user.username}</h2>
            <p className="username">@{user.username}</p>
            <p className="email">{user.email}</p>
            <div className="meta">
              <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
              <span>Status: {user.active ? "Active ✅" : "Inactive ❌"}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </section>
      )}

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

      {activeTab === "games" && (
        <section className="card">
          <h3>🎮 Your Games</h3>
          {user.games?.length ? (
            <ul>{user.games.map((g: any) => <li key={g.id}>{g.title} — Level {g.level}</li>)}</ul>
          ) : (<p>No linked games.</p>)}
        </section>
      )}

      {activeTab === "backups" && (
        <section className="card">
          <h3>💾 Backups</h3>
          {user.backups?.length ? (
            <ul>
              {user.backups.map((b: any) => (
                <li key={b.id}>
                  {b.game} — {new Date(b.date).toLocaleString()}
                  <div className="backup-actions">
                    <button>Restore</button>
                    <button>Download</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (<p>No backups available.</p>)}
        </section>
      )}

      {/* ✅ Correct Activity Tab */}
      {activeTab === "activity" && <Activity />}

      {activeTab === "subscription" && <Subscriptions />}

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

      <section className="danger-zone">
        <h3>⚠️ Danger Zone</h3>
        <p>Deleting your account is permanent and cannot be undone.</p>
        <button className="delete-account-btn" onClick={handleDeleteAccount}>Delete My Account</button>
      </section>
    </div>
  );
};

export default MyAccount;
