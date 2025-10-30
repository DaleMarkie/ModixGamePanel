"use client";

import React from "react";
import "./Docs.css";

const docs = [
  {
    href: "/support/docs/accountinfo/accountinfo",
    title: "🧑 Account Info",
    description: "View and update your profile, password, and account details.",
  },
  {
    href: "/support/docs/terminal",
    title: "🖥️ Console",
    description:
      "Access the live server terminal to manage and monitor your server in real-time.",
  },
  {
    href: "/support/docs/mymods",
    title: "🧩 My Mods",
    description:
      "Browse, enable, disable, and manage all your server mods and Steam Workshop content.",
  },
  {
    href: "/support/docs/players",
    title: "🎮 Players",
    description:
      "View online players, manage permissions, and monitor player activity.",
  },
  {
    href: "/support/docs/servermanagement",
    title: "🛡️ Server Management",
    description:
      "Control server settings, permissions, roles, and gameplay configurations.",
  },
  {
    href: "/support/docs/monitoring",
    title: "📊 Monitoring",
    description:
      "Track server performance, player stats, logs, and game metrics.",
  },
  {
    href: "/support/docs/security",
    title: "🔒 Security",
    description:
      "Configure Discord webhooks, alerts, and other security notifications.",
  },
  {
    href: "/support/docs/network",
    title: "🌐 Network",
    description:
      "Manage server network settings, ports, and maintenance tools.",
  },
  {
    href: "/support/docs/automation",
    title: "🤖 Automation",
    description:
      "Set up automated tasks, scripts, and scheduled panel actions.",
  },
  {
    href: "/support/docs/panelsettings",
    title: "⚙️ Panel Settings",
    description:
      "Customize the panel interface, themes, colors, and user preferences.",
  },
];

const Docs = () => {
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

      {/* Discord Support Section */}
      <a
        href="https://discord.gg/YOUR_DISCORD_LINK"
        target="_blank"
        rel="noopener noreferrer"
        className="doc-card support-card"
      >
        <h3>💬 Need Help? Join Our Discord</h3>
        <p>
          Stuck or unsure about something? Our team is ready to help you on
          Discord. Click here to join!
        </p>
        <span className="doc-arrow">→</span>
      </a>
    </main>
  );
};

export default Docs;
