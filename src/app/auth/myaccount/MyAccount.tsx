"use client";

import React, { useState, useEffect } from "react";
import {
  FaDiscord,
  FaFacebook,
  FaHeart,
  FaGamepad,
  FaHourglass,
  FaExclamationTriangle,
  FaTrophy,
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

const ChangeLogPage = () => {
  const logs = [
    {
      version: "v1.5.2",
      date: "2025-11-10",
      details: "Improved dashboard layout, fixed minor bugs.",
      icon: "✅",
    },
    {
      version: "v1.5.1",
      date: "2025-10-28",
      details: "Added new settings page for header customization.",
      icon: "⚙️",
    },
    {
      version: "v1.5.0",
      date: "2025-10-20",
      details: "Full mod manager overhaul with thumbnails and tags.",
      icon: "🆕",
    },
    {
      version: "v1.4.9",
      date: "2025-10-10",
      details: "Fixed server stats display on dashboard.",
      icon: "🐛",
    },
  ];

  return (
    <div className="page-section changelog">
      <h2>📝 Change Log</h2>
      <ul>
        {logs.map((log, idx) => (
          <li key={idx} className="changelog-item">
            <span className="changelog-icon">{log.icon}</span>
            <div className="changelog-content">
              <strong>{log.version}</strong> ({log.date}): {log.details}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const LicensesPage = () => (
  <div className="page-section">
    <h2>📄 Licenses</h2>
    <p>View your active plan and license details.</p>
  </div>
);

/* ----------------------------------------
    DASHBOARD PAGE
-----------------------------------------*/

const DashboardPage = ({ user }: any) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleString();
  };

  /* Example notifications / alerts */
  const notifications = [
    {
      type: "maintenance",
      message: "Server maintenance scheduled for 2025-11-20.",
      icon: <FaExclamationTriangle />,
      color: "#ff9800",
    },
    {
      type: "license",
      message: "Your license expires in 5 days.",
      icon: <FaExclamationTriangle />,
      color: "#f44336",
    },
    {
      type: "mod",
      message: "Mod X requires update for current version.",
      icon: <FaExclamationTriangle />,
      color: "#ffc107",
    },
  ];

  /* Example gamification badges / progress */
  const badges = [
    { name: "Active 7 Days", icon: <FaTrophy />, progress: 100 },
    { name: "Configured Server", icon: <FaTrophy />, progress: 75 },
  ];

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

      {/* 🔹 Notifications / Alerts */}
      <section className="notifications page-section">
        <h2>🔔 Notifications / Alerts</h2>
        <ul>
          {notifications.map((note, idx) => (
            <li key={idx} className="notification-item">
              <span className="notification-icon" style={{ color: note.color }}>
                {note.icon}
              </span>{" "}
              {note.message}
            </li>
          ))}
        </ul>
      </section>

      {/* 🔹 Gamification / Engagement */}
      <section className="gamification page-section">
        <h2>🏆 Achievements / Progress</h2>
        <div className="badges-grid">
          {badges.map((badge, idx) => (
            <div key={idx} className="badge-card">
              <div className="badge-icon">{badge.icon}</div>
              <div className="badge-info">
                <span className="badge-name">{badge.name}</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${badge.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
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

  if (!user)
    return (
      <div className="not-logged">Please log in to access your account.</div>
    );

  /* PAGE SWITCHER */
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage user={user} />;
      case "support":
        return <SupportPage />;
      case "changelog":
        return <ChangeLogPage />;
      case "license":
        return <License />;
      case "settings":
        return <MySettings />;
      default:
        return <DashboardPage user={user} />;
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
              My License
            </button>
          </li>

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
