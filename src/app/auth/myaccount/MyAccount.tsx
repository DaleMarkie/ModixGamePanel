"use client";

import React, { useState, useEffect } from "react";
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
    { label: "Plan / License", value: user.license?.plan || "Free / N/A", icon: "🎫" },
    { label: "Active Sessions", value: userLogs.length || "0", icon: "💻" },
  ];

  return (
    <div className="myaccount-container">
      <header className="account-header">
        <h1>⚙️ My Account Overview</h1>
      </header>

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
    </div>
  );
};

export default MyAccount;
