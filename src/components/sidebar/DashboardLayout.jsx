import React, { useState } from "react";
import { FaChevronRight, FaBars } from "react-icons/fa";
import { navLinks } from "./navConfig.ts";
import SidebarUserInfo from "./SidebarUserInfo";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Toggle submenu open state by href path (unique string)
  const toggleSubMenu = (href) => {
    setOpenMenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  // Filter navLinks and submenus by search term (case insensitive)
  const filteredNavLinks = navLinks
    .map(({ label, href, submenu }) => {
      if (!searchTerm) return { label, href, submenu };
      const lowerSearch = searchTerm.toLowerCase();
      const mainMatch = label.toLowerCase().includes(lowerSearch);

      let filteredSubmenu = null;
      if (submenu) {
        filteredSubmenu = submenu
          .map(({ label: sLabel, href: sHref, submenu: ss }) => {
            if (!ss) {
              return sLabel.toLowerCase().includes(lowerSearch)
                ? { label: sLabel, href: sHref }
                : null;
            } else {
              // filter second-level submenu too
              const filteredSubSubmenu = ss.filter((ssItem) =>
                ssItem.label.toLowerCase().includes(lowerSearch)
              );
              if (
                sLabel.toLowerCase().includes(lowerSearch) ||
                filteredSubSubmenu.length > 0
              ) {
                return {
                  label: sLabel,
                  href: sHref,
                  submenu: filteredSubSubmenu,
                };
              }
              return null;
            }
          })
          .filter(Boolean);
      }

      if (mainMatch || (filteredSubmenu && filteredSubmenu.length > 0)) {
        return { label, href, submenu: filteredSubmenu };
      }
      return null;
    })
    .filter(Boolean);

  // Recursive function to render menu with up to 2 submenu levels
  const renderMenuItems = (items, level = 0) => {
    return (
      <ul
        style={{
          listStyle: "none",
          margin: level === 0 ? 0 : "6px 0 6px 12px",
          paddingLeft: level === 0 ? 0 : "14px",
          borderLeft: level === 0 ? "none" : "2px solid #2a2a2a",
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        {items.map(({ label, href, submenu }) => {
          const isOpen = !!openMenus[href];
          const hasSubmenu = submenu && submenu.length > 0;

          if (hasSubmenu) {
            return (
              <li key={href} style={{ marginBottom: 10 }}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`submenu-${href}`}
                  onClick={() => toggleSubMenu(href)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    fontWeight: 600,
                    fontSize: level === 0 ? 15 : 14,
                    borderRadius: 8,
                    border: "none",
                    padding: level === 0 ? "10px 16px" : "8px 16px",
                    color: "#eee",
                    background: isOpen ? "#2a6e3a" : "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isOpen)
                      e.currentTarget.style.backgroundColor = "#237a30";
                  }}
                  onMouseLeave={(e) => {
                    if (!isOpen)
                      e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span>{label}</span>
                  <span
                    aria-hidden="true"
                    style={{
                      marginLeft: 8,
                      transition: "transform 0.3s ease",
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaChevronRight />
                  </span>
                </button>
                <ul
                  id={`submenu-${href}`}
                  role="region"
                  aria-label={`${label} submenu`}
                  style={{
                    maxHeight: isOpen ? "9999px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.35s ease",
                  }}
                >
                  {renderMenuItems(submenu, level + 1)}
                </ul>
              </li>
            );
          } else {
            // No submenu, simple link
            return (
              <li key={href} style={{ marginBottom: 8 }}>
                <a
                  href={href}
                  style={{
                    display: "block",
                    fontWeight: level === 0 ? 600 : 500,
                    fontSize: level === 0 ? 15 : 14,
                    padding: level === 0 ? "10px 16px" : "8px 16px",
                    color: level === 0 ? "#eee" : "#ccc",
                    borderRadius: 8,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "background-color 0.3s ease, color 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      level === 0 ? "#28a745" : "#218838";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = level === 0 ? "#eee" : "#ccc";
                  }}
                >
                  {label}
                </a>
              </li>
            );
          }
        })}
      </ul>
    );
  };

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
          color: #ddd;
        }
        .dashboard-root {
          position: relative;
          min-height: 100vh;
          width: 100vw;
          background: #121212;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 64px 16px 16px 16px;
          box-sizing: border-box;
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
          box-shadow: 0 12px 20px rgba(0,0,0,0.8), inset 0 0 30px rgba(255,255,255,0.05);
          overflow: hidden;
          min-height: 100vh;
        }
        .sidebar {
          background-color: #1c1c1c;
          color: #eee;
          display: flex;
          flex-direction: column;
          user-select: none;
          transition: width 0.35s ease, padding 0.35s ease;
          overflow: hidden;
          box-sizing: border-box;
          border-right: 1px solid #222;
        }
        .sidebar.open {
          width: 280px;
          padding: 12px 12px 16px 12px;
        }
        .sidebar.closed {
          width: 36px;
          padding: 8px 6px;
        }
        .sidebar-header {
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
          gap: 6px;
          cursor: pointer;
          user-select: none;
          outline: none;
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
          gap: 18px;
        }
        .sidebar-logo {
          width: 32px;
          height: 32px;
          user-select: none;
          pointer-events: none;
          border-radius: 6px;
          object-fit: contain;
        }
        .sidebar-title {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          user-select: none;
          flex-grow: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-toggle-button {
          font-size: 18px;
          color: #66bb6a;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          border: none;
          background: transparent;
          transition: color 0.3s ease;
          user-select: none;
        }
        .sidebar-toggle-button:hover {
          color: #4caf50;
        }
        .sidebar-search {
          width: 100%;
          margin-bottom: 14px;
          user-select: text;
        }
        .sidebar-search input {
          width: 100%;
          font-size: 14px;
          font-weight: 600;
          padding: 6px 10px;
          border-radius: 8px;
          border: none;
          outline: none;
          background: #2c2c2c;
          color: #ddd;
          user-select: text;
          box-sizing: border-box;
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        .sidebar-search input::placeholder {
          color: #999;
        }
        .sidebar-search input:focus {
          background: #3a3a3a;
          color: #fff;
        }
        .sidebar-menu-container {
          flex-grow: 1;
          overflow-y: auto;
          user-select: none;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #555 transparent;
        }
        .sidebar-menu-container::-webkit-scrollbar {
          width: 8px;
        }
        .sidebar-menu-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-menu-container::-webkit-scrollbar-thumb {
          background-color: #555;
          border-radius: 6px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .sidebar-footer {
          margin-top: 16px;
          padding-top: 8px;
          border-top: 1px solid #222;
          font-size: 13px;
          color: #666;
          text-align: center;
          user-select: none;
        }
        main {
          flex-grow: 1;
          padding: 18px 28px;
          background-color: #222;
          border-radius: 0 16px 16px 0;
          color: #eee;
          box-sizing: border-box;
          min-height: 100vh;
          overflow-y: auto;
        }
      `}</style>

      <div className="dashboard-root" role="main">
        <div aria-hidden="true" className="dashboard-overlay" />

        <div
          className="dashboard-container"
          role="region"
          aria-label="Main Dashboard Layout"
        >
          <aside
            className={`sidebar ${sidebarOpen ? "open" : "closed"}`}
            aria-label="Primary navigation sidebar"
          >
            <div
              tabIndex={0}
              className={`sidebar-header ${sidebarOpen ? "open" : "closed"}`}
              onClick={() => setSidebarOpen((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSidebarOpen((v) => !v);
                }
              }}
              role="button"
              aria-pressed={sidebarOpen}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <div className="sidebar-logo-row">
                <img
                  alt="Modix Logo"
                  className="sidebar-logo"
                  src="https://i.ibb.co/cMPwcn8/logo.png"
                  fetchPriority="high" // ✅ correct
                />
                {sidebarOpen && (
                  <span className="sidebar-title">Modix Game Panel</span>
                )}
                <button
                  aria-label={
                    sidebarOpen ? "Collapse sidebar" : "Expand sidebar"
                  }
                  className="sidebar-toggle-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSidebarOpen((v) => !v);
                  }}
                  title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                  tabIndex={-1}
                >
                  <FaBars />
                </button>
              </div>
            </div>

            {sidebarOpen && (
              <div className="sidebar-search" role="search">
                <input
                  type="search"
                  aria-label="Search navigation menu"
                  placeholder="Search menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            )}

            <nav
              className="sidebar-menu-container"
              aria-label="Sidebar navigation menu"
              role="navigation"
              tabIndex={-1}
            >
              {renderMenuItems(filteredNavLinks)}
            </nav>

            {sidebarOpen && <SidebarUserInfo />}
            {sidebarOpen && (
              <footer className="sidebar-footer" aria-hidden="true">
                &copy; 2025 Modix Game Panel
              </footer>
            )}
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </>
  );
}
