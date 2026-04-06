"use client";

import React, { useState, useEffect, Suspense, lazy, FC } from "react";
import "./MyAccount.css";
import Activity from "../activity/Activity";
import MyTickets from "../../support/mytickets/MyTickets";
import WelcomePopup from "./welcome/welcome-popup";
import Users from "./subusers/Users";
import { getServerUrl } from "@/app/config";
import License from "../License/License";

const Settings = lazy(() => import("./settings/mySettings"));

// ------------------ TAB BUTTON ------------------
interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const TabButton: FC<TabButtonProps> = ({
  label,
  active,
  onClick,
  disabled,
}) => (
  <button
    className={`tab ${active ? "active" : ""} ${
      disabled ? "tab-disabled" : ""
    }`}
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
  >
    {label}
  </button>
);

// ------------------ MAIN COMPONENT ------------------
const MyAccount: FC = () => {
  const [activeTab, setActiveTab] = useState("📊 Dashboard");
  const [user, setUser] = useState<any>(null);
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);

  // LOAD USER
  useEffect(() => {
    const storedUser = localStorage.getItem("modix_user");
    if (!storedUser) return;

    try {
      const parsedUser = JSON.parse(storedUser);
      parsedUser.roles = parsedUser.roles || [parsedUser.role || "SubUser"];
      setUser(parsedUser);
      setShowWelcome(true);
    } catch {
      localStorage.removeItem("modix_user");
    }
  }, []);

  // FETCH LOGS
  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("modix_token");
        const res = await fetch(`${getServerUrl()}/api/auth/logs`, {
          headers: { Authorization: token || "" },
        });

        if (!res.ok) throw new Error();
        const data = await res.json();
        setUserLogs(data.logs || []);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      }
    };

    fetchLogs();
  }, [user]);

  // LOGOUT
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

  // TABS
  const allTabs = [
    { label: "📊 Dashboard", roles: ["Owner", "SubUser", "Admin"] },
    { label: "🔐 Security", roles: ["Owner", "Admin"] },
    { label: "📜 Activity", roles: ["Owner", "SubUser", "Admin"] },
    { label: "🧾 My License", roles: ["Owner", "Admin"] },
    { label: "👥 Sub-Users", roles: ["Owner", "Admin"] },
    { label: "⚙️ Settings", roles: ["Owner", "Admin"] },
    { label: "🛠️ Support", roles: ["Owner", "SubUser", "Admin"] },
  ];

  const userRoles = user.roles || ["SubUser"];
  const hasRole = (tabRoles: string[]) =>
    tabRoles.some((r) => userRoles.includes(r));

  return (
    <div className="myaccount-container">
      {/* HEADER */}
      <header className="account-header">
        <h1>⚙️ My Account</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </header>

      {/* TABS */}
      <nav className="tabs">
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

      {/* ------------------ DASHBOARD ------------------ */}
      {activeTab === "📊 Dashboard" && (
        <section className="dashboard-welcome">
          <h2 className="welcome-title">
            👋 Welcome to Modix, {user.username}
          </h2>

          <p className="welcome-text">
            <strong>Modix Game Panel</strong> is a modern, powerful server
            management platform built to give you full control over your game
            servers without the usual complexity.
          </p>

          <div className="welcome-box">
            <h3>🚧 Development Status</h3>
            <p>
              Modix is currently being actively rebuilt after a period of
              inactivity. Core systems are being redesigned to be faster,
              cleaner, and more reliable.
            </p>
          </div>

          <div className="welcome-box">
            <h3>🐧 Platform Focus</h3>
            <p>
              Initial support is focused on <strong>Linux</strong> to ensure
              stability and faster development. Windows support will follow once
              the core system is solid.
            </p>
          </div>

          <div className="welcome-box">
            <h3>🔥 Planned Features</h3>
            <ul className="welcome-list">
              <li>Live server console access</li>
              <li>Full file & config management</li>
              <li>Integrated mod + workshop system</li>
              <li>Player management tools</li>
              <li>Modern real-time UI</li>
            </ul>
          </div>

          <div className="welcome-box warning">
            <h3>⚠️ Note</h3>
            <p>
              This is a large project that previously stalled due to burnout.
              Development has now resumed fully and will continue consistently.
            </p>
          </div>
        </section>
      )}

      {activeTab === "🔐 Security" && <div>Security Tab Content</div>}
      {activeTab === "📜 Activity" && <Activity />}
      {activeTab === "👥 Sub-Users" && <Users />}
      {activeTab === "⚙️ Settings" && (
        <Suspense fallback={<div>Loading Settings...</div>}>
          <Settings />
        </Suspense>
      )}
      {activeTab === "🛠️ Support" && <MyTickets />}
      {activeTab === "🧾 My License" && <License />}

      {/* WELCOME POPUP */}
      {showWelcome && (
        <WelcomePopup
          username={user.username}
          logs={userLogs.slice(0, 5)}
          onClose={() => setShowWelcome(false)}
        />
      )}

      {/* ------------------ MODIX UPDATES ------------------ */}
      <section className="modix-updates">
        <h3 className="pages-header">🆕 Modix Updates</h3>

        {userLogs.length > 0 ? (
          <ul className="pages-list compact">
            {userLogs.slice(0, 10).map((log, idx) => (
              <li key={idx} className="page-item">
                <span className="log-date">
                  {new Date(log.date).toLocaleString()}
                </span>
                <span className="log-event">{log.event}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-pages">
            No updates yet development logs will appear here.
          </div>
        )}
      </section>
    </div>
  );
};

export default MyAccount;
