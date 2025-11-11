"use client";

import React, { useState, useEffect, useMemo } from "react";
import { FaChevronRight, FaBars, FaSearch, FaTimes } from "react-icons/fa";
import { navLinks } from "./navConfig";
import SidebarUserInfo from "./SidebarUserInfo";
import "./DashboardLayout.css";

const USER_KEY = "modix_user";
const THEME_KEY = "modix_dashboard_theme";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [errorSearch, setErrorSearch] = useState(""); // 🔍 right window search
  const [selectedError, setSelectedError] = useState(null); // modal
  const [theme, setTheme] = useState({
    background: "",
    gradient: "",
    logo: "https://i.ibb.co/cMPwcn8/logo.png",
    title: "Modix Game Panel",
    icons: {},
    menuOrder: [],
  });

  const [currentUserState, setCurrentUserState] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTheme(parsed);
        applyTheme(parsed);
      } catch {
        console.error("Failed to parse saved theme");
      }
    }

    const handleThemeUpdate = (e) => {
      if (e.detail) {
        setTheme(e.detail);
        applyTheme(e.detail);
      }
    };
    window.addEventListener("themeUpdate", handleThemeUpdate);

    return () => window.removeEventListener("themeUpdate", handleThemeUpdate);
  }, []);

  const applyTheme = (t) => {
    const body = document.body;
    if (t.gradient) body.style.background = t.gradient;
    else if (t.background) {
      body.style.background = `url(${t.background}) no-repeat center center fixed`;
      body.style.backgroundSize = "cover";
    } else body.style.background = "";
  };

  const allowedPages =
    currentUserState?.role === "Owner" ? null : currentUserState?.pages || [];

  const toggleSubMenu = (href) => {
    setOpenMenus((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  const filteredNavLinks = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filterLinks = (links) =>
      links
        .map(({ label, href = "", submenu }) => {
          if (!currentUserState && label.toLowerCase() !== "support")
            return null;

          const matchesSearch =
            !searchTerm ||
            label.toLowerCase().includes(lowerSearch) ||
            (href && href.toLowerCase().includes(lowerSearch));

          const hasPermission =
            !allowedPages ||
            allowedPages.includes(label) ||
            (href && allowedPages.includes(href.replace(/^\//, ""))) ||
            (href && allowedPages.includes(href));

          const filteredSubmenu = submenu ? filterLinks(submenu) : null;

          if (
            (matchesSearch && hasPermission) ||
            (filteredSubmenu && filteredSubmenu.length > 0)
          ) {
            return { label, href, submenu: filteredSubmenu };
          }
          return null;
        })
        .filter(Boolean);

    return filterLinks(navLinks);
  }, [searchTerm, allowedPages, currentUserState]);

  const renderMenuItems = (items, level = 0) =>
    items.map(({ label, href = "", submenu }) => {
      const isOpen = !!openMenus[href];
      const hasSubmenu = submenu && submenu.length > 0;
      const iconClass = theme.icons?.[label];

      return (
        <li
          key={href || label}
          className={`menu-item ${hasSubmenu ? "has-submenu" : ""}`}
          data-label={label}
        >
          {hasSubmenu ? (
            <>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`submenu-${label}`}
                onClick={() => toggleSubMenu(href || label)}
                className={`menu-button ${isOpen ? "open" : ""}`}
                style={{ paddingLeft: `${level * 16 + 12}px` }}
              >
                {iconClass && <i className={`fa ${iconClass}`}></i>}
                {!sidebarOpen && <span className="menu-tooltip">{label}</span>}
                {sidebarOpen && <span className="menu-label">{label}</span>}
                {sidebarOpen && (
                  <FaChevronRight
                    className={`chevron ${isOpen ? "rotated" : ""}`}
                    aria-hidden="true"
                  />
                )}
              </button>
              {sidebarOpen && hasSubmenu && (
                <ul
                  id={`submenu-${label}`}
                  className={`submenu ${isOpen ? "expanded" : "collapsed"}`}
                >
                  {renderMenuItems(submenu, level + 1)}
                </ul>
              )}
            </>
          ) : (
            <a
              href={href}
              className={`menu-link ${level > 0 ? "submenu-link" : ""}`}
              style={{ paddingLeft: `${level * 16 + 12}px` }}
            >
              {iconClass && <i className={`fa ${iconClass}`}></i>}
              {!sidebarOpen && <span className="menu-tooltip">{label}</span>}
              {sidebarOpen && <span className="menu-label">{label}</span>}
            </a>
          )}
        </li>
      );
    });

  const activeBackground = theme.gradient
    ? theme.gradient
    : theme.background
    ? `url(${theme.background}) no-repeat center center / cover`
    : "#111";

  // Mock database for game errors
  const mockErrorDatabase = [
    { code: "ERR1001", desc: "Failed to initialize Steam API." },
    { code: "ERR2002", desc: "Missing mod dependency." },
    { code: "ERR3003", desc: "Server config file not found." },
    { code: "ERR4004", desc: "Workshop item failed to download." },
  ];

  const filteredErrors = useMemo(() => {
    if (!errorSearch) return [];
    const term = errorSearch.toLowerCase();
    return mockErrorDatabase.filter(
      (e) =>
        e.code.toLowerCase().includes(term) ||
        e.desc.toLowerCase().includes(term)
    );
  }, [errorSearch]);

  return (
    <div className="dashboard-root">
      <div
        className="dashboard-background"
        style={{ background: activeBackground }}
      />
      <div className="dashboard-overlay" />

      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div
            className="sidebar-header"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <div className="sidebar-logo-row">
              <img alt="Modix Logo" className="sidebar-logo" src={theme.logo} />
              {sidebarOpen && (
                <span className="sidebar-title">{theme.title}</span>
              )}
              <button
                className="sidebar-toggle-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarOpen((v) => !v);
                }}
              >
                <FaBars />
              </button>
            </div>
          </div>

          {sidebarOpen && (
            <div className="sidebar-search">
              <input
                type="search"
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          <nav className="sidebar-menu-container">
            {filteredNavLinks.length > 0 ? (
              <ul>{renderMenuItems(filteredNavLinks)}</ul>
            ) : (
              <p style={{ padding: "1rem", color: "#888" }}>
                ⚠️ <strong>You must be logged in to gain permissions.</strong>
              </p>
            )}
          </nav>

          <SidebarUserInfo />

          <footer className="sidebar-footer">
            {currentUserState ? (
              <button
                className="auth-button"
                onClick={() => {
                  localStorage.removeItem(USER_KEY);
                  setCurrentUserState(null);
                }}
              >
                🔓 Logout (
                {currentUserState.username || currentUserState.name || "User"})
              </button>
            ) : (
              <a href="/auth/login" className="auth-button">
                🔒 Login
              </a>
            )}
          </footer>
        </aside>

        {/* Main Content */}
        <main>
          {/* Top Right Error Search */}
          <div className="error-search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search game code errors..."
              value={errorSearch}
              onChange={(e) => setErrorSearch(e.target.value)}
            />
          </div>

          {/* Display Results */}
          {errorSearch && (
            <div className="error-results">
              {filteredErrors.length > 0 ? (
                filteredErrors.map((e) => (
                  <div
                    key={e.code}
                    className="error-item"
                    onClick={() => setSelectedError(e)}
                    style={{ cursor: "pointer" }}
                  >
                    <strong>{e.code}</strong> — {e.desc}
                  </div>
                ))
              ) : (
                <div className="error-item">No matching errors found.</div>
              )}
            </div>
          )}

          {/* Modal Popup */}
          {selectedError && (
            <div
              className="error-modal-overlay"
              onClick={() => setSelectedError(null)}
            >
              <div className="error-modal" onClick={(e) => e.stopPropagation()}>
                <button
                  className="error-modal-close"
                  onClick={() => setSelectedError(null)}
                >
                  <FaTimes />
                </button>
                <h2>{selectedError.code}</h2>
                <p>{selectedError.desc}</p>
              </div>
            </div>
          )}

          <div className="content-inner">{children}</div>
          <div className="footer-text">© Modix Game Panel. 2024 - 2025</div>
        </main>
      </div>
    </div>
  );
}
