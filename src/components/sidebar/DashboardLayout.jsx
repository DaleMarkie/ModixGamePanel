"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChevronRight, FaBars } from "react-icons/fa";
import { navLinks } from "./navConfig";
import SidebarUserInfo from "./SidebarUserInfo";
import "./DashboardLayout.css";

const USER_KEY = "modix_user";
const THEME_KEY = "modix_dashboard_theme";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState({
    background: "",
    gradient: "",
    logo: "https://i.ibb.co/cMPwcn8/logo.png",
    title: "Modix Game Panel",
    icons: {},
  });

  const [currentUserState, setCurrentUserState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Load theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTheme(parsed);
        applyTheme(parsed);
      } catch {}
    }

    const handle = (e) => {
      if (e.detail) {
        setTheme(e.detail);
        applyTheme(e.detail);
      }
    };

    window.addEventListener("themeUpdate", handle);
    return () => window.removeEventListener("themeUpdate", handle);
  }, []);

  const applyTheme = (t) => {
    document.body.style.background =
      t.gradient ||
      (t.background ? `url(${t.background}) no-repeat center/cover` : "");
  };

  // Determine allowed pages
  const allowedPages =
    currentUserState?.role === "Owner" ? null : currentUserState?.pages || [];

  const toggleSubMenu = (href) =>
    setOpenMenus((prev) => ({ ...prev, [href]: !prev[href] }));

  // Filter nav links based on search and permissions
  const filteredNavLinks = useMemo(() => {
    const lower = searchTerm.toLowerCase();

    const filterLinks = (links) =>
      links
        .map(({ label, href = "", submenu }) => {
          if (!currentUserState && label.toLowerCase() !== "support")
            return null;

          const matches =
            !searchTerm ||
            label.toLowerCase().includes(lower) ||
            (href && href.toLowerCase().includes(lower));

          const allowed =
            !allowedPages ||
            allowedPages.includes(label) ||
            (href && allowedPages.includes(href.replace(/^\//, ""))) ||
            (href && allowedPages.includes(href));

          const sub = submenu ? filterLinks(submenu) : null;

          return matches && allowed
            ? { label, href, submenu: sub }
            : sub && sub.length
            ? { label, href, submenu: sub }
            : null;
        })
        .filter(Boolean);

    return filterLinks(navLinks);
  }, [searchTerm, allowedPages, currentUserState]);

  // Simple loading effect
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Recursive menu rendering
  const renderMenuItems = (items, level = 0) =>
    items.map(({ label, href = "", submenu }) => {
      const isOpen = !!openMenus[href];
      const hasSub = submenu?.length;
      const isActive = href && pathname === href;
      const iconClass = theme.icons?.[label];

      if (hasSub) {
        return (
          <li
            key={href || label}
            className={`menu-item has-submenu ${isActive ? "active" : ""}`}
          >
            <button
              className={`menu-button ${isOpen ? "open" : ""}`}
              style={{ paddingLeft: level * 16 + 12 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSubMenu(href || label);
              }}
            >
              {iconClass && <i className={`fa ${iconClass}`}></i>}
              {!sidebarOpen ? (
                <span className="menu-tooltip">{label}</span>
              ) : (
                <span className="menu-label">{label}</span>
              )}
              {sidebarOpen && (
                <FaChevronRight
                  className={`chevron ${isOpen ? "rotated" : ""}`}
                />
              )}
            </button>

            {sidebarOpen && (
              <ul className={`submenu ${isOpen ? "expanded" : "collapsed"}`}>
                {renderMenuItems(submenu, level + 1)}
              </ul>
            )}
          </li>
        );
      }

      return (
        <li
          key={href || label}
          className={`menu-item ${isActive ? "active" : ""}`}
        >
          <Link
            href={href || "#"}
            onClick={(e) => e.stopPropagation()}
            className={`menu-link ${level > 0 ? "submenu-link" : ""}`}
            style={{ paddingLeft: level * 16 + 12 }}
          >
            {iconClass && <i className={`fa ${iconClass}`}></i>}
            {!sidebarOpen ? (
              <span className="menu-tooltip">{label}</span>
            ) : (
              <span className="menu-label">{label}</span>
            )}
          </Link>
        </li>
      );
    });

  const activeBackground =
    theme.gradient ||
    (theme.background
      ? `url(${theme.background}) no-repeat center/cover`
      : "#111");

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
            onClick={() => setSidebarOpen((v) => !v)}
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
              <Link href="/auth/login" className="auth-button">
                🔒 Login
              </Link>
            )}
          </footer>
        </aside>

        <main className={`main-content ${loading ? "loading" : "loaded"}`}>
          <div className="content-inner">{children}</div>
          <div className="footer-text">© Modix Game Panel. 2024 - 2025</div>
        </main>
      </div>
    </div>
  );
}
