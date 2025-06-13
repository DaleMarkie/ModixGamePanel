import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard2.css";

const allModules = [
  // === Core Pages ===
  {
    name: "📜 Audit Log Viewer",
    status: "Active",
    tooltip: "Review panel activity logs",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "2025-06-01",
    description:
      "View and filter audit logs of all user and system activity for enhanced transparency.",
    category: "Core Pages",
  },
  {
    name: "📜 Server Health",
    status: "Active",
    tooltip: "Review panel activity logs",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "2025-06-01",
    description:
      "View and filter audit logs of all user and system activity for enhanced transparency.",
    category: "Core Pages",
  },  
  {
    name: "💾 Backup Manager",
    status: "Active",
    tooltip: "Manage server backups",
    preinstalled: true,
    version: "0.9.8",
    author: "Modix Backup Team",
    lastUpdated: "2025-06-02",
    description: "Create, restore, and manage backups of your game server data.",
    category: "Core Pages",
  },
  {
    name: "🕹️ Game Selector",
    status: "Active",
    tooltip: "Choose which game to manage",
    preinstalled: true,
    version: "1.0.0",
    author: "Modix Dev Team",
    lastUpdated: "2025-05-30",
    description: "Switch between supported games for full panel compatibility.",
    category: "Core Pages",
  },
  {
    name: "⚙️ Task Manager",
    status: "unactive",
    tooltip: "Manage system tasks",
    preinstalled: true,
    version: "1.1.2",
    author: "Modix Core",
    lastUpdated: "2025-06-03",
    description:
      "Monitor system processes, scheduled jobs, and background services in real time.",
    category: "Core Pages",
  },
  {
    name: "👥 User Manager",
    status: "Active",
    tooltip: "Manage panel users",
    preinstalled: true,
    version: "1.0.5",
    author: "Modix WebCore",
    lastUpdated: "2025-06-04",
    description: "Add, remove, and manage user permissions and roles in the panel.",
    category: "Core Pages",
  },
  {
    name: "🔗 Webhooks Manager",
    status: "Active",
    tooltip: "Send customized embeds",
    preinstalled: true,
    version: "1.0.5",
    author: "Modix WebCore",
    lastUpdated: "2025-06-04",
    description:
      "Send rich Discord-style embeds or custom payloads to APIs via webhooks.",
    category: "Core Pages",
  },

  // === Game Management ===
  {
    name: "🚫 PZ Ban Manager",
    status: "Active",
    tooltip: "Manage bans",
    preinstalled: true,
    version: "1.0.4",
    author: "Modix WebCore",
    lastUpdated: "2025-06-05",
    description:
      "Manage temporary and permanent bans on your Project Zomboid server with auto-sync.",
    category: "Game Management",
  },
  {
    name: "📂 PZ Database",
    status: "Active",
    tooltip: "View player database",
    preinstalled: true,
    version: "1.0.4",
    author: "Modix WebCore",
    lastUpdated: "2025-06-05",
    description: "Explore and manage your Project Zomboid player database and character info.",
    category: "Game Management",
  },
  {
    name: "🧩 PZ Mod Manager",
    status: "Active",
    tooltip: "Manage PZ mods",
    preinstalled: true,
    version: "1.0.4",
    author: "Modix WebCore",
    lastUpdated: "2025-06-05",
    description: "Enable, disable, or remove Project Zomboid Workshop mods easily.",
    category: "Game Management",
  },
  {
    name: "👤 PZ Player Manager",
    status: "Active",
    tooltip: "Manage players",
    preinstalled: true,
    version: "1.0.4",
    author: "Modix WebCore",
    lastUpdated: "2025-06-05",
    description: "View player stats, inventory, and session data for all connected users.",
    category: "Game Management",
  },
  {
    name: "🛠️ PZ Workshop Manager",
    status: "Active",
    tooltip: "Sync Workshop mods",
    preinstalled: true,
    version: "1.0.4",
    author: "Modix WebCore",
    lastUpdated: "2025-06-05",
    description:
      "Auto-download and update Project Zomboid Workshop mods from Steam.",
    category: "Game Management",
  },
  {
    name: "🛡️ Server Settings",
    status: "Active",
    tooltip: "Configure server settings",
    preinstalled: true,
    version: "0.9 Beta",
    author: "Modix Mods Team",
    lastUpdated: "2025-06-01",
    description:
      "Customize sandbox variables, server rules, difficulty settings, and more.",
    category: "Game Management",
  },
  {
    name: "🧾 INI & Lua Generator",
    status: "Active",
    tooltip: "Configure server settings",
    preinstalled: true,
    version: "0.9 Beta",
    author: "Modix Mods Team",
    lastUpdated: "2025-06-01",
    description:
      "Create new configs from templates.",
    category: "Game Management",
  },
  {
    name: "🗃️ Config Preset Loader",
    status: "Active",
    tooltip: "Configure server settings",
    preinstalled: true,
    version: "0.9 Beta",
    author: "Modix Mods Team",
    lastUpdated: "2025-06-01",
    description:
      "Apply RP, PvP, or Hardcore presets.",
    category: "Game Management",
  },  

  // === Panel Customization ===
  {
    name: "🎨 Theme Manager",
    status: "Active",
    tooltip: "Customize panel design",
    preinstalled: true,
    version: "1.0.3",
    author: "Modix Dev Team",
    lastUpdated: "2025-06-01",
    description:
      "Change the panel’s appearance using dynamic themes and color presets.",
    category: "Panel Customization",
  },

  // === Steam Settings ===
  {
    name: "📥 Install PZ Files",
    status: "Active",
    tooltip: "Install Project Zomboid",
    preinstalled: true,
    version: "0.9.5",
    author: "Modix Mods Team",
    lastUpdated: "2025-06-01",
    description: "Install the base Project Zomboid files via SteamCMD.",
    category: "Steam Settings",
  },
  {
    name: "🔧 Setup SteamCMD",
    status: "Active",
    tooltip: "Configure SteamCMD",
    preinstalled: true,
    version: "0.9.5",
    author: "Modix Mods Team",
    lastUpdated: "2025-06-01",
    description: "Install and configure SteamCMD for automatic updates and mod fetching.",
    category: "Steam Settings",
  },
  {
    name: "🧾 Steam Parser",
    status: "Active",
    tooltip: "Parse Steam Workshop",
    preinstalled: true,
    version: "0.9.5",
    author: "Modix Mods Team",
    lastUpdated: "2025-06-01",
    description:
      "Automatically parse Steam Workshop mods to display metadata, tags, and images.",
    category: "Steam Settings",
  },

  // === Logs & Monitoring ===
  {
    name: "🖥️ System Monitor",
    status: "Active",
    tooltip: "Monitor server usage",
    preinstalled: true,
    version: "1.0.1",
    author: "Modix Dev Team",
    lastUpdated: "2025-06-03",
    description: "Track CPU, RAM, disk, and network activity in real time.",
    category: "Logs & Monitoring",
  },
];




