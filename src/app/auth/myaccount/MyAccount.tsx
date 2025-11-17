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
  FaCalendarAlt,
  FaUserCircle,
} from "react-icons/fa";
import "./MyAccount.css";
import { getServerUrl } from "@/app/config";

// 👉 IMPORT PAGE COMPONENTS
import MySettings from "@/app/auth/myaccount/settings/mySettings";
import License from "@/app/auth/myaccount/license/License";

// ----------------------------------------
// Coming Soon Support Page
// ----------------------------------------
const SupportComingSoon = () => (
  <div
    className="page-section"
    style={{
      padding: "40px",
      background: "#15161e",
      borderRadius: "12px",
      textAlign: "center",
      border: "1px solid #23242f",
      boxShadow: "0 0 10px rgba(0,0,0,0.4)",
    }}
  >
    <h2 style={{ fontSize: "1.8rem", marginBottom: "10px" }}>
      🛠️ Support Page
    </h2>
    <p style={{ fontSize: "1.2rem", opacity: 0.8 }}>
      This page will arrive in a later update.
    </p>
  </div>
);

// ----------------------------------------
// Helper Pages
// ----------------------------------------
const ChangeLogPage = () => (
  <div className="page-section">
    <h2>📝 Change Log</h2>
    <p>All updates, fixes, and improvements listed here.</p>
  </div>
);

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
    {
      label: "Username",
      value: user.username || "N/A",
      icon: <FaUserCircle />,
    },
    { label: "Email", value: user.email || "N/A", icon: "✉️" },
    { label: "Role(s)", value: user.roles.join(", ") || "Owner", icon: "🛡️" },
    {
      label: "Status",
      value: user.active ? "Active ✅" : "Inactive ❌",
      icon: "⚡",
      className: user.active ? "status-active" : "status-inactive",
    },
    {
      label: "Joined",
      value: formatDate(user.created_at),
      icon: <FaCalendarAlt />,
    },
    {
      label: "Last Login",
      value: formatDate(user.last_login),
      icon: <FaHourglass />,
    },
    { label: "Account ID", value: user.id || "N/A", icon: "🆔" },
    {
      label: "Plan / License",
      value: user.license?.plan || "Free / N/A",
      icon: <FaTicketAlt />,
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

      <section className="quick-actions page-section">
        <h2>⚡ Links</h2>
        <div className="quick-buttons">
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

// ----------------------------------------
// Main MyAccount Component
// ----------------------------------------
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

  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage user={user} userLogs={userLogs} />,
    license: <License />,
    support: <SupportComingSoon />, // UPDATED ✔️
    updates: <ChangeLogPage />,
    achievements: <ChangeLogPage />,
  };

  return (
    <div className="myaccount-container">
      <nav className="account-top-menu">
        <ul>
          {Object.keys(pages).map((key) => (
            <li key={key}>
              <button
                className={activePage === key ? "active" : ""}
                onClick={() => setActivePage(key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="page-content">{pages[activePage]}</div>
    </div>
  );
};

export default MyAccount;
