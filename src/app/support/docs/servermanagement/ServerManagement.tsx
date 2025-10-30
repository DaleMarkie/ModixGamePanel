"use client";

import React from "react";
import "./ServerManagement.css";

const docs = [
  {
    href: "/support/docs/servermanagement/serversettings",
    title: "🧑 Server Settings",
    description: "View and update your profile, password, and account details.",
  },
  {
    href: "/support/docs/servermanagement/backup",
    title: "🖥️ BackUp",
    description:
      "Access the live server terminal to manage and monitor your server in real-time.",
  },
  {
    href: "/support/docs/servermanagement/autorestart",
    title: "🧩 Auto Restart",
    description:
      "Browse, enable, disable, and manage all your server mods and Steam Workshop content.",
  },
  {
    href: "/support/docs/servermanagement/steam",
    title: "🎮 Steam Tools",
    description:
      "View online players, manage permissions, and monitor player activity.",
  },
];

const ServerManagement = () => {
  return (
    <main className="docs-page">
      <h1 className="docs-title">Modix Documentation</h1>
      <p className="docs-subtitle">
        Quick access to all main sections of your Modix Game Panel.
      </p>

      <div className="docs-grid">
        {docs.map(({ href, title, description }) => (
          <a key={href} href={href} className="doc-card">
            <h3>{title}</h3>
            <p>{description}</p>
            <span className="doc-arrow">→</span>
          </a>
        ))}
      </div>
    </main>
  );
};

export default ServerManagement;
