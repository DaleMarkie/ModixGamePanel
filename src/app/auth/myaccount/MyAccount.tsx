"use client";

import { useState, useEffect } from "react";
import "./MyAccount.css";
import Subscriptions from "../subscriptions/subscriptions";
import Activity from "../activity/Activity";
import MyTickets from "../../support/mytickets/MyTickets";

const SERVER_URL = "https://7a3513ab76c3.ngrok-free.app/";

// ---------------- TAB BUTTON ----------------
const TabButton = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    className={`tab ${active ? "active" : ""}`}
    onClick={onClick}
    aria-current={active ? "page" : undefined}
  >
    {label}
  </button>
);

// ---------------- NEWS ITEM TYPE ----------------
interface NewsItem {
  title: string;
  description: string;
  date: string;
  link?: string;
}

// ---------------- MY ACCOUNT ----------------
const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("📊 Dashboard");
  const [user, setUser] = useState<any>(null);
  const [news, setNews] = useState<NewsItem[]>([]);

  // Settings tab states
  const [oldPassword, setOldPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [settingsMessageType, setSettingsMessageType] = useState<
    "success" | "error"
  >("success");
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("modix_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch news
  useEffect(() => {
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

  // Logout
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    localStorage.removeItem("modix_user");
    setUser(null);
    window.location.href = "/auth/login";
  };

  if (!user)
    return (
      <div className="not-logged">Please log in to access your account.</div>
    );

  const tabs = [
    "📊 Dashboard",
    "🔐 Security",
    "📜 Activity",
    "🪪 My License",
    "💳 Pricing",
    "⚙️ Settings",
    "⚙️ Support",
  ];

  return (
    <div className="myaccount-container">
      <h1>⚙️ My Account</h1>

      {/* ---------------- TABS ---------------- */}
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

      {/* ---------------- DASHBOARD ---------------- */}
      {activeTab === "📊 Dashboard" && (
        <section className="dashboard-card">
          <div className="dashboard-user-info">
            <h2>Welcome, {user.username}</h2>
            <p>Email: {user.email || "N/A"}</p>
            <p>Status: {user.active ? "Active ✅" : "Inactive ❌"}</p>
            <span>
              Joined: {new Date(user.created_at).toLocaleDateString()}
            </span>
            <p>Last Login: {new Date(user.last_login).toLocaleString()}</p>
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

      {/* ---------------- SECURITY ---------------- */}
      {activeTab === "🔐 Security" && (
        <section className="card">
          <h3>🔐 Security</h3>
          <ul>
            <li>2FA: {user.tfa_enabled ? "Enabled" : "Disabled"}</li>
            <li>Active Sessions: {user.sessions?.length || 0}</li>
          </ul>
          <button className="manage-sessions-btn">Manage Sessions</button>
        </section>
      )}

      {/* ---------------- ACTIVITY ---------------- */}
      {activeTab === "📜 Activity" && <Activity />}

      {/* ---------------- MY LICENSE ---------------- */}
      {activeTab === "🪪 My License" && <Subscriptions />}

      {/* ---------------- SETTINGS ---------------- */}
      {activeTab === "⚙️ Settings" && (
        <section className="card p-6 space-y-6">
          <h3 className="text-xl font-semibold mb-4">⚙️ Account Settings</h3>

          <form
            className="settings-form space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();

              if (!oldPassword.trim()) {
                setSettingsMessage("❌ Please enter your current password.");
                setSettingsMessageType("error");
                return;
              }

              if (!newUsername.trim() && !newPassword.trim()) {
                setSettingsMessage(
                  "❌ Enter a new username or password to update."
                );
                setSettingsMessageType("error");
                return;
              }

              setSettingsLoading(true);
              setSettingsMessage("⏳ Updating account...");
              setSettingsMessageType("info");

              try {
                const token = localStorage.getItem("modix_token");

                const res = await fetch(
                  `${SERVER_URL}/api/auth/update-account`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: token || "",
                    },
                    body: JSON.stringify({
                      old_password: oldPassword,
                      new_username: newUsername || undefined,
                      new_password: newPassword || undefined,
                    }),
                  }
                );

                const data = await res.json();

                if (data.success) {
                  setSettingsMessage("✅ Account updated successfully!");
                  setSettingsMessageType("success");

                  // Update user in state and localStorage
                  const updatedUser = {
                    ...user,
                    username: newUsername || user.username,
                  };
                  setUser(updatedUser);
                  localStorage.setItem(
                    "modix_user",
                    JSON.stringify(updatedUser)
                  );

                  // Reset form fields
                  setOldPassword("");
                  setNewUsername("");
                  setNewPassword("");
                } else {
                  setSettingsMessage(`❌ ${data.message}`);
                  setSettingsMessageType("error");
                }
              } catch (err) {
                console.error(err);
                setSettingsMessage(
                  "❌ Could not reach the server. Try again later."
                );
                setSettingsMessageType("error");
              } finally {
                setSettingsLoading(false);
              }
            }}
          >
            <div className="form-group flex flex-col">
              <label className="mb-1 font-medium">Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter your current password"
                required
                className="input-field"
              />
            </div>

            <div className="form-group flex flex-col">
              <label className="mb-1 font-medium">New Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder={user.username}
                className="input-field"
              />
            </div>

            <div className="form-group flex flex-col">
              <label className="mb-1 font-medium">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={settingsLoading}
              className={`w-full py-2 rounded-md font-medium transition-colors ${
                settingsLoading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {settingsLoading ? "Updating..." : "Update Account"}
            </button>

            {settingsMessage && (
              <p
                className={`mt-2 font-medium ${
                  settingsMessageType === "success"
                    ? "text-green-400"
                    : settingsMessageType === "error"
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
              >
                {settingsMessage}
              </p>
            )}
          </form>
        </section>
      )}

      {/* ---------------- SUPPORT ---------------- */}
      {activeTab === "⚙️ Support" && (
        <section className="card">
          <MyTickets />
        </section>
      )}
    </div>
  );
};

export default MyAccount;
