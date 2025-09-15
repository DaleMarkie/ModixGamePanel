"use client";

import { useUser } from "../../UserContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "./MyAccount.css";
import Subscriptions from "../subscriptions/subscriptions";
import Activity from "../activity/Activity"; // adjust path

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

  const [activeTab, setActiveTab] = useState("dashboard");
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    // fetch news/change logs from backend
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/dashboard/news");
        if (res.ok) {
          const data = await res.json();
          setNews(data.news || []);
        }
      } catch (err) {
        console.error("Failed to fetch news", err);
      }
    };
    fetchNews();
  }, []);

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

  const tabs = [
    "dashboard",
    "security",
    "activity",
    "subscription",
    "settings",
  ];

  return (
    <div className="myaccount-container">
      <h1>⚙️ My Account</h1>

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

      {/* ================== USER DASHBOARD ================== */}
      {activeTab === "dashboard" && (
        <section className="dashboard-card">
          <div className="dashboard-user-info">
            <h2>Welcome, {user.username}</h2>
            <p>Email: {user.email}</p>
            <p>Status: {user.active ? "Active ✅" : "Inactive ❌"}</p>
            <span>
              Joined: {new Date(user.created_at).toLocaleDateString()}
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Log Out
            </button>
          </div>

          <div className="dashboard-news">
            <h3>📢 Latest Announcements & Change Logs</h3>
            {news.length ? (
              <div className="news-cards">
                {news.map((item, idx) => (
                  <div key={idx} className="news-card">
                    <div className="news-header">
                      <strong className="news-title">{item.title}</strong>
                      <span className="news-date">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="news-body">
                      <p>{item.description}</p>
                    </div>
                    {item.link && (
                      <div className="news-footer">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="news-link"
                        >
                          Read More
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-news">
                <p>No news or updates available.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================== SECURITY ================== */}
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

      {/* ================== ACTIVITY ================== */}
      {activeTab === "activity" && <Activity />}

      {/* ================== SUBSCRIPTIONS ================== */}
      {activeTab === "subscription" && <Subscriptions />}

      {/* ================== SETTINGS ================== */}
      {activeTab === "settings" && (
        <section className="card">
          <h3>⚙️ Settings</h3>
          <form
            className="settings-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);

              const username = formData.get("username") as string;
              const email = formData.get("email") as string;
              const oldPassword = formData.get("oldPassword") as string;
              const newPassword = formData.get("newPassword") as string;
              const confirmPassword = formData.get("confirmPassword") as string;

              // If changing password, validate old + confirm
              if (newPassword) {
                if (!oldPassword) {
                  alert(
                    "❌ You must enter your current password to set a new password."
                  );
                  return;
                }
                if (!confirmPassword) {
                  alert("❌ You must confirm your new password.");
                  return;
                }
                if (newPassword !== confirmPassword) {
                  alert("❌ New passwords do not match!");
                  return;
                }
              }

              // Build payload
              const payload: any = { username, email };
              if (newPassword) {
                payload.oldPassword = oldPassword;
                payload.newPassword = newPassword;
              }

              try {
                const res = await fetch("/api/modix/users/update", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify(payload),
                });

                const result = await res.json();
                if (res.ok && result.success) {
                  alert("✅ Account updated successfully!");
                  refresh();
                } else {
                  alert(
                    "❌ Failed to update: " +
                      (result.message || "Unknown error")
                  );
                }
              } catch (err) {
                alert(
                  "❌ Failed to update: " + (err as any).message ||
                    "Unknown error"
                );
              }
            }}
          >
            <label>
              Username
              <input
                type="text"
                name="username"
                defaultValue={user.username || ""}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                defaultValue={user.email || ""}
                required
              />
            </label>

            <hr />

            <label>
              Current Password
              <input
                type="password"
                name="oldPassword"
                placeholder="Enter current password to change it"
              />
            </label>

            <label>
              New Password
              <input
                type="password"
                name="newPassword"
                placeholder="••••••••"
              />
            </label>

            <label>
              Confirm New Password
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
              />
            </label>

            <button className="save-btn" type="submit">
              Save Changes
            </button>
          </form>
        </section>
      )}

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
