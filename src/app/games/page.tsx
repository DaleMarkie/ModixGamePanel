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
} from "react-icons/fa";
import Games from "../games/Games";

const navLinks = [
  // === SYSTEM ===
  {
    label: "📊 Terminal",
    href: "/terminal",
  },

  // === SERVER CONFIGURATION ===
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

  // === CONTENT MANAGEMENT ===
  {
    label: "🧩 Mods",
    href: "/modmanager",
    submenu: [
      { label: "🧩 Installed Mods", href: "/modmanager/installed" },
      { label: "🛒 Browse Workshop", href: "/games/projectzomboid/" },
      { label: "🔄 Mod Update Checker", href: "/workshop/Workshop" },
    ],
  },

  // === FILES & DATA ===
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

  // === PLAYER MANAGEMENT ===
  {
    label: "👥 Players",
    href: "/players",
    submenu: [
      { label: "🟢 Online Players", href: "/players/online" },
      { label: "👥 All Players", href: "/players/all" },
      { label: "🚫 Banned Players", href: "/players/banned" },
      { label: "✅ Whitelist", href: "/players/whitelist" },
    ],
  },

  // === INTEGRATIONS ===
  {
    label: "📡 Webhooks",
    href: "/webhooks",
    submenu: [
      { label: "📤 Send Embed", href: "/webhooks/send" },
      { label: "💾 Saved Webhooks", href: "/webhooks/saved" },
      { label: "📝 Webhook Logs", href: "/webhooks/logs" },
    ],
  },

  // === TOOLS ===
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

  // === SUPPORT ===
  {
    label: "🆘 Support",
    href: "/support",
    submenu: [
      { label: "📚 Documentation", href: "/docs" },
      { label: "🎫 Support Tickets", href: "/support/tickets" },
      { label: "❓ FAQ", href: "/support/faq" },
      { label: "💬 Community", href: "/support/community" },
    ],
  },

  // === AUTH ===
  {
    label: "🔐 Account",
    href: "/login",
    submenu: [
      { label: "🔐 Sign In", href: "/login/signin" },
      { label: "🆕 Register", href: "/login/register" },
    ],
  },
];

// Flatten navLinks + submenu for searching
const searchablePages = navLinks.flatMap(({ label, href, submenu }) => [
  { label, href },
  ...(submenu || []),
]);

