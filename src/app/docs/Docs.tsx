"use client";

import React from "react";
import "./Docs.css";
import ModManagerDocs from "../docs/ModManagerDocs";
const Docs = () => {
  const docs = [
    {
      href: "/docs/modmanagerdocs",
      title: "🧩 Mod Management",
      description:
        "Comprehensive guide on managing mods and settings for Project Zomboid.",
    },
    {
      href: "https://modix.app/docs/server-setup",
      title: "🖥️ Server Setup",
      description:
        "How to install, configure, and run your Project Zomboid server.",
    },
    {
      href: "https://modix.app/docs/troubleshooting",
      title: "🛠️ Troubleshooting",
      description: "Common issues and how to fix them quickly.",
    },
    {
      href: "https://modix.app/docs/api",
      title: "🔗 API Reference",
      description: "Documentation for Modix API endpoints and usage.",
    },
    {
      href: "/theme-manager",
      title: "🎨 Theme Manager",
      description: "Customize the appearance of your Modix Game Panel.",
    },
    {
      href: "/docs/webhookdocs",
      title: "📡 Webhook Integration",
      description:
        "Set up and manage Discord webhooks for alerts and notifications.",
    },
    {
      href: "/docs/terminaldocs",
      title: "💻 Terminal Control",
      description:
        "Use the integrated terminal to run commands and manage your server.",
    },
    {
      href: "https://modix.app/docs/file-manager",
      title: "📂 File Manager",
      description:
        "Manage server files directly through the panel's file browser.",
    },
    {
      href: "https://modix.app/docs/user-management",
      title: "👥 User & Team Management",
      description: "Manage team members, roles, and permissions in Modix.",
    },
    {
      href: "/docs/serversettingsdocs",
      title: "⚙️ Server Settings",
      description:
        "Configure server settings including gameplay, mods, and network.",
    },
    {
      href: "https://modix.app/docs/logging",
      title: "📊 Logs & Monitoring",
      description: "View live server logs and monitor server status.",
    },
    {
      href: "https://modix.app/docs/faq",
      title: "❓ FAQ",
      description: "Frequently asked questions about Modix Game Panel.",
    },
    {
      href: "https://modix.app/docs/support",
      title: "🎫 Support & Tickets",
      description: "How to get support and submit tickets.",
    },
  ];

  return (
    <main className="docs-page">
      <h1 className="docs-title">Modix Documentation</h1>
      <p className="docs-subtitle">
        Everything you need to know to get started and manage your server.
      </p>

      <div className="docs-grid">
        {docs.map(({ href, title, description }) => (
          <a
            key={title}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="doc-card"
          >
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
