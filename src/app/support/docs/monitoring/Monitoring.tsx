"use client";

import React from "react";
import "./Monitoring.css";

const docs = [
  {
    href: "/support/docs/accountinfo/accountinfo",
    title: "🧑‍💻 Account Info",
    description:
      "Manage your profile, password, and personal account settings.",
  },
  {
    href: "/support/docs/mymods",
    title: "📦 My Mods",
    description:
      "View, enable, disable, and organize all mods installed on your server.",
  },
  {
    href: "/support/docs/workshopmanager",
    title: "🛠️ Workshop Manager",
    description:
      "Browse Steam Workshop, add mods, and manage your server’s mod library.",
  },
  {
    href: "/support/docs/modupdates",
    title: "🔄 Mod Updates",
    description:
      "Check for updates, see changelogs, and keep your mods up-to-date.",
  },
  {
    href: "/support/docs/createnewmod",
    title: "🆕 Create New Mod",
    description:
      "Start a new mod project and configure its settings from scratch.",
  },
  {
    href: "/support/docs/manageassets",
    title: "🎨 Manage Assets",
    description:
      "Upload, organize, and edit mod assets such as images, textures, and scripts.",
  },
  {
    href: "/support/docs/editmodinfo",
    title: "✏️ Edit Mod Info",
    description:
      "Edit mod names, descriptions, version info, and other metadata.",
  },
  {
    href: "/support/docs/build&export",
    title: "🚀 Build & Export",
    description:
      "Compile your mod and export it for testing or workshop upload.",
  },
  {
    href: "/support/docs/uploadtoworkshop",
    title: "☁️ Upload to Workshop",
    description:
      "Publish your mod to Steam Workshop and manage its visibility.",
  },
  {
    href: "/docs/panelsettings",
    title: "⚙️ Panel Settings",
    description:
      "Customize your panel interface, themes, and user preferences.",
  },
];

const Monitoring = () => {
  return (
    <main className="docs-page">
      <h1 className="docs-title">Modix MyMods Documentation</h1>
      <p className="docs-subtitle">
        Quick access to all main mod-related sections of your Modix Game Panel.
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

export default Monitoring;
