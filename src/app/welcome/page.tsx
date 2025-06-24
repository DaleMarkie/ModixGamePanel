"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaServer,
  FaUser,
  FaLaptop,
} from "react-icons/fa";
import Welcome from "./Welcome";

const navLinks = [
  { label: "📊 Terminal", href: "/terminal/Terminal" },
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
    label: "🧩 Mods",
    href: "/modmanager",
    submenu: [
      { label: "🧩 Installed Mods", href: "/modmanager/installed" },
      { label: "🛒 Browse Workshop", href: "/modmanager/workshop" },
      { label: "🔄 Mod Update Checker", href: "/modmanager/tags" },
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
      { label: "📤 Send Embed", href: "/webhooks/send" },
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
      { label: "🎫 Support Tickets", href: "/support/tickets" },
      { label: "❓ FAQ", href: "/support/faq" },
      { label: "💬 Community", href: "/support/community" },
    ],
  },
  {
    label: "🔐 Account",
    href: "/login",
    submenu: [
      { label: "🔐 Sign In", href: "/login/signin" },
      { label: "🆕 Register", href: "/login/register" },
    ],
  },
];

function SidebarUserInfo({ hostname, container, loggedInUser }) {
  if (!hostname || !container || !loggedInUser) return null;

  const infoItems = [
    { icon: <FaLaptop size={14} />, label: "Host", value: hostname },
    { icon: <FaServer size={14} />, label: "Container", value: container },
    { icon: <FaUser size={14} />, label: "User", value: loggedInUser },
  ];

  return (
    <section
      aria-label="Server Information"
      style={{
        marginTop: 12,
        padding: "8px 12px",
        backgroundColor: "rgba(255,255,255,0.07)",
        borderRadius: 8,
        color: "#bbb",
        fontSize: "0.65rem",
        userSelect: "none",
        boxShadow: "inset 0 0 10px rgba(0,0,0,0.15)",
        width: "90%",
        maxWidth: 180,
        animation: "fadeIn 0.4s ease forwards",
      }}
    >
      {infoItems.map(({ icon, label, value }) => (
        <div
          key={label}
          title={`${label}: ${value}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 5,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            cursor: "default",
          }}
          aria-label={`${label}: ${value}`}
        >
          <span style={{ color: "#5db3ff", flexShrink: 0 }}>{icon}</span>
          <strong
            style={{
              color: "#eee",
              minWidth: 50,
              flexShrink: 0,
              userSelect: "text",
            }}
          >
            {label}:
          </strong>
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
          from {opacity: 0; transform: translateY(4px);}
          to {opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </section>
  );
}

function NavItem({ label, href, submenu, isOpen, toggleOpen, sidebarOpen }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div
        role="button"
        tabIndex={0}
        onClick={submenu ? () => toggleOpen(href) : undefined}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && submenu) toggleOpen(href);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarOpen ? "space-between" : "center",
          padding: sidebarOpen ? "8px 14px" : "8px 10px",
          color: "#ddd",
          fontWeight: 600,
          fontSize: "0.68rem",
          backgroundColor: "#222",
          borderRadius: 6,
          cursor: submenu ? "pointer" : "default",
          userSelect: "none",
          transition: "background-color 0.15s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#2e2e2e")
        }
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
        {sidebarOpen && submenu && (
          <span style={{ flexShrink: 0, color: "#bbb" }}>
            {isOpen ? (
              <FaChevronDown size={14} />
            ) : (
              <FaChevronRight size={14} />
            )}
          </span>
        )}
      </div>

      {/* Submenu */}
      {sidebarOpen && submenu && isOpen && (
        <nav
          aria-label={`${label} submenu`}
          style={{
            marginTop: 2,
            paddingLeft: 24,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {submenu.map(({ label: subLabel, href: subHref }) => (
            <Link
              key={subHref}
              href={subHref}
              style={{
                color: "#aaa",
                fontSize: "0.63rem",
                padding: "4px 0",
                textDecoration: "none",
                borderRadius: 4,
                userSelect: "none",
                transition: "color 0.2s ease",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
            >
              {subLabel}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [serverInfo, setServerInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});

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
    setOpenMenus((prev) => ({ ...prev, [href]: !prev[href] }));
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
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          userSelect: "none",
        }}
      >
        <aside
          style={{
            width: sidebarOpen ? 190 : 52,
            backgroundColor: "#1c1c1c",
            color: "#eee",
            transition: "width 0.3s ease",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            padding: sidebarOpen ? "12px 8px" : "12px 6px",
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
              marginBottom: 14,
              userSelect: "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                gap: sidebarOpen ? 10 : 0,
                width: "100%",
              }}
            >
              <img
                src="https://i.ibb.co/cMPwcn8/logo.png"
                alt="Modix Logo"
                style={{
                  height: 26,
                  borderRadius: 7,
                  transition: "height 0.3s ease",
                }}
                draggable={false}
              />
              {sidebarOpen && (
                <span
                  aria-label="Modix Game Panel"
                  style={{
                    fontWeight: "900",
                    fontSize: "0.82rem",
                    background:
                      "linear-gradient(270deg, #43b581, #70b5f9, #ffa94d, #43b581)",
                    backgroundSize: "600% 600%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: "gradientShift 8s ease infinite",
                    textShadow: "0 0 6px rgba(67, 181, 129, 0.55)",
                    whiteSpace: "nowrap",
                    userSelect: "none",
                  }}
                >
                  Modix: Game Panel
                </span>
              )}
            </div>

            {sidebarOpen && serverInfo && (
              <SidebarUserInfo
                hostname={serverInfo.hostname}
                container={serverInfo.container}
                loggedInUser={serverInfo.loggedInUser}
              />
            )}
          </div>

          {/* Collapse/Expand Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            style={{
              backgroundColor: "#2c2c2c",
              border: "none",
              color: "#eee",
              padding: "7px 12px",
              fontSize: "0.82rem",
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarOpen ? "space-between" : "center",
              cursor: "pointer",
              marginBottom: 14,
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

          {/* Navigation */}
          <nav
            style={{
              flexGrow: 1,
              overflowY: "auto",
              paddingBottom: 36,
            }}
          >
            {navLinks.map(({ label, href, submenu }) => (
              <NavItem
                key={href}
                label={label}
                href={href}
                submenu={submenu}
                isOpen={!!openMenus[href]}
                toggleOpen={toggleSubMenu}
                sidebarOpen={sidebarOpen}
              />
            ))}
          </nav>

          {/* Version */}
          <div
            style={{
              position: "absolute",
              bottom: 10,
              width: "100%",
              textAlign: "center",
              fontSize: "0.62rem",
              fontWeight: "600",
              color: "#555",
              userSelect: "none",
              borderTop: "1px solid #333",
              paddingTop: 3,
              letterSpacing: 1.1,
            }}
          >
            v1.1.2
          </div>
        </aside>

        {/* Main content */}
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
          <Welcome />
        </main>
      </div>
    </>
  );
}
