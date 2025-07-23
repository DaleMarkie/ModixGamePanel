import React, { useState, useEffect } from "react";
import {
  FaLaptop,
  FaServer,
  FaUser,
  FaChevronDown,
  FaChevronRight,
  FaBars,
} from "react-icons/fa";

const navLinks = [
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
  { label: "🖥️ Terminal", href: "/terminal" },
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
        return { label, href, submenu: filteredSubmenu };
      }
      return null;
    })
    .filter(Boolean);

  return (
    <>
      <style>{`
        .dashboard-root {
          min-height: 2vh;
          background-color: rgb(18, 18, 18);
          padding: 65px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          box-sizing: border-box;
          background-image: url('https://images7.alphacoders.com/627/627909.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          position: relative;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
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
          max-width: 1280px;
          width: 100%;
          background-color: #181818;
          border-radius: 16px;
          box-shadow: 0 10px 15px rgba(0,0,0,0.7), inset 0 0 30px rgba(255,255,255,0.03);
          overflow: hidden;
          min-height: 44vh;
        }
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
          gap: 10px;
          cursor: pointer;
        }
        .sidebar-logo-text {
          font-size: 16px;
          font-weight: 600;
          color: white;
          user-select: none;
          flex-grow: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-toggle-button {
          border: none;
          background: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          font-size: 16px;
          padding: 2px 6px;
          border-radius: 6px;
          transition: background-color 0.3s ease;
        }
        .sidebar-toggle-button:hover {
          background-color: #28a745;
        }
        nav {
          flex-grow: 1;
          overflow-y: auto;
          padding-right: 6px;
        }
        nav ul {
          list-style: none;
          padding-left: 0;
          margin: 0;
          user-select: none;
        }
        nav li {
          margin-bottom: 8px;
        }
        nav li a, nav li button {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          font-weight: 600;
          font-size: 14px;
          border-radius: 10px;
          border: none;
          padding: 10px 14px;
          color: #eee;
          background: none;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.3s ease, color 0.3s ease;
          user-select: none;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        nav li a:hover, nav li button:hover {
          background-color: #28a745; /* Green hover */
          color: white;
        }
        nav li ul {
          list-style: none;
          margin-top: 6px;
          margin-left: 4px;
          padding-left: 10px;
          border-left: 1px solid #444;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        nav li ul li a {
          padding: 6px 14px;
          font-weight: 500;
          font-size: 13px;
          color: #ccc;
        }
        nav li ul li a:hover {
          background-color: #218838; /* Darker green for submenu */
          color: white;
        }
        nav li button .icon {
          margin-left: 6px;
          transition: transform 0.3s ease;
          user-select: none;
        }
        nav li button .icon.rotate {
          transform: rotate(90deg);
        }
        .server-info-section {
          background-color: #222;
          border-radius: 10px;
          padding: 12px 14px;
          margin-top: 20px;
          font-size: 12px;
          color: #aaa;
          user-select: none;
        }
        .server-info-item {
          display: flex;
          align-items: center;
          margin-bottom: 6px;
          gap: 6px;
          white-space: nowrap;
        }
        .server-info-icon {
          color: #28a745;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
        }
        .server-info-label {
          font-weight: 600;
          color: #eee;
          flex-shrink: 0;
          min-width: 65px;
          user-select: text;
        }
        .server-info-value {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          user-select: text;
        }
        .search-input {
          margin-bottom: 16px;
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          color: #222;
          background-color: #e0e0e0;
          outline: none;
          user-select: text;
        }
        .search-input::placeholder {
          font-weight: 600;
          color: #555;
          font-style: italic;
        }
      `}</style>

      <div className="dashboard-root" role="main" aria-label="Modix Dashboard">
        <div className="dashboard-overlay" aria-hidden="true" />
        <div className="dashboard-container" tabIndex={-1}>
          <aside
            className={`sidebar ${sidebarOpen ? "open" : "closed"}`}
            aria-label="Primary Sidebar Navigation"
          >
            <div
              className={`sidebar-header ${sidebarOpen ? "open" : "closed"}`}
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  setSidebarOpen((v) => !v);
              }}
            >
              <div
                className="sidebar-logo-row"
                aria-live="polite"
                aria-atomic="true"
              >
                {sidebarOpen && (
                  <span className="sidebar-logo-text">Modix Game Panel</span>
                )}
                <button
                  className="sidebar-toggle-button"
                  aria-pressed={sidebarOpen}
                  aria-label={
                    sidebarOpen ? "Collapse sidebar" : "Expand sidebar"
                  }
                >
                  <FaBars />
                </button>
              </div>
              {sidebarOpen && (
                <input
                  type="search"
                  className="search-input"
                  placeholder="Search menu…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search sidebar menu"
                />
              )}
            </div>

            <nav role="navigation" aria-label="Sidebar menu">
              <ul>
                {filteredNavLinks.map(({ label, href, submenu }) => {
                  const isOpen = openMenus[href] || false;

                  if (submenu && submenu.length > 0) {
                    return (
                      <li key={href}>
                        <button
                          aria-expanded={isOpen}
                          aria-controls={`submenu-${href}`}
                          onClick={() => toggleSubMenu(href)}
                          aria-haspopup="true"
                          type="button"
                          title={label}
                          className="menu-button"
                        >
                          <span
                            aria-hidden="true"
                            style={{
                              flexGrow: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {label}
                          </span>
                          <span className={`icon ${isOpen ? "rotate" : ""}`}>
                            <FaChevronRight />
                          </span>
                        </button>
                        {isOpen && (
                          <ul
                            id={`submenu-${href}`}
                            role="menu"
                            aria-label={`${label} submenu`}
                          >
                            {submenu.map(
                              ({ label: subLabel, href: subHref }) => (
                                <li key={subHref}>
                                  <a
                                    href={subHref}
                                    role="menuitem"
                                    title={subLabel}
                                  >
                                    {subLabel}
                                  </a>
                                </li>
                              )
                            )}
                          </ul>
                        )}
                      </li>
                    );
                  }

                  return (
                    <li key={href}>
                      <a href={href} title={label}>
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>

              <SidebarUserInfo
                hostname={serverInfo?.hostname}
                container={serverInfo?.container}
                loggedInUser={serverInfo?.loggedInUser}
              />
            </nav>
          </aside>

          <main
            aria-label="Main content area"
            style={{
              flexGrow: 1,
              backgroundColor: "#1c1c1c",
              borderRadius: 16,
              marginLeft: 16,
              padding: 24,
              color: "#ddd",
              userSelect: "text",
            }}
          >
            <h1>Welcome to Modix Dashboard</h1>
            <p>Here you will find your server and account controls.</p>
            {/* Replace this with your actual content */}
          </main>
        </div>
      </div>
    </>
  );
}
