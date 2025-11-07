"use client";

import React, { useState, useMemo, useEffect } from "react";
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
    logo: "https://i.ibb.co/cMPwcn8/logo.png",
    title: "Modix Game Panel",
    icons: {},
    menuOrder: navLinks.map((i) => i.label),
  });

  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) setTheme(JSON.parse(savedTheme));
  }, []);

  const allowedPages =
    currentUser?.role === "Owner" ? null : currentUser?.pages || [];

  const toggleSubMenu = (href) => {
    setOpenMenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  const filteredNavLinks = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filterLinks = (links) =>
      links
        .map(({ label, href = "", submenu }) => {
          if (!currentUser && label.toLowerCase() !== "support") return null;

          const matchesSearch =
            !searchTerm ||
            label.toLowerCase().includes(lowerSearch) ||
            (href && href.toLowerCase().includes(lowerSearch));

          const hasPermission =
            !allowedPages ||
            allowedPages.includes(label) ||
            (href && allowedPages.includes(href.replace(/^\//, ""))) ||
            (href && allowedPages.includes(href));

          let filteredSubmenu = submenu ? filterLinks(submenu) : null;

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
  }, [searchTerm, allowedPages, currentUser]);

  const orderedNavLinks = useMemo(() => {
    return theme.menuOrder
      .map((label) => filteredNavLinks.find((i) => i.label === label))
      .filter(Boolean);
  }, [theme, filteredNavLinks]);

  const renderMenuItems = (items, level = 0) => (
    <ul className={`menu-level-${level}`}>
      {items.map(({ label, href = "", submenu }) => {
        const iconClass = theme.icons[label];
        const isOpen = !!openMenus[href];
        const hasSubmenu = submenu && submenu.length > 0;

        return hasSubmenu ? (
          <li key={label} className="menu-item has-submenu">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`submenu-${label}`}
              onClick={() => toggleSubMenu(href || label)}
              className={`menu-button ${isOpen ? "open" : ""}`}
            >
              {iconClass && <i className={`fa ${iconClass}`} />}
              <span>{label}</span>
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
          </li>
        ) : (
          <li key={href || label} className="menu-item">
            <a href={href} className={`menu-link level-${level}`}>
              {iconClass && <i className={`fa ${iconClass}`} />}
              {label}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div
      className="dashboard-root"
      style={{
        backgroundImage: theme.background ? `url(${theme.background})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
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
              <img alt="Logo" className="sidebar-logo" src={theme.logo} />
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
            {orderedNavLinks.length > 0 ? (
              renderMenuItems(orderedNavLinks)
            ) : (
              <p style={{ padding: "1rem", color: "#888" }}>No access</p>
            )}
          </nav>

          {sidebarOpen && currentUser && <SidebarUserInfo />}

          {sidebarOpen && (
            <footer className="sidebar-footer">
              {currentUser ? (
                <button
                  className="auth-button"
                  onClick={() => {
                    localStorage.removeItem(USER_KEY);
                    window.location.reload();
                  }}
                >
                  🔓 Logout (
                  {currentUser.username || currentUser.name || "User"})
                </button>
              ) : (
                <a href="/auth/login" className="auth-button">
                  🔒 Login
                </a>
              )}
              <div style={{ marginTop: "8px", fontSize: "0.8rem" }}>
                &copy; 2024 - 2025 Modix Game Panel
              </div>
            </footer>
          )}
        </aside>

        <main className="main-scrollbox">{children}</main>
      </div>
    </div>
  );
}
