"use client";

import React, { useState, useEffect, useMemo } from "react";
import { FaChevronRight, FaBars } from "react-icons/fa";
import { navLinks } from "./navConfig";
import SidebarUserInfo from "./SidebarUserInfo";
import "./DashboardLayout.css";

const USER_KEY = "modix_user";
const THEME_KEY = "modix_dashboard_theme";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState({
    background: "",
    gradient: "",
    logo: "https://i.ibb.co/cMPwcn8/logo.png",
    title: "Modix Game Panel",
    icons: {},
    menuOrder: [],
  });

  // Track user state for React-only refresh
  const [currentUserState, setCurrentUserState] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Load theme on mount
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
        >
          {hasSubmenu ? (
            <>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`submenu-${label}`}
                onClick={() => toggleSubMenu(href || label)}
                className={`menu-button ${isOpen ? "open" : ""}`}
              >
                <span>
                  {iconClass && <i className={`fa ${iconClass}`}></i>} {label}
                </span>
                <FaChevronRight
                  className={`chevron ${isOpen ? "rotated" : ""}`}
                  aria-hidden="true"
                />
              </button>
              <ul
                id={`submenu-${label}`}
                role="region"
                aria-label={`${label} submenu`}
                className={`submenu ${isOpen ? "expanded" : "collapsed"}`}
              >
                {renderMenuItems(submenu, level + 1)}
              </ul>
            </>
          ) : (
            <a
              href={href}
              className={`menu-link ${level > 0 ? "submenu-link" : ""}`}
              style={{ paddingLeft: `${level * 16 + 12}px` }}
            >
              {iconClass && <i className={`fa ${iconClass}`}></i>} {label}
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

  return (
    <div className="dashboard-root">
      <div
        className="dashboard-background"
        style={{ background: activeBackground }}
      />
      <div className="dashboard-overlay" />

      <div className="dashboard-container">
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div
            className="sidebar-header"
            tabIndex={0}
            onClick={() => setSidebarOpen((v) => !v)}
            role="button"
            aria-pressed={sidebarOpen}
          >
            <div className="sidebar-logo-row">
              <img
                alt="Modix Logo"
                className="sidebar-logo"
                src={theme.logo || "https://i.ibb.co/cMPwcn8/logo.png"}
              />
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
            <>
              <div className="sidebar-search">
                <input
                  type="search"
                  placeholder="Search menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <nav className="sidebar-menu-container">
                {filteredNavLinks.length > 0 ? (
                  <ul>
                    {theme.menuOrder.length > 0
                      ? renderMenuItems(
                          filteredNavLinks.sort(
                            (a, b) =>
                              theme.menuOrder.indexOf(a.label) -
                              theme.menuOrder.indexOf(b.label)
                          )
                        )
                      : renderMenuItems(filteredNavLinks)}
                  </ul>
                ) : (
                  <p style={{ padding: "1rem", color: "#888" }}>
                    ⚠️{" "}
                    <strong>You must be logged in to gain permissions.</strong>
                  </p>
                )}
              </nav>

              <SidebarUserInfo />

              <footer className="sidebar-footer">
                {currentUserState ? (
                  <button
                    className="auth-button"
                    onClick={() => {
                      // Remove user and refresh React state only
                      localStorage.removeItem(USER_KEY);
                      setCurrentUserState(null);
                    }}
                  >
                    🔓 Logout (
                    {currentUserState.username ||
                      currentUserState.name ||
                      "User"}
                    )
                  </button>
                ) : (
                  <a href="/auth/login" className="auth-button">
                    🔒 Login
                  </a>
                )}
              </footer>
            </>
          )}
        </aside>

        <main>
          <div className="content-inner">{children}</div>
          <div
            style={{
              marginTop: "16px",
              textAlign: "center",
              fontSize: "12px",
              color: "#888",
            }}
          >
            © Modix Game Panel. 2024 - 2025
          </div>
        </main>
      </div>
    </div>
  );
}
