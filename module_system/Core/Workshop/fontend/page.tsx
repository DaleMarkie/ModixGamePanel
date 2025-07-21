"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaDiscord,
  FaCoffee,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaServer,
  FaUser,
  FaLaptop,
  FaSearch,
} from "react-icons/fa";
import Workshop from "./Workshop";
const allPages = [
  { label: "Dashboard Home", href: "/" },
  { label: "Mod Updater", href: "/mod-updater" },
  { label: "Workshop", href: "/workshop" },
  { label: "Server Status", href: "/server-status" },
  { label: "Support", href: "/support" },
  { label: "Documentation", href: "/docs" },
  { label: "FAQ", href: "/support/faq" },
  // add more pages here as needed
];
const navLinks = [
  // ... same navLinks array as before ...
  {
    label: "🧭 Dashboard",
    href: "/dashboard",
    submenu: [
      { label: "🖥️ My Servers", href: "/auth/myservers" },
      { label: "🧪 Account", href: "/auth/myaccount" },
      { label: "📄 My Licensing", href: "/auth/mylicensing" },
      { label: "📍 Support Tickets", href: "/auth/support/tickets" },
      { label: "⚙️ Settings", href: "/auth/mysettings" },
    ],
  },
  {
    label: "🖥️ Terminal",
    href: "/terminal",
  },
  {
    label: "⚙️ Configuration",
    href: "/settings",
    submenu: [
      { label: "⚙️ General Settings", href: "/settings/general" },
      { label: "🧪 Sandbox Options", href: "/settings/sandbox" },
      { label: "📄 server.ini", href: "/settings/serverini" },
      { label: "📍 Spawn Points", href: "/settings/spawnpoints" },
      { label: "🧟 Zombie Settings", href: "/settings/zombies" },
    ],
  },
  {
    label: "🧰 Mods",
    href: "/modmanager",
    submenu: [
      { label: "🧩 Installed Mods", href: "/modmanager" },
      { label: "🛒 Browse Workshop", href: "/workshop" },
      { label: "🔄 Mod Update Checker", href: "/modupdater" },
    ],
  },
  {
    label: "📁 Files",
    href: "/filemanager",
    submenu: [
      { label: "📂 My Files", href: "/filemanager/uploads" },
      { label: "⚙️ Config Files", href: "/filemanager/configs" },
      { label: "🧾 SandboxVars.lua", href: "/filemanager/sandboxvars" },
      { label: "📄 Server Logs", href: "/filemanager/logs" },
    ],
  },
  {
    label: "👥 Players",
    href: "/players",
    submenu: [
      { label: "👥 All Players", href: "/players/all" },
      { label: "🟢 Online Players", href: "/players/online" },
      { label: "🚫 Banned Players", href: "/players/banned" },
      { label: "✅ Whitelist", href: "/players/whitelist" },
    ],
  },
  {
    label: "📡 Webhooks",
    href: "/webhooks",
    submenu: [
      { label: "📤 Send Embed", href: "/webhook" },
      { label: "💾 Saved Webhooks", href: "/webhooks/saved" },
      { label: "📝 Webhook Logs", href: "/webhooks/logs" },
    ],
  },
  {
    label: "🛠 Tools",
    href: "/tools",
    submenu: [
      { label: "📈 Performance Stats", href: "/tools/performance" },
      { label: "🌐 Port Checker", href: "/tools/portcheck" },
      { label: "🎨 Theme Manager", href: "/tools/theme" },
      { label: "📦 Plugin Tools", href: "/tools/plugins" },
    ],
  },
  {
    label: "🆘 Support",
    href: "/support",
    submenu: [
      { label: "📚 Documentation", href: "/docs" },
      { label: "🎫 Support Tickets", href: "/support/" },
      { label: "❓ FAQ", href: "/support/faq" },
    ],
  },
  {
    label: "🔐 Account",
    href: "/login",
    submenu: [
      { label: "🔐 Sign In", href: "/auth/login" },
      { label: "🆕 Register", href: "/auth/register" },
    ],
  },
];

