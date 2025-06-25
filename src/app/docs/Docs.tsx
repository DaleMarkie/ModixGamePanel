"use client";

import React, { useState } from "react";
import "./Docs.css";

const docs = [
  {
    href: "/docs/modmanagerdocs",
    title: "🧩 Mod Management",
    description:
      "Comprehensive guide on managing mods and settings for Project Zomboid.",
    category: "Mod Manager",
  },
  {
    href: "https://modix.app/docs/server-setup",
    title: "🖥️ Server Setup",
    description:
      "How to install, configure, and run your Project Zomboid server.",
    category: "Server Setup",
  },
  {
    href: "https://modix.app/docs/troubleshooting",
    title: "🛠️ Troubleshooting",
    description: "Common issues and how to fix them quickly.",
    category: "Troubleshooting",
  },
  {
    href: "https://modix.app/docs/api",
    title: "🔗 API Reference",
    description: "Documentation for Modix API endpoints and usage.",
    category: "API",
  },
  {
    href: "/theme-manager",
    title: "🎨 Theme Manager",
    description: "Customize the appearance of your Modix Game Panel.",
    category: "Appearance",
  },
  {
    href: "/docs/webhookdocs",
    title: "📡 Webhook Integration",
    description:
      "Set up and manage Discord webhooks for alerts and notifications.",
    category: "Webhooks",
  },
  {
    href: "/docs/terminaldocs",
    title: "💻 Terminal Control",
    description:
      "Use the integrated terminal to run commands and manage your server.",
    category: "Terminal",
  },
  {
    href: "https://modix.app/docs/file-manager",
    title: "📂 File Manager",
    description:
      "Manage server files directly through the panel's file browser.",
    category: "File Manager",
  },
  {
    href: "https://modix.app/docs/user-management",
    title: "👥 User & Team Management",
    description: "Manage team members, roles, and permissions in Modix.",
    category: "Users",
  },
  {
    href: "/docs/serversettingsdocs",
    title: "⚙️ Server Settings",
    description:
      "Configure server settings including gameplay, mods, and network.",
    category: "Server Settings",
  },
  {
    href: "https://modix.app/docs/logging",
    title: "📊 Logs & Monitoring",
    description: "View live server logs and monitor server status.",
    category: "Monitoring",
  },
  {
    href: "https://modix.app/docs/faq",
    title: "❓ FAQ",
    description: "Frequently asked questions about Modix Game Panel.",
    category: "General",
  },
  {
    href: "https://modix.app/docs/support",
    title: "🎫 Support & Tickets",
    description: "How to get support and submit tickets.",
    category: "Support",
  },
];

const categories = ["All", ...Array.from(new Set(docs.map((d) => d.category)))];

const Docs = () => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredDocs = docs.filter((doc) => {
    const matchesQuery =
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.description.toLowerCase().includes(query.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || doc.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <main className="docs-page">
      <h1 className="docs-title">Modix Documentation</h1>
      <p className="docs-subtitle">
        Everything you need to know to get started and manage your server.
      </p>

      <input
        type="text"
        placeholder="Search docs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="doc-search-input"
      />

      <div className="doc-categories">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`doc-category-button ${
              selectedCategory === cat ? "active" : ""
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="docs-grid">
        {filteredDocs.length > 0 ? (
          filteredDocs.map(({ href, title, description }) => (
            <a
              key={href}
              href={href}
              target={href.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="doc-card"
            >
              <h3>{title}</h3>
              <p>{description}</p>
              <span className="doc-arrow">→</span>
            </a>
          ))
        ) : (
          <p style={{ padding: "1rem", fontStyle: "italic" }}>
            No results found.
          </p>
        )}
      </div>
    </main>
  );
};

export default Docs;
