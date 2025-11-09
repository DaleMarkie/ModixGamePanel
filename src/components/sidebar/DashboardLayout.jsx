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
    gradient: "",
    logo: "https://i.ibb.co/cMPwcn8/logo.png",
    title: "Modix Game Panel",
    icons: {},
    menuOrder: [],
  });

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      try {
        setTheme(JSON.parse(saved));
      } catch {
        console.error("Failed to parse saved theme");
      }
    }
  }, []);

  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
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
  }, [searchTerm, allowedPages, currentUser]);

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
                className={`menu-button ${isOpen ? "open" : ""} ${
                  !sidebarOpen ? "icon-only" : ""
                }`}
                title={!sidebarOpen ? label : ""}
              >
                {iconClass && <i className={`fa ${iconClass}`}></i>}
                {sidebarOpen && <span>{label}</span>}
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
              className={`menu-link ${!sidebarOpen ? "icon-only" : ""} ${
                level > 0 ? "submenu-link" : ""
              }`}
              title={!sidebarOpen ? label : ""}
              style={{ paddingLeft: sidebarOpen ? `${level * 16 + 12}px` : "" }}
            >
              {iconClass && <i className={`fa ${iconClass}`}></i>}
              {sidebarOpen && <span>{label}</span>}
            </a>
          )}
        </li>
      );
    });

  return (
    <div className="dashboard-root">
      <div
        className="dashboard-background"
        style={{
          backgroundImage:
            theme.gradient && theme.gradient !== ""
              ? theme.gradient
              : theme.background && theme.background !== ""
              ? `url(${theme.background})`
              : "none",
        }}
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
            </div>
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

          {sidebarOpen && (
            <div className="sidebar-auth-top">
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
            </div>
          )}

          <div className="sidebar-search">
            <input
              type="search"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <nav
            className={`sidebar-menu-container ${
              !sidebarOpen ? "collapsed" : ""
            }`}
          >
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
                ⚠️ <strong>You must be logged in to gain permissions.</strong>
              </p>
            )}
          </nav>

          <SidebarUserInfo />

          <footer className="sidebar-footer">v1.12</footer>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
