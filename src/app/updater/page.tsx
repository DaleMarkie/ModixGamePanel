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
import Updater from "../updater/Updater";

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
    label: "📊 Terminal",
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

// SidebarUserInfo stays the same
function SidebarUserInfo({ hostname, container, loggedInUser }) {
  if (!hostname || !container || !loggedInUser) return null;
  return (
    <section
      aria-label="Server Information"
      style={{
        marginTop: 12,
        padding: "9px 12px",
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: 8,
        color: "#c0c0c0",
        fontSize: "0.625rem",
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
            gap: 8,
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
              minWidth: 48,
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

      // Check main label match
      const mainMatch = label.toLowerCase().includes(lowerSearch);

      // Filter submenu if present
      let filteredSubmenu = null;
      if (submenu) {
        filteredSubmenu = submenu.filter((item) =>
          item.label.toLowerCase().includes(lowerSearch)
        );
      }

      // Include if main or any submenu item matches
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
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "rgb(18, 18, 18)",
          padding: 24,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          boxSizing: "border-box",

          backgroundImage:
            "url('https://images7.alphacoders.com/627/627909.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
        }}
      >
        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(18, 18, 18, 0.7)",
            zIndex: 0,
          }}
        />

        {/* Dashboard Container */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            maxWidth: 1280,
            width: "100%",
            backgroundColor: "#181818",
            borderRadius: 16,
            boxShadow:
              "0 10px 15px rgba(0,0,0,0.7), inset 0 0 30px rgba(255,255,255,0.03)",
            overflow: "hidden",
            minHeight: "80vh",
          }}
        >
          {/* Sidebar */}
          <aside
            style={{
              width: sidebarOpen ? 195 : 60,
              backgroundColor: "#1c1c1c",
              color: "#eee",
              display: "flex",
              flexDirection: "column",
              padding: sidebarOpen ? "16px 10px" : "16px 6px",
              boxSizing: "border-box",
              transition: "width 0.3s ease",
              userSelect: "none",
            }}
          >
            {/* Logo + Title */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: sidebarOpen ? "flex-start" : "center",
                gap: sidebarOpen ? 6 : 0,
                marginBottom: 16,
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
                    transition: "height 0.3s ease",
                  }}
                />
                {sidebarOpen && (
                  <span
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

              {/* Server Info */}
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
                color: "#eee",
                padding: "10px 14px",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                justifyContent: sidebarOpen ? "space-between" : "center",
                cursor: "pointer",
                marginTop: 16,
                borderRadius: 6,
                userSelect: "none",
                transition: "all 0.3s ease",
              }}
            >
              {sidebarOpen ? "Collapse" : <FaBars />}
              {sidebarOpen && <FaChevronDown />}
            </button>

            {/* SEARCH BAR */}
            {sidebarOpen && (
              <div
                style={{
                  marginTop: 12,
                  marginBottom: 8,
                  position: "relative",
                }}
              >
                <FaSearch
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#888",
                  }}
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  aria-label="Search navigation"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 8px 8px 32px",
                    borderRadius: 6,
                    border: "none",
                    backgroundColor: "#2c2c2c",
                    color: "#eee",
                    fontSize: "0.875rem",
                    outline: "none",
                    userSelect: "text",
                  }}
                />
              </div>
            )}

            {/* Navigation */}
            <nav
              style={{
                marginTop: 8,
                flexGrow: 1,
                overflowY: "auto",
                paddingRight: 8,
              }}
              aria-label="Primary Navigation"
            >
              {filteredNavLinks.map(({ label, href, submenu }) => {
                const isOpen = openMenus[href];
                return (
                  <div key={label} style={{ marginBottom: 6 }}>
                    <Link
                      href={href}
                      onClick={(e) => {
                        if (submenu) {
                          e.preventDefault();
                          toggleSubMenu(href);
                        }
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: "#eee",
                        textDecoration: "none",
                        padding: "8px 10px",
                        borderRadius: 6,
                        fontWeight: 600,
                        userSelect: "none",
                        cursor: submenu ? "pointer" : "default",
                        backgroundColor: isOpen
                          ? "rgba(255,255,255,0.05)"
                          : "transparent",
                        transition: "background-color 0.2s ease",
                      }}
                      aria-expanded={submenu ? isOpen : undefined}
                      aria-haspopup={submenu ? "true" : undefined}
                    >
                      <span>{label}</span>
                      {submenu && (
                        <span aria-hidden="true" style={{ marginLeft: 6 }}>
                          {isOpen ? <FaChevronDown /> : <FaChevronRight />}
                        </span>
                      )}
                    </Link>
                    {submenu && isOpen && (
                      <div
                        role="menu"
                        aria-label={`${label} submenu`}
                        style={{
                          marginLeft: 16,
                          marginTop: 4,
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        {submenu.map(({ label: subLabel, href: subHref }) => (
                          <Link
                            key={subLabel}
                            href={subHref}
                            role="menuitem"
                            style={{
                              color: "#ccc",
                              textDecoration: "none",
                              padding: "6px 10px",
                              borderRadius: 6,
                              fontWeight: 500,
                              userSelect: "none",
                              fontSize: "0.875rem",
                            }}
                          >
                            {subLabel}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main
            style={{
              flexGrow: 1,
              backgroundColor: "#222",
              borderRadius: "0 16px 16px 0",
              overflowY: "auto",
              padding: 24,
              boxSizing: "border-box",
              color: "#ddd",
              minHeight: "80vh",
            }}
          >
            <Updater />
          </main>
        </div>
      </div>
    </>
  );
}
