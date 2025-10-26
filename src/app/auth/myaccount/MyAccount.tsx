"use client";

import React, { useState, useEffect, Suspense, lazy } from "react";
import "./MyAccount.css";
import Subscriptions from "../subscriptions/subscriptions";
import Activity from "../activity/Activity";
import MyTickets from "../../support/mytickets/MyTickets";
import WelcomePopup from "./welcome/welcome-popup";
import Users from "./subusers/Users";
import { getServerUrl } from "@/app/config";

const Settings = lazy(() => import("./settings/mySettings"));

const TabButton = ({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    className={`tab ${active ? "active" : ""} ${
      disabled ? "tab-disabled" : ""
    }`}
    onClick={disabled ? undefined : onClick}
    aria-current={active ? "page" : undefined}
    disabled={disabled}
  >
    {label}
  </button>
);

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("📊 Dashboard");
  const [user, setUser] = useState<any>(null);
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("modix_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        // Ensure roles array exists
        parsedUser.roles = parsedUser.roles || [parsedUser.role || "SubUser"];
        setUser(parsedUser);
        setShowWelcome(true);
      } catch {
        localStorage.removeItem("modix_user");
      }
    }
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("modix_token");
        const res = await fetch(`${getServerUrl()}/api/auth/logs`, {
          headers: { Authorization: token || "" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setUserLogs(data.logs || []);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      }
    };
    if (user) fetchLogs();
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch(`${getServerUrl()}/api/auth/logout`, { method: "POST" });
    } catch {}
    localStorage.removeItem("modix_user");
    localStorage.removeItem("modix_token");
    window.location.href = "/auth/login";
  };

  if (!user)
    return (
      <div className="not-logged">Please log in to access your account.</div>
    );

  const allTabs = [
    { label: "📊 Dashboard", roles: ["Owner", "SubUser", "Admin"] },
    { label: "🔐 Security", roles: ["Owner", "Admin"] },
    { label: "📜 Activity", roles: ["Owner", "SubUser", "Admin"] },
    { label: "🪪 Subscriptions", roles: ["Owner", "Admin"] },
    { label: "👥 Sub-Users", roles: ["Owner", "Admin"] },
    { label: "⚙️ Settings", roles: ["Owner", "Admin"] },
    { label: "🛠️ Support", roles: ["Owner", "SubUser", "Admin"] },
  ];

  const userRoles = user.roles || ["SubUser"];
  const hasRole = (tabRoles: string[]) =>
    tabRoles.some((r) => userRoles.includes(r));

  return (
    <div className="myaccount-container">
      <header className="account-header">
        <h1>⚙️ My Account</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </header>

      <nav className="tabs" aria-label="Account navigation">
        {allTabs.map((tab) => (
          <TabButton
            key={tab.label}
            label={tab.label}
            active={activeTab === tab.label}
            disabled={!hasRole(tab.roles)}
            onClick={() => setActiveTab(tab.label)}
          />
        ))}
      </nav>

      {activeTab === "📊 Dashboard" && (
        <>
          <section className="dashboard-user-info">
            {[
              { icon: "fas fa-user", label: "Username", value: user.username },
              {
                icon: "fas fa-envelope",
                label: "Email",
                value: user.email || "N/A",
              },
              {
                icon: "fas fa-circle",
                label: "Status",
                value: user.active ? "Active ✅" : "Inactive ❌",
                className: user.active ? "status-active" : "status-inactive",
              },
              {
                icon: "fas fa-calendar-plus",
                label: "Joined",
                value: new Date(user.created_at).toLocaleDateString(),
              },
              {
                icon: "fas fa-clock",
                label: "Last Login",
                value: user.last_login
                  ? new Date(user.last_login).toLocaleString()
                  : "N/A",
              },
            ].map((info, idx) => (
              <div key={idx} className="info-card">
                <i className={info.icon}></i>
                <div className="info-details">
                  <span className={`info-value ${info.className || ""}`}>
                    {info.value}
                  </span>
                  <span className="info-label">{info.label}</span>
                </div>
              </div>
            ))}
          </section>

          <section className="dashboard-row">
            <div className="dashboard-card">
              <h3>🛡️ Permissions</h3>
              <ul>
                {allTabs
                  .filter((tab) => hasRole(tab.roles))
                  .map((tab) => (
                    <li key={tab.label}>{tab.label}</li>
                  ))}
              </ul>
            </div>
          </section>

          <section className="dashboard-row">
            <div className="dashboard-card">
              <h3>📝 Last Logins (Past 7)</h3>
              {userLogs.length ? (
                <table className="login-history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>IP</th>
                      <th>Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userLogs.map((log, idx) => (
                      <tr key={idx}>
                        <td>{new Date(log.date).toLocaleString()}</td>
                        <td>{log.ip}</td>
                        <td>
                          <img
                            src={`https://flagcdn.com/24x18/${log.country_code.toLowerCase()}.png`}
                            alt={log.country_code}
                            title={log.country_code}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-logs">No recent logins.</p>
              )}
            </div>
          </section>
        </>
      )}

      {activeTab === "🔐 Security" && <div>Security Tab Content</div>}
      {activeTab === "📜 Activity" && <Activity />}
      {activeTab === "🪪 Subscriptions" && <Subscriptions />}
      {activeTab === "👥 Sub-Users" && hasRole(["Owner", "Admin"]) && <Users />}
      {activeTab === "⚙️ Settings" && hasRole(["Owner", "Admin"]) && (
        <Suspense fallback={<div>Loading Settings...</div>}>
          <Settings />
        </Suspense>
      )}
      {activeTab === "🛠️ Support" && <MyTickets />}

      {showWelcome && (
        <WelcomePopup
          username={user.username}
          logs={userLogs.slice(0, 5)}
          onClose={() => setShowWelcome(false)}
        />
      )}
    </div>
  );
};

export default MyAccount;
