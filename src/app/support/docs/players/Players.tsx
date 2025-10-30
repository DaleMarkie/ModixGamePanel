"use client";

import React from "react";
import "./Players.css";

const docs = [
  {
    href: "/support/docs/accountinfo/playerlist",
    title: "🧑‍💻 Player List",
    description:
      "View all registered players and monitor their activity on your server.",
  },
  {
    href: "/support/docs/playersearch",
    title: "🔍 Player Search",
    description:
      "Quickly search for players by name, ID, or status for easier management.",
  },
  {
    href: "/support/docs/chatlogs",
    title: "💬 Chat Logs",
    description:
      "Review in-game chat history to monitor communication and detect issues.",
  },
  {
    href: "/support/docs/sessionhistory",
    title: "📜 Session History",
    description:
      "Track player login sessions, durations, and server activity over time.",
  },
  {
    href: "/support/docs/playerbans",
    title: "⛔ Player Bans",
    description:
      "Manage player bans, unbans, and view ban reasons and durations.",
  },
  {
    href: "/support/docs/playerwarnings",
    title: "⚠️ Player Warnings",
    description:
      "Issue warnings to players and keep a record of disciplinary actions.",
  },
  {
    href: "/support/docs/editplayerinfo",
    title: "✏️ Edit Player Info",
    description:
      "Update player nicknames, roles, permissions, and other account details.",
  },
  {
    href: "/support/docs/playerachievements",
    title: "🏆 Player Achievements",
    description: "View and manage player stats, achievements, and milestones.",
  },
  {
    href: "/support/docs/playerreports",
    title: "📣 Player Reports",
    description:
      "Handle player-submitted reports, complaints, and feedback efficiently.",
  },
  {
    href: "/docs/panelsettings",
    title: "⚙️ Panel Settings",
    description:
      "Customize panel interface, themes, and preferences related to player management.",
  },
];

const Players = () => {
  return (
    <main className="docs-page">
      <h1 className="docs-title">Modix Player Management Documentation</h1>
      <p className="docs-subtitle">
        Quick access to all player-related sections of your Modix Game Panel.
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

export default Players;
