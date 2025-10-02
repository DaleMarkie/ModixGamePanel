"use client";

import React from "react";
import "./Docs.css";

const docs = [
  {
    href: "/auth/myaccount",
    title: "📊 Dashboard    ",
    description: "View and manage your account details and profile.",
  },
  {
    href: "/terminal",
    title: "💻 Terminal",
    description: "Access the integrated terminal to manage your server.",
  },
  {
    href: "/workshop",
    title: "📦 ModManager / Workshop Manager",
    description: "Manage mods and workshop content for your server.",
  },
  {
    href: "/filebrowser",
    title: "🗂️ File Manager",
    description: "Browse and manage server files directly from the panel.",
  },
  {
    href: "/player-manager",
    title: "🧑‍🤝‍🧑 Player Manager",
    description: "Manage server players, permissions, and roles.",
  },
  {
    href: "/game-config",
    title: "⚙️ Game Config",
    description:
      "Adjust server and game settings for your Project Zomboid server.",
  },
  {
    href: "/discord-integration",
    title: "📡 Discord Integration",
    description: "Set up Discord webhooks and notifications for your server.",
  },
  {
    href: "/tools",
    title: "🛠️ Tools",
    description: "Access server tools, utilities, and maintenance features.",
  },
  {
    href: "/settings",
    title: "⚙️ Settings",
    description: "Configure panel preferences and user settings.",
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
    </main>
  );
};

export default Docs;
