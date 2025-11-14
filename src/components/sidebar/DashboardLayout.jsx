"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChevronRight, FaBars, FaSearch, FaTimes } from "react-icons/fa";
import { navLinks } from "./navConfig";
import SidebarUserInfo from "./SidebarUserInfo";
import "./DashboardLayout.css";

const USER_KEY = "modix_user";
const THEME_KEY = "modix_dashboard_theme";

// Manually defined tags — nothing is auto-added
const displayTags = [
  { key: "Getting Started", label: "📘 Getting Started" },
  { key: "Frontend Issue", label: "🛠 Frontend Issue" },
  { key: "Backend Issue", label: "🖥 Backend Issue" },
  { key: "Game Server Issue", label: "⚠️ Game Server Issue" },
  { key: "Reported Bugs", label: "⚠️ Reported Bugs" },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [errorSearch, setErrorSearch] = useState("");
  const [selectedError, setSelectedError] = useState(null);
  const [activeTag, setActiveTag] = useState("");
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

  const mockErrorDatabase = [
    {
      code: "What Is Modix Game Panel?",
      desc: "Modix Game Panel is a long-term project by DaleMarkie (aka OV3RLORD), built to redefine server management for Project Zomboid and beyond. Over the past year, I’ve crafted a powerful, intuitive, and stylish panel from scratch, combining modern UI design with robust features. Modix offers complete server control, automated mod management, real time monitoring, and seamless updates all in one place. Modix is completely free for personal use under the personal license. Commercial use is not permitted, but you can request a commercial license through our Discord community. Click Support for more information. Looking forward, Modix will expand to support other Steam games and experimental Linux servers with Docker, making it a versatile, all-in-one game server solution. This is a long-term project that will continue to evolve, delivering more features, enhanced usability, and an even better experience for server administrators over time.",
      tags: ["Getting Started", "Modix"],
    },
  ];

  const allTags = useMemo(() => displayTags.map((t) => t.key), []);

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
      const isActive = href && pathname === href;

      return (
        <li
          key={href || label}
          className={`menu-item ${hasSubmenu ? "has-submenu" : ""} ${
            isActive ? "active" : ""
          }`}
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
            <Link
              href={href || "#"}
              className={`menu-link ${level > 0 ? "submenu-link" : ""}`}
              style={{ paddingLeft: `${level * 16 + 12}px` }}
            >
              {iconClass && <i className={`fa ${iconClass}`}></i>}
              {!sidebarOpen && <span className="menu-tooltip">{label}</span>}
              {sidebarOpen && <span className="menu-label">{label}</span>}
            </Link>
          )}
        </li>
      );
    });

  const activeBackground = theme.gradient
    ? theme.gradient
    : theme.background
    ? `url(${theme.background}) no-repeat center center / cover`
    : "#111";

  const filteredErrors = useMemo(() => {
    let result = mockErrorDatabase;

    if (activeTag) {
      result = result.filter((e) => e.tags.includes(activeTag));
    }

    if (errorSearch) {
      const term = errorSearch.toLowerCase();
      result = result.filter(
        (e) =>
          e.code.toLowerCase().includes(term) ||
          e.desc.toLowerCase().includes(term) ||
          e.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    return result;
  }, [errorSearch, activeTag]);

  const getTagLabel = (key) => {
    const found = displayTags.find((t) => t.key === key);
    return found ? found.label : key;
  };

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
              <Link href="/auth/login" className="auth-button">
                🔒 Login
              </Link>
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
              placeholder="Quickly search our documentation for Modix tips, guides, and game server error fixes."
              value={errorSearch}
              onChange={(e) => setErrorSearch(e.target.value)}
            />
          </div>

          {/* Tag Filters */}
          {(errorSearch || filteredErrors.length > 0) && (
            <div
              className="error-tag-filters"
              style={{
                margin: "0.5rem 0",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => setActiveTag("")}
                className={`tag-filter-button ${
                  activeTag === "" ? "active" : ""
                }`}
              >
                All
              </button>
              {displayTags.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() =>
                    setActiveTag((prev) => (prev === key ? "" : key))
                  }
                  className={`tag-filter-button ${
                    activeTag === key ? "active" : ""
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Display Results */}
          {errorSearch || activeTag ? (
            <div className="error-results">
              {filteredErrors.length > 0 ? (
                filteredErrors.map((e) => (
                  <div
                    key={e.code}
                    className="error-item"
                    onClick={() => setSelectedError(e)}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    <strong>{e.code}</strong>
                    <p>{e.desc}</p>
                    <div
                      className="error-tags"
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      {e.tags.map((tag) => (
                        <span key={tag} className="error-tag">
                          {getTagLabel(tag)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="error-item">
                  No errors or help documentation found. If stuck, reach out to
                  us on our discord.
                </div>
              )}
            </div>
          ) : null}

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

                <h2>⚠️ {selectedError.code}</h2>
                <p>{selectedError.desc}</p>

                <div className="error-tags">
                  {selectedError.tags.map((tag) => (
                    <span key={tag}>{getTagLabel(tag)}</span>
                  ))}
                </div>
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
