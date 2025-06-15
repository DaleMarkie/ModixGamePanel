"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./dashboard2.css";

const allModules = [
  {
    name: "📜 Audit Log Viewer",
    status: "Active",
    tooltip: "Review panel activity logs",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "View and analyze detailed logs for all activities within the Modix Panel, providing full transparency and security auditing.",
    category: "Core Pages",
  },
  {
    name: "👥 User Manager",
    status: "Active",
    tooltip: "Manage user accounts and permissions",
    preinstalled: true,
    version: "1.2.1",
    author: "Modix Dev Team",
    lastUpdated: "March 15, 2025",
    description:
      "Add, remove, or modify user roles and access levels across your gaming servers and panel modules.",
    category: "Core Pages",
  },
  {
    name: "🎨 Theme Manager",
    status: "Active",
    tooltip: "Customize the panel appearance",
    preinstalled: false,
    version: "1.0.0",
    author: "Modix UI Team",
    lastUpdated: "April 1, 2025",
    description:
      "Easily switch and configure themes for a personalized Modix Panel experience.",
    category: "Panel Customization",
  },
  {
    name: "🕹️ Game Selector",
    status: "Active",
    tooltip: "Switch between installed games",
    preinstalled: true,
    version: "2.0.5",
    author: "Modix Dev Team",
    lastUpdated: "May 2, 2025",
    description:
      "Quickly switch between different games hosted on your servers without downtime.",
    category: "Game Management",
  },
  {
    name: "💾 Backup Manager",
    status: "Active",
    tooltip: "Automate backups for your servers",
    preinstalled: false,
    version: "1.1.0",
    author: "Modix Backup Team",
    lastUpdated: "April 12, 2025",
    description:
      "Set up scheduled backups for game saves, mods, and configuration files with ease.",
    category: "Server Tools",
  },
  {
    name: "🔗 Webhooks Manager",
    status: "Active",
    tooltip: "Configure and send webhooks",
    preinstalled: false,
    version: "1.0.2",
    author: "Modix Integration Team",
    lastUpdated: "March 22, 2025",
    description:
      "Manage Discord and other webhook integrations to keep your team informed in real time.",
    category: "Server Tools",
  },
  {
    name: "🖥️ System Monitor",
    status: "Active",
    tooltip: "View server performance metrics",
    preinstalled: false,
    version: "0.9.9",
    author: "Modix Monitoring",
    lastUpdated: "May 1, 2025",
    description:
      "Monitor CPU, memory, disk, and network usage to ensure smooth server operations.",
    category: "Server Tools",
  },
  {
    name: "⚙️ Task Manager",
    status: "Active",
    tooltip: "Schedule and manage tasks",
    preinstalled: false,
    version: "1.0.0",
    author: "Modix Scheduler",
    lastUpdated: "March 30, 2025",
    description:
      "Create and monitor scheduled tasks for server maintenance and automated scripts.",
    category: "Server Tools",
  },
  {
    name: "🚫 PZ Ban Manager",
    status: "Active",
    tooltip: "Manage bans on Project Zomboid servers",
    preinstalled: true,
    version: "1.0.1",
    author: "Modix Dev Team",
    lastUpdated: "April 20, 2025",
    description:
      "Ban or unban players across your Project Zomboid servers with a simple interface.",
    category: "Game Management",
  },
  {
    name: "🛡️ Server Settings",
    status: "Active",
    tooltip: "Edit server configuration",
    preinstalled: true,
    version: "2.0.0",
    author: "Modix Dev Team",
    lastUpdated: "May 5, 2025",
    description:
      "Configure detailed server settings including server.ini and SandboxVars.lua in a user-friendly UI.",
    category: "Game Management",
  },
  {
    name: "🧾 Workshop Mod Updates",
    status: "Active",
    tooltip: "Analyze Steam Workshop data",
    preinstalled: false,
    version: "1.0.0",
    author: "Modix Integration Team",
    lastUpdated: "April 25, 2025",
    description:
      "Quickly identify missing dependencies that might disrupt your server. to fix or resolve broken dependencies, ensuring smooth gameplay.",
    category: "Steam Settings",
  },
  {
    name: "🧾 Setup SteamCMD",
    status: "Active",
    tooltip: "Analyze Steam Workshop data",
    preinstalled: false,
    version: "1.0.0",
    author: "Modix Integration Team",
    lastUpdated: "April 25, 2025",
    description:
      "Parse and visualize Steam Workshop mod data to help manage dependencies and versions.",
    category: "Steam Settings",
  },
  {
    name: "🧾 Setup SteamCMD",
    status: "Active",
    tooltip: "Analyze Steam Workshop data",
    preinstalled: false,
    version: "1.0.0",
    author: "Modix Integration Team",
    lastUpdated: "April 25, 2025",
    description:
      "Parse and visualize Steam Workshop mod data to help manage dependencies and versions.",
    category: "Steam Settings",
  },
  {
    name: "🧾 Steam Parser",
    status: "Active",
    tooltip: "Analyze Steam Workshop data",
    preinstalled: false,
    version: "1.0.0",
    author: "Modix Integration Team",
    lastUpdated: "April 25, 2025",
    description:
      "Parse and visualize Steam Workshop mod data to help manage dependencies and versions.",
    category: "Steam Settings",
  },
  {
    name: "🧾 Steam Player Manager",
    status: "Active",
    tooltip: "Analyze Steam Workshop data",
    preinstalled: false,
    version: "1.0.0",
    author: "Modix Integration Team",
    lastUpdated: "April 25, 2025",
    description:
      "Parse and visualize Steam Workshop mod data to help manage dependencies and versions.",
    category: "Steam Settings",
  },
  {
    name: "📂 PZ Database",
    status: "Active",
    tooltip: "View Project Zomboid server database",
    preinstalled: false,
    version: "1.1.1",
    author: "Modix Database Team",
    lastUpdated: "May 3, 2025",
    description:
      "Access the Project Zomboid server database for advanced queries and management.",
    category: "Game Management",
  },
  {
    name: "🧩 PZ Mod Manager",
    status: "Active",
    tooltip: "Manage Project Zomboid mods",
    preinstalled: false,
    version: "1.2.0",
    author: "Modix Dev Team",
    lastUpdated: "May 4, 2025",
    description:
      "Add, remove, enable, or disable mods for Project Zomboid with a clear UI.",
    category: "Game Management",
  },
  {
    name: "👤 PZ Player Manager",
    status: "Active",
    tooltip: "Manage players on Project Zomboid servers",
    preinstalled: false,
    version: "1.0.0",
    author: "Modix Dev Team",
    lastUpdated: "April 28, 2025",
    description:
      "Track and manage player data, ban statuses, and stats across servers.",
    category: "Game Management",
  },
  {
    name: "📜 Server Health",
    status: "Active",
    tooltip: "Check server health status",
    preinstalled: false,
    version: "1.0.0",
    author: "Modix Monitoring Team",
    lastUpdated: "May 2, 2025",
    description:
      "Monitor overall server health, including uptime and performance alerts.",
    category: "Server Tools",
  },
  {
    name: "🔗 Modix Updater",
    status: "Active",
    tooltip: "Update the Modix Panel",
    preinstalled: true,
    version: "1.1.2",
    author: "Modix Dev Team",
    lastUpdated: "June 1, 2025",
    description:
      "Keep your Modix Panel up to date with the latest features and fixes.",
    category: "Panel Customization",
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
      "🚫 PZ Ban Manager": "/pzbanmanager",
      "🛡️ Server Settings": "/serversettings",
      "🧾 Steam Parser": "/modules/steamparser",
      "🧾 Steam Player Manager": "/modules/steamplayermanager",
      "📜 Audit Log Viewer": "/auditlogs",
      "👥 User Manager": "/usermanager",
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