// SidebarUserInfo refactored to use classNames
function SidebarUserInfo({ hostname, container, loggedInUser }) {
  if (!hostname || !container || !loggedInUser) return null;
  return (
    <section aria-label="Server Information" className="server-info-section">
      {[
        { icon: <FaLaptop size={12} />, label: "Host", value: hostname },
        { icon: <FaServer size={12} />, label: "Container", value: container },
        { icon: <FaUser size={12} />, label: "User", value: loggedInUser },
      ].map(({ icon, label, value }) => (
        <div
          key={label}
          title={`${label}: ${value}`}
          aria-label={`${label}: ${value}`}
          className="server-info-item"
        >
          <span className="server-info-icon">{icon}</span>
          <span className="server-info-label">{label}:</span>
          <span className="server-info-value">{value}</span>
        </div>
      ))}
    </section>
  );
}

export default function Dashboard() {
  const [serverInfo, setServerInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchServerInfo() {
      await new Promise((r) => setTimeout(r, 400));
      setServerInfo({
        hostname: "modix-prod-server-01.longname.example.com",
        container: "pz-prod-container-05",
        loggedInUser: "adminUser42",
      });
    }
    fetchServerInfo();
  }, []);

  const toggleSubMenu = (href) => {
    setOpenMenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  // Filter navLinks by search term (checks label and submenu labels)
  const filteredNavLinks = navLinks
    .map(({ label, href, submenu }) => {
      if (!searchTerm) return { label, href, submenu };

      const lowerSearch = searchTerm.toLowerCase();

      const mainMatch = label.toLowerCase().includes(lowerSearch);

      let filteredSubmenu = null;
      if (submenu) {
        filteredSubmenu = submenu.filter((item) =>
          item.label.toLowerCase().includes(lowerSearch)
        );
      }

      if (mainMatch || (filteredSubmenu && filteredSubmenu.length > 0)) {
        return {
          label,
          href,
          submenu: filteredSubmenu,
        };
      }
      return null;
    })
    .filter(Boolean);

  return (
    <>
      <style>{`
        /* ========== Global Animations ========== */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeIn {
          from {opacity: 0; transform: translateY(5px);}
          to {opacity: 1; transform: translateY(0);}
        }

        /* ========== Root Container ========== */
.dashboard-root {
  min-height: 100vh; /* full viewport height */
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
  position: relative;

  background-color: #010101; /* fallback color */
  background-image: url('https://images7.alphacoders.com/627/627909.jpg');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;

  color: #fff; /* for text */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  /* Optional: add a subtle text shadow to keep text readable on busy backgrounds */
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

        .dashboard-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(18, 18, 18, 0.7);
          z-index: 0;
        }

        .dashboard-container {
          position: relative;
          z-index: 1;
          display: flex;
          max-width: 1200px;
          width: 100%;
          background-color: #181818;
          border-radius: 16px;
          box-shadow: 0 10px 15px rgba(0,0,0,0.7), inset 0 0 30px rgba(255,255,255,0.03);
          overflow: hidden;
          min-height: 80vh;
        }

        /* ========== Sidebar Styles ========== */
        .sidebar {
          background-color: #1c1c1c;
          color: #eee;
          display: flex;
          flex-direction: column;
          user-select: none;
          transition: width 0.3s ease;
          overflow: hidden;
        }
        .sidebar.open {
          width: 195px;
          padding: 16px 10px;
        }
        .sidebar.closed {
          width: 60px;
          padding: 16px 6px;
        }

        /* Logo + Title Container */
        .sidebar-header {
          display: flex;
          flex-direction: column;
          margin-bottom: 16px;
          gap: 6px;
        }
        .sidebar-header.closed {
          align-items: center;
          gap: 0;
        }
        .sidebar-header.open {
          align-items: flex-start;
          gap: 6px;
        }

        .sidebar-logo-row {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 12px;
          justify-content: flex-start;
        }
        .sidebar-logo-row.closed {
          justify-content: center;
          gap: 0;
        }

        .sidebar-logo {
          height: 28px;
          border-radius: 8px;
          transition: height 0.3s ease;
          user-select: none;
          flex-shrink: 0;
        }

        .sidebar-title {
          font-weight: 900;
          font-size: 0.8rem;
          background: linear-gradient(270deg, #43b581, #70b5f9, #ffa94d, #43b581);
          background-size: 600% 600%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 8s ease infinite;
          text-shadow: 0 0 6px rgba(67, 181, 129, 0.6);
          white-space: nowrap;
          user-select: none;
        }

        /* Server Info */
        .server-info-section {
          margin-top: 12px;
          padding: 9px 12px;
          background-color: rgba(255,255,255,0.06);
          border-radius: 8px;
          color: #c0c0c0;
          font-size: 0.625rem;
          user-select: none;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.15);
          animation: fadeIn 0.5s ease forwards;
          width: 90%;
          max-width: 165px;
        }
        .server-info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: default;
        }
        .server-info-icon {
          flex-shrink: 0;
          color: #6ec1e4;
          display: flex;
          align-items: center;
        }
        .server-info-label {
          font-weight: 600;
          color: #eee;
          min-width: 48px;
          flex-shrink: 0;
          user-select: text;
        }
        .server-info-value {
          flex-grow: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          user-select: text;
        }

        /* Collapse Button */
        .sidebar-collapse-btn {
          background-color: #2c2c2c;
          border: none;
          color: #eee;
          padding: 10px 14px;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          cursor: pointer;
          margin-top: 16px;
          border-radius: 6px;
          user-select: none;
          transition: all 0.3s ease;
          width: 100%;
          justify-content: space-between;
        }
        .sidebar-collapse-btn.closed {
          justify-content: center;
        }

        /* Search Bar */
        .sidebar-search-wrapper {
          margin-top: 12px;
          margin-bottom: 8px;
          position: relative;
        }
        .sidebar-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #888;
          pointer-events: none;
          user-select: none;
        }
        .sidebar-search-input {
          width: 100%;
          padding: 8px 8px 8px 32px;
          font-size: 0.75rem;
          border-radius: 6px;
          border: none;
          outline: none;
          background-color: #262626;
          color: #ddd;
          transition: background-color 0.3s ease;
        }
        .sidebar-search-input::placeholder {
          color: #888;
        }
        .sidebar-search-input:focus {
          background-color: #333;
        }

        /* Navigation Links */
        .sidebar-nav {
          list-style: none;
          padding-left: 0;
          margin: 0;
          flex-grow: 1;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #555 transparent;
        }
        .sidebar-nav::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background-color: #555;
          border-radius: 3px;
        }

        .sidebar-nav-item {
          margin-bottom: 4px;
          user-select: none;
        }

        .sidebar-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 8px 10px;
          border-radius: 6px;
          color: #ddd;
          text-decoration: none;
          cursor: pointer;
          transition: background-color 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-link:hover,
        .sidebar-link:focus {
          background-color: #43b581;
          color: white;
          outline: none;
          text-shadow: none;
        }

        .sidebar-link.submenu-label {
          font-weight: 700;
          user-select: none;
        }

        /* Submenu styles */
        .submenu-toggle {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 0.85rem;
          padding: 2px 2px;
          border-radius: 6px;
          width: 100%;
          text-align: left;
          user-select: none;
          transition: background-color 0.2s ease;
        }
        .submenu-toggle:hover,
        .submenu-toggle:focus {
          background-color: #43b581;
          color: white;
          outline: none;
        }

        .submenu-arrow {
          flex-shrink: 0;
          transition: transform 0.3s ease;
          color: #bbb;
        }
        .submenu-arrow.open {
          transform: rotate(90deg);
          color: #43b581;
        }

        /* Submenu container */
        .submenu-list {
          list-style: none;
          padding-left: 20px;
          margin: 4px 0 0 0;
          animation: fadeIn 0.25s ease forwards;
        }
        .submenu-list.closed {
          display: none;
        }

        .submenu-item {
          margin-bottom: 3px;
        }

        .submenu-link {
          display: block;
          font-weight: 500;
          font-size: 0.8rem;
          padding: 6px 10px;
          border-radius: 6px;
          color: #ccc;
          text-decoration: none;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: background-color 0.2s ease;
        }
        .submenu-link:hover,
        .submenu-link:focus {
          background-color: #2e8b57;
          color: white;
          outline: none;
        }

        /* Main content */
        .dashboard-main-content {
          flex-grow: 1;
          padding: 2px 2px;
          color: #ccc;
          overflow-y: auto;
          max-height: 95vh;
          user-select: text;
        }

        /* Scrollbar for main content */
        .dashboard-main-content::-webkit-scrollbar {
          width: 8px;
        }
        .dashboard-main-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .dashboard-main-content::-webkit-scrollbar-thumb {
          background-color: #555;
          border-radius: 4px;
        }
      `}</style>

      <div
        className="dashboard-root"
        role="main"
        aria-label="Modix Game Panel Dashboard"
      >
        <div className="dashboard-overlay" aria-hidden="true"></div>

        <div className="dashboard-container" aria-live="polite">
          <aside
            className={`sidebar ${sidebarOpen ? "open" : "closed"}`}
            aria-label="Primary navigation sidebar"
          >
            <header
              className={`sidebar-header ${sidebarOpen ? "open" : "closed"}`}
            >
              <div
                className={`sidebar-logo-row ${
                  sidebarOpen ? "open" : "closed"
                }`}
              >
                <img
                  src="https://i.ibb.co/cMPwcn8/logo.png"
                  alt="Modix Logo"
                  className="sidebar-logo"
                  draggable="false"
                />
                {sidebarOpen && (
                  <h1 className="sidebar-title">Modix Game Panel</h1>
                )}
              </div>

              {sidebarOpen && (
                <>
                  <SidebarUserInfo
                    hostname={serverInfo?.hostname}
                    container={serverInfo?.container}
                    loggedInUser={serverInfo?.loggedInUser}
                  />

                  <div className="sidebar-search-wrapper">
                    <FaSearch
                      className="sidebar-search-icon"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      aria-label="Search navigation menu"
                      className="sidebar-search-input"
                      placeholder="Search menu..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                </>
              )}
            </header>

            <nav role="navigation" aria-label="Sidebar navigation menu">
              <ul className="sidebar-nav">
                {filteredNavLinks.map(({ label, href, submenu }) => (
                  <li key={href} className="sidebar-nav-item">
                    {submenu ? (
                      <>
                        <button
                          type="button"
                          className="submenu-toggle"
                          aria-expanded={!!openMenus[href]}
                          aria-controls={`${href}-submenu`}
                          onClick={() => toggleSubMenu(href)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleSubMenu(href);
                            }
                          }}
                        >
                          <span className="sidebar-link submenu-label">
                            {label}
                          </span>
                          <FaChevronRight
                            aria-hidden="true"
                            className={`submenu-arrow ${
                              openMenus[href] ? "open" : ""
                            }`}
                          />
                        </button>
                        <ul
                          id={`${href}-submenu`}
                          role="menu"
                          aria-label={`${label} submenu`}
                          className={`submenu-list ${
                            openMenus[href] ? "open" : "closed"
                          }`}
                        >
                          {submenu.map(({ label: subLabel, href: subHref }) => (
                            <li
                              key={subHref}
                              className="submenu-item"
                              role="none"
                            >
                              <Link
                                href={subHref}
                                role="menuitem"
                                tabIndex={openMenus[href] ? 0 : -1}
                                className="submenu-link"
                              >
                                {subLabel}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <Link href={href} className="sidebar-link">
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              aria-pressed={sidebarOpen}
              className={`sidebar-collapse-btn ${
                sidebarOpen ? "open" : "closed"
              }`}
            >
              {sidebarOpen ? "Collapse" : "Expand"}
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
          </aside>

          <main
            className="dashboard-main-content"
            tabIndex={-1}
            aria-label="Main dashboard content"
          >
            <Workshop />
          </main>
        </div>
      </div>
    </>
  );
}
