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
import Workshop from "../workshop/Workshop";

const navLinks = [
  // === SYSTEM ===
  {
    label: "📊 Terminal",
    href: "/terminal/Terminal",
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
      { label: "🧩 Installed Mods", href: "/modmanager" },
      { label: "🛒 Browse Workshop", href: "/workshop" },
      { label: "🔄 Mod Update Checker", href: "/modmanager/tags" },
    ],
  },

  // === FILES & DATA ===
  {
    label: "📁 Files",
    href: "/filemanager",
    submenu: [
      { label: "📂 My Files", href: "/filemanager" },
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
      { label: "👥 All Players", href: "/players/all" },
      { label: "🟢 Online Players", href: "/players/online" },
      { label: "🚫 Banned Players", href: "/players/banned" },
      { label: "✅ Whitelist", href: "/players/whitelist" },
    ],
  },

  // === INTEGRATIONS ===
  {
    label: "📡 Webhooks",
    href: "/webhooks",
    submenu: [
      { label: "📤 Send Embed", href: "/webhook" },
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
      { label: "🎨 Theme Manager", href: "/thememanager" },
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
      { label: "🔐 Sign In", href: "/login/" },
      { label: "🆕 Register", href: "/signup" },
    ],
  },
];

function SidebarUserInfo({ hostname, container, loggedInUser }) {
  if (!hostname || !container || !loggedInUser) return null;

  return (
    <section
      aria-label="Server Information"
      style={{
        marginTop: 12,
        padding: "9px 12px",
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        borderRadius: 7.5,
        color: "#c0c0c0",
        fontSize: "0.6375rem",
        userSelect: "none",
        boxShadow: "inset 0 0 10px rgba(0,0,0,0.15)",
        animation: "fadeIn 0.5s ease forwards",
        width: "90%",
        maxWidth: 165,
      }}
    >
      {[
        { icon: <FaLaptop size={12} />, label: "Host", value: hostname },
        { icon: <FaServer size={12} />, label: "Container", value: container },
        { icon: <FaUser size={12} />, label: "User", value: loggedInUser },
      ].map(({ icon, label, value }) => (
        <div
          key={label}
          title={`${label}: ${value}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7.5,
            marginBottom: 6,
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
              minWidth: 45,
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

  const toggleSubMenu = (href) => {
    setOpenMenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          backgroundColor: "#121212",
          minHeight: "100vh",
        }}
      >
        <aside
          style={{
            width: sidebarOpen ? 195 : 52,
            backgroundColor: "#1c1c1c",
            color: "#fff",
            transition: "width 0.3s ease",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            padding: sidebarOpen ? "12px 6px" : "12px 4px",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          {/* Logo + Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: sidebarOpen ? "flex-start" : "center",
              gap: sidebarOpen ? 6 : 0,
              userSelect: "none",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                gap: sidebarOpen ? 12 : 0,
                width: "100%",
              }}
            >
              <img
                src="https://i.ibb.co/cMPwcn8/logo.png"
                alt="Modix Logo"
                style={{
                  height: 28,
                  borderRadius: 8,
                  // Removed glow effects here:
                  // boxShadow: "0 0 8px #43b581cc",
                  // filter: "drop-shadow(0 0 8px #43b581aa)",
                  transition: "height 0.3s ease",
                }}
              />
              {sidebarOpen && (
                <span
                  className="logo-title"
                  aria-label="Modix Game Panel"
                  style={{
                    fontWeight: "900",
                    fontSize: "0.8rem",
                    background:
                      "linear-gradient(270deg, #43b581, #70b5f9, #ffa94d, #43b581)",
                    backgroundSize: "600% 600%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: "gradientShift 8s ease infinite",
                    textShadow: "0 0 6px rgba(67, 181, 129, 0.6)",
                    whiteSpace: "nowrap",
                    userSelect: "none",
                  }}
                >
                  Modix: Game Panel
                </span>
              )}
            </div>

            {/* User info */}
            {sidebarOpen && serverInfo && (
              <SidebarUserInfo
                hostname={serverInfo.hostname}
                container={serverInfo.container}
                loggedInUser={serverInfo.loggedInUser}
              />
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
              padding: "9px 12px",
              fontSize: "0.825rem",
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarOpen ? "space-between" : "center",
              cursor: "pointer",
              marginTop: 13.5,
              borderRadius: 8,
              width: "100%",
              userSelect: "none",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#3a3a3a")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#2c2c2c")
            }
          >
            {sidebarOpen ? (
              <>
                <span>Collapse</span>
                <FaTimes size={16} />
              </>
            ) : (
              <FaBars size={16} />
            )}
          </button>

          {/* Nav Menu */}
          <nav
            style={{
              marginTop: 12,
              flexGrow: 1,
              overflowY: "auto",
              paddingBottom: 40, // enough space so nav won't overlap version text
            }}
          >
            {navLinks.map(({ label, href, submenu }) => (
              <div key={href} style={{ marginBottom: 6 }}>
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
                    padding: sidebarOpen ? "9px 15px" : "9px",
                    color: "#eee",
                    fontWeight: 600,
                    backgroundColor: "#222",
                    borderRadius: 6,
                    margin: "3px 6px",
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#333")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#222")
                  }
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: "0.675rem",
                    }}
                  >
                    {label}
                  </span>
                  {sidebarOpen &&
                    submenu &&
                    (openMenus[href] ? (
                      <FaChevronDown size={14} />
                    ) : (
                      <FaChevronRight size={14} />
                    ))}
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
                        padding: "6px 30px",
                        color: "#aaa",
                        textDecoration: "none",
                        fontSize: "0.65rem",
                        userSelect: "none",
                        transition: "color 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#fff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#aaa")
                      }
                    >
                      {sub.label}
                    </Link>
                  ))}
              </div>
            ))}
          </nav>

          {/* Version at bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              width: "100%",
              textAlign: "center",
              fontSize: "0.65rem",
              fontWeight: "600",
              color: "#555",
              userSelect: "none",
              borderTop: "1px solid #333",
              paddingTop: 1,
              letterSpacing: 1.2,
            }}
          >
            v1.1.2
          </div>
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
          <Workshop />
        </main>
      </div>
    </>
  );
}
