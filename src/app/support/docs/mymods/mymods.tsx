"use client";

import React from "react";
import "./mymods.css";

const docs = [
  {
    href: "/support/docs/accountinfo/accountinfo",
    title: "🧑 Account Info",
    description: "View and update your profile, password, and account details.",
  },
  {
    href: "/terminal",
    title: "🖥️ Console",
    description: "Access the live server terminal to manage and monitor your server in real-time.",
  },
  {
    href: "/docs/mymods",
    title: "🧩 My Mods",
    description: "Browse, enable, disable, and manage all your server mods and Steam Workshop content.",
  },
  {
    href: "/docs/players",
    title: "🎮 Players",
    description: "View online players, manage permissions, and monitor player activity.",
  },
  {
    href: "/docs/servermanagement",
    title: "🛡️ Server Management",
    description: "Control server settings, permissions, roles, and gameplay configurations.",
  },
  {
    href: "/monitoring",
    title: "📊 Monitoring",
    description: "Track server performance, player stats, logs, and game metrics.",
  },
  {
    href: "/docs/security",
    title: "🔒 Security",
    description: "Configure Discord webhooks, alerts, and other security notifications.",
  },
  {
    href: "/docs/network",
    title: "🌐 Network",
    description: "Manage server network settings, ports, and maintenance tools.",
  },
  {
    href: "/docs/automation",
    title: "🤖 Automation",
    description: "Set up automated tasks, scripts, and scheduled panel actions.",
  },
  {
    href: "/docs/panelsettings",
    title: "⚙️ Panel Settings",
    description: "Customize the panel interface, themes, colors, and user preferences.",
  },
];

const mymods = () => {
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

export default mymods;