// Your exact categories in order:
const categories = [
  "Core Pages",
  "Game Management",
  "Server Tools",
  "Steam Settings",
  "Panel Customization",
  "Logs & Monitoring",
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
      {preinstalled && <span className="preinstalled-badge">Pre-installed</span>}
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
      className={`module-status ${status === "Active" ? "active" : "coming-soon"}`}
    >
      {status}
    </div>
  </div>
);

const Dashboard2 = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Filter modules by search term (case insensitive)
  const filteredModules = allModules.filter((mod) =>
    mod.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleModuleClick = (name) => {
    const routes = {
      "🎨 Theme Manager": "/thememanager",
      "🕹️ Game Selector": "/games",
      "💾 Backup Manager": "/backupmanager",
      "🌐 Webhook Manager": "/webhook",
      "🖥️ System Monitor": "/system-monitor",
      "Steam Workshop Manager": "/workshop",
      "⚙️ Task Manager": "/taskmanager",
      "🌐 PZ Ban Manager": "/pzbanmanager",
      "Server Settings": "/serversettings",
      "Steam Parser": "/steamparser",
      "🛠️ PZ Workshop Manager": "/pzworkshopmanager",
      "📜 Audit Log Viewer": "/auditlogs", 
      "👥 User Manager": "/usermanager",
      "🚫 PZ Ban Manager": "/pzbanmanager", 
      "📂 PZ Database": "/pzdatabase", 
      "🧩 PZ Mod Manager": "/pzmodmanager",
      "👤 PZ Player Manager": "/pzplayermanager", 
      "🧾 Steam Parser": "/steamparser",
      "📜 Server Health": "/serverhealth",   
    };
    if (routes[name]) navigate(routes[name]);
  };

  return (
    <div className="dashboard2">
      {/* Header */}
      <div className="dashboard-header">
        <h1>🧠 Dashboard</h1>
        <div className="header-right">
          <span className="version-label">v1.1.2</span>
          <div className="update-banner">
            <strong>🔔 Update Available:</strong>{" "}
            A new version of Modix is available.{" "}
            <a href="/update">Click here to update</a>.
          </div>

          <input
            className="search-input"
            type="text"
            placeholder="🔍 Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <nav className="quick-nav">
            <button onClick={() => navigate("/docs")}>🎟 My License</button>
            <button onClick={() => navigate("/docs")}>📄 Docs</button>
            <button onClick={() => navigate("/support")}>🛠 Support</button>
            <button onClick={() => navigate("/faq")}>❓ FAQ</button>
          </nav>
        </div>
      </div>

      {/* Render modules grouped by category */}
      {categories.map((category) => {
        const modsInCategory = filteredModules.filter(
          (mod) => mod.category === category
        );
        if (modsInCategory.length === 0) return null; // skip empty categories

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
    </div>
  );
};

export default Dashboard2;
