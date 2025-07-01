"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./dashboard2.css";

const allModules = [
  // Core Pages
  {
    name: "My Servers",
    status: "Active",
    tooltip: "Manage panel plugins",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Access all your linked servers in one place. Monitor, configure, and control each server with ease.",
    category: "Core Pages",
  },
  {
    name: "My Account",
    status: "Active",
    tooltip: "Manage panel plugins",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Easily add and manage plugins to extend panel features without changing core code.",
    category: "Core Pages",
  },
  {
    name: "My License",
    status: "Active",
    tooltip: "Manage panel plugins",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Easily add and manage plugins to extend panel features without changing core code.",
    category: "Core Pages",
  },
  {
    name: "My Support Tickets",
    status: "Active",
    tooltip: "Manage panel plugins",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Easily add and manage plugins to extend panel features without changing core code.",
    category: "Core Pages",
  },
  {
    name: "ModManager",
    status: "Active",
    tooltip: "Manage panel plugins",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Easily add and manage plugins to extend panel features without changing core code.",
    category: "Game Management",
  },
  {
    name: "Workshop Manager",
    status: "Active",
    tooltip: "Manage panel plugins",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Easily add and manage plugins to extend panel features without changing core code.",
    category: "Game Management",
  },
  {
    name: "ModUpdater",
    status: "Active",
    tooltip: "Manage panel plugins",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Easily add and manage plugins to extend panel features without changing core code.",
    category: "Game Management",
  },
  {
    name: "General Settings",
    status: "Active",
    tooltip: "Manage panel plugins",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Easily add and manage plugins to extend panel features without changing core code.",
    category: "Game Management",
  },
  {
    name: "Sandbox Options",
    status: "Active",
    tooltip: "Manage panel plugins",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Easily add and manage plugins to extend panel features without changing core code.",
    category: "Game Management",
  },
  {
    name: "Server.ini",
    status: "Active",
    tooltip: "Manage panel plugins",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Easily add and manage plugins to extend panel features without changing core code.",
    category: "Game Management",
  },
  {
    name: "Spawn Points",
    status: "Active",
    tooltip: "Manage panel plugins",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Easily add and manage plugins to extend panel features without changing core code.",
    category: "Game Management",
  },
  {
    name: "Zombie Settings",
    status: "Active",
    tooltip: "Manage panel plugins",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Easily add and manage plugins to extend panel features without changing core code.",
    category: "Game Management",
  },
];

const categories = [
  "Core Pages",
  "Game Management",
  "Server Tools",
  "Steam Settings",
  "Panel Customization",
];

const ModuleCard = ({
  name,
  status,
  tooltip,
  preinstalled,
  version,
  author,
  lastUpdated,
  description,
  onClick,
}) => (
  <div
    className={`module-card ${status === "Active" ? "clickable" : "disabled"}`}
    onClick={status === "Active" ? onClick : undefined}
    title={tooltip}
  >
    <div className="module-top">
      <span className="module-name">{name}</span>
      {preinstalled && (
        <span className="preinstalled-badge">Pre-installed</span>
      )}
    </div>
    <p className="module-description">{description}</p>
    <div className="module-meta">
      {version && (
        <div className="meta-item">
          <strong>Version:</strong> <span>{version}</span>
        </div>
      )}
      {author && (
        <div className="meta-item">
          <strong>Author:</strong> <span>{author}</span>
        </div>
      )}
      {lastUpdated && (
        <div className="meta-item">
          <strong>Updated:</strong> <span>{lastUpdated}</span>
        </div>
      )}
    </div>
    <div
      className={`module-status ${
        status === "Active" ? "active" : "coming-soon"
      }`}
    >
      {status}
    </div>
  </div>
);

const Dashboard2 = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filteredModules = allModules.filter((mod) =>
    mod.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleModuleClick = (name: string) => {
    const routes = {
      "🎨 Theme Manager": "/thememanager",
      "🕹️ Game Selector": "/games",
      "💾 Backup Manager": "/backupmanager",
      "🔗 Webhooks Manager": "/webhook",
      "🖥️ System Monitor": "/system-monitor",
      "🛠️ PZ Workshop Manager": "/pzworkshopmanager",
      "⚙️ Task Manager": "/taskmanager",
      "🚫 PZ Ban Manager": "/games/projectzomboid/pzbanmanager",
      "🛡️ Server Settings": "/serversettings",
      "🧾 Steam Parser": "/modules/steamparser",
      "🧾 Steam Player Manager": "/modules/steamplayermanager",
      "📜 Audit Log Viewer": "/auditlogs",
      "🔒 User Permissions": "/usermanager",
      "📂 PZ Database": "/pzdatabase",
      "🧩 PZ Mod Manager": "/pzmodmanager",
      "👤 PZ Player Manager": "/pzplayermanager",
      "📜 Server Health": "/serverhealth",
      "🔗 Modix Updater": "/updater",
    };
    if (routes[name]) router.push(routes[name]);
  };

  return (
    <div className="dashboard2">
      <header className="dashboard-header">
        <div className="logo-container">
          <h1 className="panel-title">Dashboard</h1>
        </div>

        <div className="header-right">
          <span className="version-label">v1.1.2</span>
          <div className="update-banner">
            <strong>🔔 Update Available:</strong> A new version of Modix is
            available.{" "}
            <Link href="/updater" className="update-link">
              Click here to update
            </Link>
            .
          </div>
          <input
            className="search-input"
            type="text"
            placeholder="🔍 Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <nav className="quick-nav">
            <button onClick={() => router.push("/license")}>
              🎟 My License
            </button>
            <button onClick={() => router.push("/docs")}>📄 Docs</button>
            <button onClick={() => router.push("/support")}>🛠 Support</button>
            <button onClick={() => router.push("/faq")}>❓ FAQ</button>
          </nav>
        </div>
      </header>

      <main className="module-list">
        {categories.map((category) => {
          const modsInCategory = filteredModules.filter(
            (mod) => mod.category === category
          );
          if (modsInCategory.length === 0) return null;
          return (
            <section key={category} className="module-category-section">
              <h2>{category}</h2>
              <div className="module-grid">
                {modsInCategory.map((mod, idx) => (
                  <ModuleCard
                    key={idx}
                    {...mod}
                    onClick={() => handleModuleClick(mod.name)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
};

export default Dashboard2;
