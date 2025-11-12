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

const MyAccount = () => {
  const [user, setUser] = useState<any>(null);
  const [userLogs, setUserLogs] = useState<any[]>([]);

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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleString();
  };

  const getLongestSession = () => {
    if (!userLogs.length) return "N/A";
    const sessions = userLogs
      .filter((log) => log.duration)
      .map((log) => {
        const parts = log.duration.split(/[ms ]+/).map(Number);
        return parts[0] * 60 + (parts[1] || 0); // convert to seconds
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
      .find((log) => log.action.startsWith("Playing game:"));
    return gameLog ? gameLog.action.replace("Playing game: ", "") : "None";
  };

  if (!user)
    return (
      <div className="not-logged">Please log in to access your account.</div>
    );

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
    <div className="myaccount-container">
      {/* Info Cards */}
      <section className="dashboard-user-info">
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
      </section>

      {/* Recent Activity */}
      <section className="recent-activity">
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

      {/* Social / Support Links */}
      <section className="account-links">
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

export default MyAccount;
