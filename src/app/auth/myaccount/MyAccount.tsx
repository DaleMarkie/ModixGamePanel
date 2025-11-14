"use client";

import React, { useState, useEffect } from "react";
import {
  FaDiscord,
  FaFacebook,
  FaHeart,
  FaGamepad,
  FaHourglass,
} from "react-icons/fa";
import "./MyAccount.css";
import { getServerUrl } from "@/app/config";

// 👉 SETTINGS PAGE IMPORT
import MySettings from "@/app/auth/myaccount/settings/mySettings";
import License from "@/app/auth/myaccount/license/License";
/* ----------------------------------------
    PAGE COMPONENTS
-----------------------------------------*/

const SupportPage = () => (
  <div className="page-section">
    <h2>🛠 Support</h2>
    <p>Submit tickets or contact support here.</p>
  </div>
);

const ChangeLogPage = () => (
  <div className="page-section">
    <h2>📝 Change Log</h2>
    <p>All updates, fixes, and improvements listed here.</p>
  </div>
);

const LicensesPage = () => (
  <div className="page-section">
    <h2>📄 Licenses</h2>
    <p>View your active plan and license details.</p>
  </div>
);

/* ----------------------------------------
    DASHBOARD PAGE
-----------------------------------------*/

const DashboardPage = ({ user, userLogs }: any) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleString();
  };

  const getLongestSession = () => {
    if (!userLogs.length) return "N/A";

    const sessions = userLogs
      .filter((log: any) => log.duration)
      .map((log: any) => {
        const parts = log.duration.split(/[ms ]+/).map(Number);
        return parts[0] * 60 + (parts[1] || 0);
      });

    if (!sessions.length) return "N/A";

    const maxSeconds = Math.max(...sessions);
    const mins = Math.floor(maxSeconds / 60);
    const secs = maxSeconds % 60;

    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getActiveGame = () => {
    if (!userLogs.length) return "None";

    const gameLog = userLogs
      .slice()
      .reverse()
      .find((log: any) => log.action.startsWith("Playing game:"));

    return gameLog ? gameLog.action.replace("Playing game: ", "") : "None";
  };

  const infoCards = [
    { label: "Username", value: user.username || "N/A", icon: "👤" },
    { label: "Email", value: user.email || "N/A", icon: "✉️" },
    { label: "Role(s)", value: user.roles.join(", ") || "Owner", icon: "🛡️" },
    {
      label: "Status",
      value: user.active ? "Active ✅" : "Inactive ❌",
      icon: "⚡",
      className: user.active ? "status-active" : "status-inactive",
    },
    { label: "Joined", value: formatDate(user.created_at), icon: "📅" },
    { label: "Last Login", value: formatDate(user.last_login), icon: "⏰" },
    { label: "Account ID", value: user.id || "N/A", icon: "🆔" },
    {
      label: "Plan / License",
      value: user.license?.plan || "Free / N/A",
      icon: "🎫",
    },
    { label: "Active Sessions", value: userLogs.length || "0", icon: "💻" },
    { label: "Active Game", value: getActiveGame(), icon: <FaGamepad /> },
    {
      label: "Longest Session",
      value: getLongestSession(),
      icon: <FaHourglass />,
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="info-cards-grid">
        {infoCards.map((info, idx) => (
          <div key={idx} className="info-card">
            <div className="info-icon">{info.icon}</div>
            <div className="info-details">
              <span className={`info-value ${info.className || ""}`}>
                {info.value}
              </span>
              <span className="info-label">{info.label}</span>
            </div>
          </div>
        ))}
      </div>

      <section className="recent-activity page-section">
        <h2>📜 Recent Activity</h2>
        {userLogs.length ? (
          <ul>
            {userLogs.slice(0, 5).map((log, idx) => (
              <li key={idx}>
                {new Date(log.timestamp).toLocaleString()} — {log.action}{" "}
                {log.duration ? `(Session: ${log.duration})` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent activity.</p>
        )}
      </section>

      <section className="account-links page-section">
        <p>💌 Connect with Modix:</p>
        <div className="link-buttons">
          <a
            href="https://discord.gg/EwWZUSR9tM"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-discord"
          >
            <FaDiscord /> Join Discord
          </a>
          <a
            href="https://ko-fi.com/modixgamepanel"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-kofi"
          >
            <FaHeart /> Support on Ko-fi
          </a>
          <a
            href="https://www.facebook.com/modixgamepanel/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-facebook"
          >
            <FaFacebook /> Facebook
          </a>
        </div>
      </section>
    </div>
  );
};

/* ----------------------------------------
           MAIN ACCOUNT PAGE
-----------------------------------------*/

const MyAccount = () => {
  const [user, setUser] = useState<any>(null);
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [activePage, setActivePage] = useState<string>("dashboard");

  useEffect(() => {
    const storedUser = localStorage.getItem("modix_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        parsedUser.roles = parsedUser.roles || [parsedUser.role || "SubUser"];
        setUser(parsedUser);
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

  if (!user)
    return (
      <div className="not-logged">Please log in to access your account.</div>
    );

  /* PAGE SWITCHER */
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage user={user} userLogs={userLogs} />;
      case "support":
        return <SupportPage />;
      case "changelog":
        return <ChangeLogPage />;
      case "license":
        return <License />;
      case "settings":
        return <MySettings />; // 👉 SHOWS SETTINGS PAGE HERE
      default:
        return <DashboardPage user={user} userLogs={userLogs} />;
    }
  };

  return (
    <div className="myaccount-container">
      <nav className="account-top-menu">
        <ul>
          <li>
            <button
              className={activePage === "dashboard" ? "active" : ""}
              onClick={() => setActivePage("dashboard")}
            >
              Dashboard
            </button>
          </li>

          <li>
            <button
              className={activePage === "support" ? "active" : ""}
              onClick={() => setActivePage("support")}
            >
              Support
            </button>
          </li>

          <li>
            <button
              className={activePage === "changelog" ? "active" : ""}
              onClick={() => setActivePage("changelog")}
            >
              Change Log
            </button>
          </li>

          <li>
            <button
              className={activePage === "license" ? "active" : ""}
              onClick={() => setActivePage("license")}
            >
              Licenses
            </button>
          </li>

          {/* NEW SETTINGS TAB */}
          <li>
            <button
              className={activePage === "settings" ? "active" : ""}
              onClick={() => setActivePage("settings")}
            >
              Settings
            </button>
          </li>
        </ul>
      </nav>

      <div className="page-content">{renderPage()}</div>
    </div>
  );
};

export default MyAccount;