function SidebarUserInfo({ hostname, container, loggedInUser }) {
  if (!hostname || !container || !loggedInUser) return null;

  return (
    <section
      aria-label="Server Information"
      style={{
        marginTop: 16,
        padding: "12px 16px",
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        borderRadius: 10,
        color: "#c0c0c0",
        fontSize: "0.85rem",
        userSelect: "none",
        boxShadow: "inset 0 0 10px rgba(0,0,0,0.15)",
        animation: "fadeIn 0.5s ease forwards",
        width: "90%",
        maxWidth: 220,
      }}
    >
      {[
        { icon: <FaLaptop />, label: "Host", value: hostname },
        { icon: <FaServer />, label: "Container", value: container },
        { icon: <FaUser />, label: "User", value: loggedInUser },
      ].map(({ icon, label, value }) => (
        <div
          key={label}
          title={`${label}: ${value}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            cursor: "default",
          }}
          aria-label={`${label}: ${value}`}
        >
          <span style={{ flexShrink: 0, color: "#6ec1e4" }}>{icon}</span>
          <span
            style={{
              fontWeight: "600",
              color: "#eee",
              minWidth: 60,
              flexShrink: 0,
              userSelect: "text",
            }}
          >
            {label}:
          </span>
          <span
            style={{
              flexGrow: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              userSelect: "text",
            }}
          >
            {value}
          </span>
        </div>
      ))}
      <style>{`
        @keyframes fadeIn {
          from {opacity: 0; transform: translateY(5px);}
          to {opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </section>
  );
}

export default function Dashboard() {
  const [serverInfo, setServerInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    async function fetchServerInfo() {
      // Replace with your real API call
      await new Promise((r) => setTimeout(r, 400));
      setServerInfo({
        hostname: "modix-prod-server-01.longname.example.com",
        container: "pz-prod-container-05",
        loggedInUser: "adminUser42",
      });
    }
    fetchServerInfo();
  }, []);

  useEffect(() => {
    if (!searchQuery) return setFilteredResults([]);
    const matches = searchablePages.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredResults(matches);
  }, [searchQuery]);

  const toggleSubMenu = (href) => {
    setOpenMenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#121212",
        minHeight: "100vh",
      }}
    >
      <aside
        style={{
          width: sidebarOpen ? 260 : 70,
          backgroundColor: "#1c1c1c",
          color: "#fff",
          transition: "width 0.3s ease",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          padding: "16px 8px",
          boxSizing: "border-box",
        }}
      >
        {/* Logo + Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: sidebarOpen ? "flex-start" : "center",
            gap: sidebarOpen ? 6 : 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              gap: sidebarOpen ? 14 : 0,
              width: "100%",
            }}
          >
            <img
              src="https://i.ibb.co/cMPwcn8/logo.png"
              alt="Logo"
              style={{ height: 44, borderRadius: 8 }}
            />
            {sidebarOpen && (
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                  color: "#70b5f9",
                }}
              >
                Modix: Game Panel
              </span>
            )}
          </div>

          {/* User info with professional style */}
          {sidebarOpen && serverInfo && (
            <SidebarUserInfo
              hostname={serverInfo.hostname}
              container={serverInfo.container}
              loggedInUser={serverInfo.loggedInUser}
            />
          )}

          {/* SEARCH INPUT */}
          {sidebarOpen && (
            <div style={{ padding: "10px 0 6px", width: "100%" }}>
              <input
                type="text"
                placeholder="🔍 Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "none",
                  fontSize: "0.9rem",
                  backgroundColor: "#2a2a2a",
                  color: "#fff",
                  outline: "none",
                  userSelect: "text",
                  boxSizing: "border-box",
                }}
                aria-label="Search pages"
                autoComplete="off"
              />
              {/* Dropdown results */}
              {searchQuery && filteredResults.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#1e1e1e",
                    borderRadius: 10,
                    boxShadow: "0 4px 14px rgba(0,0,0,0.7)",
                    marginTop: 6,
                    maxHeight: 240,
                    overflowY: "auto",
                    zIndex: 1000,
                    position: "relative",
                  }}
                >
                  {filteredResults.map(({ label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      style={{
                        display: "block",
                        padding: "10px 18px",
                        color: "#ddd",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        borderBottom: "1px solid #333",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#333")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                      onClick={() => {
                        setSearchQuery("");
                        setFilteredResults([]);
                      }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          style={{
            backgroundColor: "#2c2c2c",
            border: "none",
            color: "#fff",
            padding: "12px 16px",
            fontSize: "0.7rem",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarOpen ? "space-between" : "center",
            cursor: "pointer",
            marginTop: 18,
            borderRadius: 8,
            width: "100%",
            userSelect: "none",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3a3a3a")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2c2c2c")}
        >
          {sidebarOpen ? (
            <>
              <span>Collapse</span>
              <FaTimes />
            </>
          ) : (
            <FaBars />
          )}
        </button>

        {/* Nav Menu */}
        <nav style={{ marginTop: 16, flexGrow: 1, overflowY: "auto" }}>
          {navLinks.map(({ label, href, submenu }) => (
            <div key={href} style={{ marginBottom: 8 }}>
              <div
                onClick={() => toggleSubMenu(href)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") toggleSubMenu(href);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: sidebarOpen ? "space-between" : "center",
                  padding: sidebarOpen ? "12px 10px" : "4px",
                  color: "#eee",
                  fontWeight: 150,
                  backgroundColor: "#222",
                  borderRadius: 8,
                  margin: "1px 8px",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#333")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#222")}
              >
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
                {sidebarOpen &&
                  submenu &&
                  (openMenus[href] ? <FaChevronDown /> : <FaChevronRight />)}
              </div>
              {sidebarOpen &&
                submenu &&
                openMenus[href] &&
                submenu.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    style={{
                      display: "block",
                      padding: "8px 40px",
                      color: "#aaa",
                      textDecoration: "none",
                      fontSize: "0.87rem",
                      userSelect: "none",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
                  >
                    {sub.label}
                  </Link>
                ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flexGrow: 1,
          position: "relative",
          zIndex: 2,
          backgroundColor: "rgba(20,20,20,0.9)",
          padding: 24,
          minHeight: "100vh",
          overflowY: "auto",
        }}
      >
        <Games />
      </main>
    </div>
  );
}
