"use client";

import React, { useState, useEffect } from "react";
import {
  FaDiscord,
  FaFacebook,
  FaHeart,
  FaGamepad,
  FaHourglass,
  FaCogs,
  FaTicketAlt,
} from "react-icons/fa";
import "./MyAccount.css";
import { getServerUrl } from "@/app/config";

// 👉 SETTINGS PAGE IMPORT
import MySettings from "@/app/auth/myaccount/settings/mySettings";
import mySubscriptions from "@/app/auth/myaccount/subscriptions/mySubscriptions";
import License from "@/app/auth/myaccount/license/License";

/* ----------------------------------------
    PAGE COMPONENTS
-----------------------------------------*/

const ChangeLogPage = () => (
  <div className="page-section">
    <h2>📝 Change Log</h2>
    <p>All updates, fixes, and improvements listed here.</p>
  </div>
);

const LicensesPage = () => (
  <div className="page-section">
    <h2>📄 License</h2>
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
      {/* Info Cards */}
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

      {/* NEW: Quick Actions */}
      <section className="quick-actions page-section">
        <h2>⚡ Quick Actions</h2>
        <div className="quick-buttons">
          <button onClick={() => window.alert("Open Support")}>
            <FaTicketAlt /> Submit Ticket
          </button>
          <a
            href="https://discord.gg/EwWZUSR9tM"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaDiscord /> Join Discord
          </a>
          <a
            href="https://ko-fi.com/modixgamepanel"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaHeart /> Support on Ko-fi
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
              Overview
            </button>
          </li>

          <li>
            <button
              className={activePage === "license" ? "active" : ""}
              onClick={() => setActivePage("license")}
            >
              Credentials
            </button>
          </li>

          <li>
            <button
              className={activePage === "Billing / Payments" ? "active" : ""}
              onClick={() => setActivePage("Billing / Payments")}
            >
              Billing
            </button>
          </li>

          <li>
            <button
              className={activePage === "mySubscriptions" ? "active" : ""}
              onClick={() => setActivePage("mySubscriptions")}
            >
              Subscriptions
            </button>
          </li>

          {/* NEW SETTINGS TAB */}
          <li>
            <button
              className={activePage === "settings" ? "active" : ""}
              onClick={() => setActivePage("settings")}
            >
              History
            </button>
          </li>

          {/* NEW SETTINGS TAB */}
          <li>
            <button
              className={activePage === "fd" ? "false" : ""}
              onClick={() => setActivePage("df")}
            >
              Support
            </button>
          </li>

          {/* NEW SETTINGS TAB */}
          <li>
            <button
              className={activePage === "Achievements" ? "false" : ""}
              onClick={() => setActivePage("df")}
            >
              Achievements
            </button>
          </li>

          {/* NEW SETTINGS TAB */}
          <li>
            <button
              className={activePage === "Achievements" ? "false" : ""}
              onClick={() => setActivePage("df")}
            >
              Updates
            </button>
          </li>
        </ul>
      </nav>

      <div className="page-content">{renderPage()}</div>
    </div>
  );
};

export default MyAccount;
