"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./dashboard2.css";

const allModules = [
  // 🏠 Home & Access
  {
    name: "My Servers",
    status: "Active",
    tooltip: "View and manage all your servers",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Access all your linked servers in one place. Monitor, configure, and control each server with ease.",
    category: "Home & Access",
  },
  {
    name: "My Account",
    status: "Active",
    tooltip: "Manage your Modix user account and details",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "View billing history, manage your Modix Pro subscription, and update personal account details.",
    category: "Home & Access",
  },
  {
    name: "My License",
    status: "Active",
    tooltip: "Check your license status",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Manage your Modix license type, view license tier benefits, and handle upgrades or downgrades.",
    category: "Home & Access",
  },
  {
    name: "Docs",
    status: "Active",
    tooltip: "View documentation and usage tips",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Read documentation, guides, and usage tips for each module and feature across the Modix platform.",
    category: "Home & Access",
  },
  {
    name: "My Support Tickets",
    status: "Active",
    tooltip: "Track and submit support issues",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Submit tickets for help or report issues. Track status and communicate directly with the support team.",
    category: "Home & Access",
  },

  // 🎮 Game Configuration
  {
    name: "File Manager",
    status: "Active",
    tooltip: "Edit server files directly",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Navigate, edit, and manage server files securely from your browser with advanced file control.",
    category: "Game Configuration",
  },
  {
    name: "Player Manager",
    status: "Active",
    tooltip: "Edit server files directly",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Navigate, edit, and manage server files securely from your browser with advanced file control.",
    category: "Game Configuration",
  },
  {
    name: "Mod Manager",
    status: "Active",
    tooltip: "Enable, disable, and organize mods",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Discover, enable, disable, and organize mods across profiles. Supports sorting, load order, and dependencies.",
    category: "Game Configuration",
  },
  {
    name: "Workshop Manager",
    status: "Active",
    tooltip: "Manage Steam Workshop items",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Install and manage Steam Workshop items for supported games. Includes subscription tracking and mod syncing.",
    category: "Game Configuration",
  },
  {
    name: "Mod Updater",
    status: "Active",
    tooltip: "Update installed mods automatically",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Check for and apply updates to installed mods. Includes changelog viewer, version tracking, and batch actions.",
    category: "Game Configuration",
  },
  {
    name: "General Settings",
    status: "Active",
    tooltip: "Set core game configuration",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Edit main configuration files like `server.ini`, controlling core server behavior and environment.",
    category: "Game Configuration",
  },
  {
    name: "Sandbox Options",
    status: "Active",
    tooltip: "Adjust in-game sandbox values",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Tweak gameplay variables like loot rarity, zombie speed, spawn behavior, and environmental factors.",
    category: "Game Configuration",
  },

  // 🛠️ Server Admin Tools
  {
    name: "System Monitor",
    status: "Active",
    tooltip: "View CPU, RAM, disk, and system health",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Live monitor CPU, memory, disk, and network stats for your server and host system.",
    category: "Server Admin Tools",
  },
  {
    name: "Backup Manager",
    status: "Active",
    tooltip: "Create and restore backups",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Create, manage, and restore full or partial server backups on-demand or on schedule.",
    category: "Server Admin Tools",
  },
  {
    name: "Task Manager",
    status: "Active",
    tooltip: "Automate server tasks and schedules",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Create scheduled tasks for restarting servers, backing up data, running commands, and more.",
    category: "Server Admin Tools",
  },
  {
    name: "Webhook Manager",
    status: "Active",
    tooltip: "Create Discord and custom webhooks",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Configure webhooks for Discord or custom URLs to get real-time alerts on server events and actions.",
    category: "Server Admin Tools",
  },

  // 🔗 Steam Sync & Data
  {
    name: "Steam Parser",
    status: "Active",
    tooltip: "Parse SteamIDs and profiles",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Convert Steam IDs, lookup player profiles, and fetch public Steam account metadata.",
    category: "Steam Sync & Data",
  },
  {
    name: "Steam API Key",
    status: "Active",
    tooltip: "Add your Steam API key",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Input and manage your Steam Web API key to enable game data syncing, player info, and mod support.",
    category: "Steam Sync & Data",
  },
  {
    name: "Install SteamCMD",
    status: "Active",
    tooltip: "Install and manage SteamCMD",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Install or verify SteamCMD for downloading and updating supported dedicated game servers.",
    category: "Steam Sync & Data",
  },

  // 🎨 Interface Settings
  {
    name: "ThemeSettings",
    status: "Active",
    tooltip: "Customize the panel look and feel",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "April 26, 2025",
    description:
      "Adjust panel themes, layout settings, and user-facing visuals for a personalized experience.",
    category: "Interface Settings",
  },
];

const categories = [
  "Home & Access",
  "Game Configuration",
  "Server Tools",
  "Steam Sync & Data",
  "Interface Settings",
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
    const routes: Record<string, string> = {
      "My Servers": "/server/games",
      "My Account": "/auth/myaccount",
      "My License": "/license",
      "My Support Tickets": "/support",
      ModManager: "/modmanager",
      "Workshop Manager": "/workshop",
      ModUpdater: "/modupdater",
      "General Settings": "/pzsettings/general",
      "Sandbox Options": "/pzsettings/sandbox",
      "Server.ini": "/pzsettings/serverini",
      "Spawn Points": "/pzsettings/spawnpoints",
      "Zombie Settings": "/pzsettings/zombies",
    };

    if (routes[name]) {
      router.push(routes[name]);
    } else {
      alert(`No route defined for "${name}"`);
    }
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
            <button onClick={() => router.push("/dashboard/faq")}>
              ❓ FAQ
            </button>
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
