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
  const [errorSearch, setErrorSearch] = useState("");
  const [selectedError, setSelectedError] = useState(null);
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

  // Mock database for game errors with tags
  const mockErrorDatabase = [
    {
      code: "What Is Modix Game Panel?",
      desc: "Modix Game Panel is a long-term project by DaleMarkie (aka OV3RLORD), built to redefine server management for Project Zomboid and beyond. Over the past year, I’ve crafted a powerful, intuitive, and stylish panel from scratch, combining modern UI design with robust features. Modix offers complete server control, automated mod management, real time monitoring, and seamless updates all in one place. Modix is completely free for personal use under the personal license. Commercial use is not permitted, but you can request a commercial license through our Discord community. Click Support for more information. Looking forward, Modix will expand to support other Steam games and experimental Linux servers with Docker, making it a versatile, all-in-one game server solution. This is a long-term project that will continue to evolve, delivering more features, enhanced usability, and an even better experience for server administrators over time.",
      tags: ["Getting Started", "Modix"],
    },
    {
      code: "Dashboard?",
      desc: "If the API fails to start, open your terminal and review the error messages carefully. They usually indicate either a coding issue—like a syntax error, undefined variable, or incorrect import—or a missing Python module. For missing modules, the error will appear as `ModuleNotFoundError: No module named 'X'`. You can fix this by running `pip install X`. Always read the full traceback, as it shows the exact file and line number where the problem occurred, helping you quickly identify whether it’s a bug in your code or a missing dependency.",
      tags: ["My Account"],
    },
    {
      code: "Activity?",
      desc: "If the API fails to start, open your terminal and review the error messages carefully. They usually indicate either a coding issue—like a syntax error, undefined variable, or incorrect import—or a missing Python module. For missing modules, the error will appear as `ModuleNotFoundError: No module named 'X'`. You can fix this by running `pip install X`. Always read the full traceback, as it shows the exact file and line number where the problem occurred, helping you quickly identify whether it’s a bug in your code or a missing dependency.",
      tags: ["My Account"],
    },
    {
      code: "My License",
      desc: "Workshop item failed to download.",
      tags: ["My Account"],
    },
    {
      code: "Staff Accounts",
      desc: "Workshop item failed to download.",
      tags: ["My Account"],
    },
    {
      code: "Settings",
      desc: "Workshop item failed to download.",
      tags: ["My Account"],
    },
    {
      code: "Console?",
      desc: "The Terminal component is a powerful, all in one web based console that gives users complete control over their Project Zomboid server, allowing them to start, stop, and manage the server with a single click, send live server commands like saving the world, listing or kicking players, banning users, and reloading scripts, while also providing real time log streaming with search and auto scroll features, the ability to clear or copy logs, and integrated performance monitoring, enabling both new and experienced users to efficiently run, monitor, and troubleshoot their server entirely from the browser without ever touching the command line.",
      tags: ["Console", "Documentation "],
    },
    {
      code: "ModManager?",
      desc: "The Mod Manager is an all in one browser based tool that allows users to browse, search, and organize their game mods, create, edit, move, or delete files and folders within mods, manage favorites, customize colors, open multiple files in a live code editor with syntax highlighting, save changes in real time, and instantly refresh mod data all without leaving the panel, giving complete control over mod development and server content.",
      tags: ["My Mods", "Documentation "],
    },
    {
      code: "Change Game?",
      desc: "You can browse and manage all supported game servers available in your panel. Each game card provides a quick overview, including the game’s description, Steam and Discord links, and whether it’s currently supported. By selecting your game, some of the panel settings will automatically update for example, your Mods, Workshop, and Server Settings so you can seamlessly manage everything without extra steps. You can search for games, view upcoming titles marked as “Coming Soon,” and activate your preferred game server directly from the interface. For supported games like Project Zomboid, you can also create a new server session by specifying the batch file path, giving you full control to launch and manage your dedicated server. Easily access community resources, guides, and official wikis right from the page, making setup and management simple for both new and experienced users.",
      tags: ["My Server", "Documentation "],
    },
    {
      code: "Server Settings?",
      desc: "This is where you can easily configure and organize your game server for your selected game. By choosing a game, the panel automatically loads all relevant settings, including core server options like Server Name, Max Players, and gameplay-specific options such as Zombie Count or XP Multiplier for Project Zomboid. Some panel settings, including Mods, Workshop, and other game-specific configurations, will also update automatically based on your selected game. Use the intuitive left and right panels to manage your server path and detailed settings, toggle categories for easier navigation, and save your changes with a single click. Whether you’re new or experienced, this page simplifies server setup and ensures you can get your server running smoothly.",
      tags: ["My Server", "Documentation "],
    },
    {
      code: "BackUp?",
      desc: "This is where you can easily configure and organize your game server for your selected game. By choosing a game, the panel automatically loads all relevant settings, including core server options like Server Name, Max Players, and gameplay-specific options such as Zombie Count or XP Multiplier for Project Zomboid. Some panel settings, including Mods, Workshop, and other game-specific configurations, will also update automatically based on your selected game. Use the intuitive left and right panels to manage your server path and detailed settings, toggle categories for easier navigation, and save your changes with a single click. Whether you’re new or experienced, this page simplifies server setup and ensures you can get your server running smoothly.",
      tags: ["My Server", "Documentation "],
    },
    {
      code: "Workshop Manager?",
      desc: "This is where you can easily configure and organize your game server for your selected game. By choosing a game, the panel automatically loads all relevant settings, including core server options like Server Name, Max Players, and gameplay-specific options such as Zombie Count or XP Multiplier for Project Zomboid. Some panel settings, including Mods, Workshop, and other game-specific configurations, will also update automatically based on your selected game. Use the intuitive left and right panels to manage your server path and detailed settings, toggle categories for easier navigation, and save your changes with a single click. Whether you’re new or experienced, this page simplifies server setup and ensures you can get your server running smoothly.",
      tags: ["My Mods", "Documentation "],
    },
    {
      code: "Check Mod Updates?",
      desc: "This is where you can easily configure and organize your game server for your selected game. By choosing a game, the panel automatically loads all relevant settings, including core server options like Server Name, Max Players, and gameplay-specific options such as Zombie Count or XP Multiplier for Project Zomboid. Some panel settings, including Mods, Workshop, and other game-specific configurations, will also update automatically based on your selected game. Use the intuitive left and right panels to manage your server path and detailed settings, toggle categories for easier navigation, and save your changes with a single click. Whether you’re new or experienced, this page simplifies server setup and ensures you can get your server running smoothly.",
      tags: ["My Mods", "Documentation "],
    },
    {
      code: "Create Mod?",
      desc: "This is where you can easily configure and organize your game server for your selected game. By choosing a game, the panel automatically loads all relevant settings, including core server options like Server Name, Max Players, and gameplay-specific options such as Zombie Count or XP Multiplier for Project Zomboid. Some panel settings, including Mods, Workshop, and other game-specific configurations, will also update automatically based on your selected game. Use the intuitive left and right panels to manage your server path and detailed settings, toggle categories for easier navigation, and save your changes with a single click. Whether you’re new or experienced, this page simplifies server setup and ensures you can get your server running smoothly.",
      tags: ["My Mods", "Documentation "],
    },
    {
      code: "Manage Assets",
      desc: "This is where you can easily configure and organize your game server for your selected game. By choosing a game, the panel automatically loads all relevant settings, including core server options like Server Name, Max Players, and gameplay-specific options such as Zombie Count or XP Multiplier for Project Zomboid. Some panel settings, including Mods, Workshop, and other game-specific configurations, will also update automatically based on your selected game. Use the intuitive left and right panels to manage your server path and detailed settings, toggle categories for easier navigation, and save your changes with a single click. Whether you’re new or experienced, this page simplifies server setup and ensures you can get your server running smoothly.",
      tags: ["My Mods", "Documentation "],
    },
    {
      code: "Players?",
      desc: "This is where you can easily configure and organize your game server for your selected game. By choosing a game, the panel automatically loads all relevant settings, including core server options like Server Name, Max Players, and gameplay-specific options such as Zombie Count or XP Multiplier for Project Zomboid. Some panel settings, including Mods, Workshop, and other game-specific configurations, will also update automatically based on your selected game. Use the intuitive left and right panels to manage your server path and detailed settings, toggle categories for easier navigation, and save your changes with a single click. Whether you’re new or experienced, this page simplifies server setup and ensures you can get your server running smoothly.",
      tags: ["Players", "Documentation "],
    },
    {
      code: "Monitoring?",
      desc: "This is where you can easily configure and organize your game server for your selected game. By choosing a game, the panel automatically loads all relevant settings, including core server options like Server Name, Max Players, and gameplay-specific options such as Zombie Count or XP Multiplier for Project Zomboid. Some panel settings, including Mods, Workshop, and other game-specific configurations, will also update automatically based on your selected game. Use the intuitive left and right panels to manage your server path and detailed settings, toggle categories for easier navigation, and save your changes with a single click. Whether you’re new or experienced, this page simplifies server setup and ensures you can get your server running smoothly.",
      tags: ["Monitoring", "Documentation "],
    },
    {
      code: "Ddos Manager?",
      desc: "This is where you can easily configure and organize your game server for your selected game. By choosing a game, the panel automatically loads all relevant settings, including core server options like Server Name, Max Players, and gameplay-specific options such as Zombie Count or XP Multiplier for Project Zomboid. Some panel settings, including Mods, Workshop, and other game-specific configurations, will also update automatically based on your selected game. Use the intuitive left and right panels to manage your server path and detailed settings, toggle categories for easier navigation, and save your changes with a single click. Whether you’re new or experienced, this page simplifies server setup and ensures you can get your server running smoothly.",
      tags: ["Security", "Documentation "],
    },
    {
      code: "FireWall Rules?",
      desc: "This is where you can easily configure and organize your game server for your selected game. By choosing a game, the panel automatically loads all relevant settings, including core server options like Server Name, Max Players, and gameplay-specific options such as Zombie Count or XP Multiplier for Project Zomboid. Some panel settings, including Mods, Workshop, and other game-specific configurations, will also update automatically based on your selected game. Use the intuitive left and right panels to manage your server path and detailed settings, toggle categories for easier navigation, and save your changes with a single click. Whether you’re new or experienced, this page simplifies server setup and ensures you can get your server running smoothly.",
      tags: ["Security", "Documentation "],
    },
    {
      code: "Check Ports?",
      desc: "This is where you can easily configure and organize your game server for your selected game. By choosing a game, the panel automatically loads all relevant settings, including core server options like Server Name, Max Players, and gameplay-specific options such as Zombie Count or XP Multiplier for Project Zomboid. Some panel settings, including Mods, Workshop, and other game-specific configurations, will also update automatically based on your selected game. Use the intuitive left and right panels to manage your server path and detailed settings, toggle categories for easier navigation, and save your changes with a single click. Whether you’re new or experienced, this page simplifies server setup and ensures you can get your server running smoothly.",
      tags: ["Network", "Documentation "],
    },
    {
      code: "Custom Scripts?",
      desc: "This is where you can easily configure and organize your game server for your selected game. By choosing a game, the panel automatically loads all relevant settings, including core server options like Server Name, Max Players, and gameplay-specific options such as Zombie Count or XP Multiplier for Project Zomboid. Some panel settings, including Mods, Workshop, and other game-specific configurations, will also update automatically based on your selected game. Use the intuitive left and right panels to manage your server path and detailed settings, toggle categories for easier navigation, and save your changes with a single click. Whether you’re new or experienced, this page simplifies server setup and ensures you can get your server running smoothly.",
      tags: ["Automation", "Documentation "],
    },
    {
      code: "Scheduled Jobs?",
      desc: "This is where you can easily configure and organize your game server for your selected game. By choosing a game, the panel automatically loads all relevant settings, including core server options like Server Name, Max Players, and gameplay-specific options such as Zombie Count or XP Multiplier for Project Zomboid. Some panel settings, including Mods, Workshop, and other game-specific configurations, will also update automatically based on your selected game. Use the intuitive left and right panels to manage your server path and detailed settings, toggle categories for easier navigation, and save your changes with a single click. Whether you’re new or experienced, this page simplifies server setup and ensures you can get your server running smoothly.",
      tags: ["Automation", "Documentation "],
    },
    {
      code: "Webhooks & API?",
      desc: "This is where you can easily configure and organize your game server for your selected game. By choosing a game, the panel automatically loads all relevant settings, including core server options like Server Name, Max Players, and gameplay-specific options such as Zombie Count or XP Multiplier for Project Zomboid. Some panel settings, including Mods, Workshop, and other game-specific configurations, will also update automatically based on your selected game. Use the intuitive left and right panels to manage your server path and detailed settings, toggle categories for easier navigation, and save your changes with a single click. Whether you’re new or experienced, this page simplifies server setup and ensures you can get your server running smoothly.",
      tags: ["Automation", "Documentation "],
    },
    {
      code: "Game Tools?",
      desc: "This is where you can easily configure and organize your game server for your selected game. By choosing a game, the panel automatically loads all relevant settings, including core server options like Server Name, Max Players, and gameplay-specific options such as Zombie Count or XP Multiplier for Project Zomboid. Some panel settings, including Mods, Workshop, and other game-specific configurations, will also update automatically based on your selected game. Use the intuitive left and right panels to manage your server path and detailed settings, toggle categories for easier navigation, and save your changes with a single click. Whether you’re new or experienced, this page simplifies server setup and ensures you can get your server running smoothly.",
      tags: ["Game Tools", "Documentation "],
    },
    {
      code: "API Keys?",
      desc: "This is where you can easily configure and organize your game server for your selected game. By choosing a game, the panel automatically loads all relevant settings, including core server options like Server Name, Max Players, and gameplay-specific options such as Zombie Count or XP Multiplier for Project Zomboid. Some panel settings, including Mods, Workshop, and other game-specific configurations, will also update automatically based on your selected game. Use the intuitive left and right panels to manage your server path and detailed settings, toggle categories for easier navigation, and save your changes with a single click. Whether you’re new or experienced, this page simplifies server setup and ensures you can get your server running smoothly.",
      tags: ["Panel Settings", "Documentation "],
    },
    {
      code: "Theme Manager?",
      desc: "The Theme Manager in Modix Game Panel lets you fully customize your dashboard with image or gradient backgrounds, custom logos, and sidebar titles, giving you complete control over the panel’s look and feel. Select from preset backgrounds or enter your own URL, choose from stylish gradients, and see all changes applied in real time. Your custom theme is saved automatically for persistence across sessions, and you can reset to default anytime. With a live preview, instant application, and intuitive interface, the Theme Manager makes personalizing your Modix dashboard fast, easy, and visually immersive, enhancing both functionality and style or dig into the code and change it up for yourself.",
      tags: ["Panel Settings", "Documentation "],
    },
    {
      code: "Staff Chat?",
      desc: "The Staff Chat in Modix Game Panel is a real-time communication hub for server staff (Owners, Admins, SubUsers) that allows sending messages, tagging users with @username, replying in threads, and highlighting important or pinned messages, with emoji reactions and optional Discord-style webhook integration for alerts; it saves chat locally, automatically scrolls to the latest messages, includes a live preview of replies, and restricts access to authorized staff while providing a safety warning to avoid sharing sensitive information, making it perfect for coordinating team activities, tracking server workflows, and managing communication efficiently.",
      tags: ["Staff Chat", "Documentation "],
    },
  ];

  const filteredErrors = useMemo(() => {
    if (!errorSearch) return [];
    const term = errorSearch.toLowerCase();
    return mockErrorDatabase.filter(
      (e) =>
        e.code.toLowerCase().includes(term) ||
        e.desc.toLowerCase().includes(term) ||
        e.tags.some((tag) => tag.toLowerCase().includes(term))
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
              placeholder="Quickly search our documentation for Modix tips, guides, and game server error fixes."
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
                    <div className="error-tags">
                      {e.tags.map((tag) => (
                        <span key={tag} className="error-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
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
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
                padding: "1rem",
                backdropFilter: "blur(4px)",
                animation: "fadeIn 0.25s ease-in-out",
              }}
            >
              <div
                className="error-modal"
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "relative",
                  backgroundColor: "#1e1e1e",
                  color: "#eee",
                  borderRadius: "14px",
                  width: "100%",
                  maxWidth: "600px",
                  maxHeight: "80vh",
                  overflowY: "auto",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
                  padding: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  transition: "transform 0.2s ease",
                }}
              >
                {/* Close Button */}
                <button
                  className="error-modal-close"
                  onClick={() => setSelectedError(null)}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "transparent",
                    border: "none",
                    fontSize: "1.7rem",
                    color: "#ff6b6b",
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#ff4c4c")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#ff6b6b")
                  }
                >
                  <FaTimes />
                </button>

                {/* Header */}
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.5rem",
                    color: "#ff6b6b",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  ⚠️ {selectedError.code}
                </h2>

                {/* Description */}
                <p style={{ lineHeight: 1.6, fontSize: "1rem", color: "#ccc" }}>
                  {selectedError.desc}
                </p>

                {/* Tags */}
                <div
                  className="error-tags"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "0.5rem",
                  }}
                >
                  {selectedError.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: "#333",
                        color: "#fff",
                        padding: "5px 10px",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        cursor: "default",
                        transition: "transform 0.15s, background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#444";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#333";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      {tag}
                    </span>
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
