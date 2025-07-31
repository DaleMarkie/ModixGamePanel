import React, { useState, useEffect } from "react";
import {
  FaLaptop,
  FaServer,
  FaUser,
  FaChevronDown,
  FaChevronRight,
  FaBars,
} from "react-icons/fa";
import { navLinks } from "./navConfig.ts";
import SidebarUserInfo from "./SidebarUserInfo";

export default function DashboardLayout({ children }) {
  const [serverInfo, setServerInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

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
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          background: #121212;
        }
        .dashboard-root {
          position: relative;
          min-height: 100vh;
          width: 100vw;
          background: #121212;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 65px;
          box-sizing: border-box;
          color: #ddd;
        }
        .dashboard-overlay {
          position: fixed;
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
          min-height: 100vh;
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
          width: 240px;
          padding: 16px 16px;
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
          font-size: 13px;
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
          display: flex;
          flex-direction: column;
        }
        nav ul {
          list-style: none;
          padding-left: 0;
          margin: 0;
          user-select: none;
          flex-shrink: 0;
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
          background-color: #28a745;
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
          background-color: #218838;
          color: white;
        }
        nav li button .icon {
          margin-left: 6px;
          transition: transform 0.3s ease;
        }
        nav li button .icon.rotate {
          transform: rotate(90deg);
        }
        .server-info-section {
          background-color: #222;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 20px; /* moved margin to bottom so spacing below */
          font-size: 12px;
          color: #aaa;
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
        }
        .server-info-value {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
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
        }
        .search-input::placeholder {
          font-weight: 600;
          color: #555;
          font-style: italic;
        }
        .modix-footer {
          width: 100%;
          text-align: center;
          padding: 10px 0;
          font-size: 13px;
          color: #999;
          background-color: #1a1a1a;
          border-top: 1px solid #333;
        }
      `}</style>

      <div className="dashboard-root" role="main" aria-label="Modix Dashboard">
        <div className="dashboard-overlay" aria-hidden="true" />
        <div className="dashboard-container" tabIndex={-1}>
          {/* Sidebar */}
          <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
            <div
              className={`sidebar-header ${sidebarOpen ? "open" : "closed"}`}
              onClick={() => setSidebarOpen((v) => !v)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") &&
                setSidebarOpen((v) => !v)
              }
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
                <button
                  className="sidebar-toggle-button"
                  aria-label={
                    sidebarOpen ? "Collapse sidebar" : "Expand sidebar"
                  }
                  onClick={() => setSidebarOpen((v) => !v)}
                  tabIndex={-1}
                >
                  <FaBars />
                </button>
              </div>
              {sidebarOpen && <SidebarUserInfo />}
            </div>

            {/* Search input */}
            <input
              type="search"
              className="search-input"
              placeholder="Search menu"
              aria-label="Search menu"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
            {/* Navigation */}
            <nav role="navigation" aria-label="Main menu">
              <ul>
                {filteredNavLinks.map(({ label, href, submenu }) => (
                  <li key={href}>
                    {submenu ? (
                      <>
                        <button
                          type="button"
                          aria-expanded={!!openMenus[href]}
                          aria-controls={`submenu-${href}`}
                          onClick={() => toggleSubMenu(href)}
                        >
                          <span>{label}</span>
                          <span
                            className={`icon ${
                              openMenus[href] ? "rotate" : ""
                            }`}
                            aria-hidden="true"
                          >
                            <FaChevronRight />
                          </span>
                        </button>
                        <ul
                          id={`submenu-${href}`}
                          role="region"
                          aria-label={`${label} submenu`}
                          style={{
                            maxHeight: openMenus[href] ? "200px" : "0px",
                            transition: "max-height 0.3s ease",
                          }}
                        >
                          {submenu.map(({ label: subLabel, href: subHref }) => (
                            <li key={subHref}>
                              <a href={subHref}>{subLabel}</a>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <a href={href}>{label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            <footer className="modix-footer" aria-hidden="true">
              Modix: Game Panel v1.1.2
            </footer>
          </aside>
          {/* Main content */}
          <main
            className="dashboard-content"
            style={{ flexGrow: 1, padding: "20px", overflowY: "auto" }}
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
