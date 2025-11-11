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
      desc: "This experimental feature is designed to track staff activity within the Modix Game Panel logging when staff members sign in, sign out, view pages, and how long their sessions last then displaying an interactive activity feed where you can click on any staff member to view their past week stats, including login frequency and most visited pages, providing early insights into staff engagement and panel usage.",
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
      code: "My Mods?",
      desc: "The Mod Manager is an all in one browser based tool that allows users to browse, search, and organize their game mods, create, edit, move, or delete files and folders within mods, manage favorites, customize colors, open multiple files in a live code editor with syntax highlighting, save changes in real time, and instantly refresh mod data all without leaving the panel, giving complete control over mod development and server content.",
      tags: ["Mods", "Documentation "],
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
      desc: "⚠️ This section is still in development and may not be fully functional yet.",
      tags: ["My Server", "Documentation "],
    },
    {
      code: "Steam Install?",
      desc: "⚠️ This section is still in development and may not be fully functional yet.",
      tags: ["Steam Tools", "Documentation "],
    },
    {
      code: "Steam Update?",
      desc: "⚠️ This section is still in development and may not be fully functional yet.",
      tags: ["Steam Tools", "Documentation "],
    },
    {
      code: "Workshop Manager?",
      desc: "This is where you can easily configure and organize your game server for your selected game. By choosing a game, the panel automatically loads all relevant settings, including core server options like Server Name, Max Players, and gameplay-specific options such as Zombie Count or XP Multiplier for Project Zomboid. Some panel settings, including Mods, Workshop, and other game-specific configurations, will also update automatically based on your selected game. Use the intuitive left and right panels to manage your server path and detailed settings, toggle categories for easier navigation, and save your changes with a single click. Whether you’re new or experienced, this page simplifies server setup and ensures you can get your server running smoothly.",
      tags: ["My Mods", "Documentation "],
    },
    {
      code: "Check Mod Updates?",
      desc: "⚠️ This section is still in development and may not be fully functional yet. It will allow users to check for updates to installed mods and manage mod versions in the future.",
      tags: ["My Mods", "Documentation"],
    },
    {
      code: "Create Mod?",
      desc: "⚠️ This section is still in development and may not be fully functional yet. It will allow users to create new mods and customize their content for the selected game in a future update.",
      tags: ["My Mods", "Documentation"],
    },
    {
      code: "Manage Assets",
      desc: "⚠️ This section is still in development and may not be fully functional yet. It will provide tools to manage mod assets, such as images, scripts, or configurations, once fully implemented.",
      tags: ["My Mods", "Documentation"],
    },
    {
      code: "Player List?",
      desc: "⚠️ This section is still in development and may not be fully functional yet. It is intended to allow management of players, including permissions, roles, and statistics, in a future update.",
      tags: ["Players", "Documentation"],
    },
    {
      code: "Player Search?",
      desc: "⚠️ This section is still in development and may not be fully functional yet. It is intended to allow management of players, including permissions, roles, and statistics, in a future update.",
      tags: ["Players", "Documentation"],
    },
    {
      code: "ChatLog?",
      desc: "⚠️ This section is still in development and may not be fully functional yet. It is intended to allow management of players, including permissions, roles, and statistics, in a future update.",
      tags: ["Monitoring", "Documentation "],
    },
    {
      code: "Ddos Manager?",
      desc: "⚠️ The DDoS Traffic Monitor is an experimental tool that tracks incoming network traffic in real-time, showing 🟢 server status, 📊 traffic intensity, and 🔴 attacking IPs, helping you detect and monitor potential DDoS threats while noting that this feature is still in testing and may not catch all attacks.",
      tags: ["Security", "Documentation "],
    },
    {
      code: "FireWall Rules?",
      desc: "⚠️ This section is still in development and may not be fully functional yet.",
      tags: ["Security", "Documentation "],
    },
    {
      code: "Connection Logs",
      desc: "⚠️ This section is still in development and may not be fully functional yet.",
      tags: ["Security", "Documentation "],
    },
    {
      code: "Check Ports?",
      desc: "The Game Server Ports Checker allows you to quickly verify whether the default ports for popular game servers like Project Zomboid, DayZ, and RimWorld, as well as any custom ports you specify, are open and reachable from your network. This helps you identify connection issues, ensure your server is properly configured, troubleshoot firewall or router restrictions, and confirm that no other applications are blocking essential ports, making server setup and maintenance much easier and more reliable.",
      tags: ["Network", "Documentation "],
    },
    {
      code: "Custom Scripts?",
      desc: "⚠️ This section is still in development and may not be fully functional yet. It is intended to allow users to create, manage, and automate custom server scripts for their selected game. Full functionality will be available in a future update.",
      tags: ["Automation", "Documentation"],
    },
    {
      code: "Scheduled Jobs?",
      desc: "⚠️ This section is still in development and may not be fully functional yet. It is intended to allow users to schedule recurring tasks and server jobs for their selected game. Full functionality will be available in a future update.",
      tags: ["Automation", "Documentation"],
    },
    {
      code: "Webhooks & API?",
      desc: "Modix Game Panel allows users to create, edit, save, and send custom Discord-style embed messages through webhooks. Users can configure each embed with a name, title, description, color, thumbnail, image, and webhook URL, all in a live editor. The page provides a sidebar to manage multiple embeds, a live preview of the embed with selected colors and media, and action buttons to send or save embeds. This panel simplifies the process of crafting rich messages for server notifications, updates, or announcements, making it ideal for server administrators who want full control over their communications.",
      tags: ["Automation", "Documentation "],
    },
    {
      code: "Game Tools?",
      desc: "⚠️ This section is still in development and may not be fully functional yet. Eventually, it will allow you to easily configure and organize your game server for your selected game. By choosing a game, the panel will automatically load all relevant settings, including core server options like Server Name, Max Players, and gameplay-specific options such as Zombie Count or XP Multiplier for Project Zomboid. Panel settings, including Mods, Workshop, and other game-specific configurations, will also update automatically based on your selected game. Users will be able to manage server paths and detailed settings through intuitive panels, toggle categories for easier navigation, and save changes with a single click. This page is intended to simplify server setup and ensure smooth operation, whether you are new or experienced.",
      tags: ["Game Tools", "Documentation"],
    },
    {
      code: "API Keys?",
      desc: "The API & Developer Access panel in Modix Game Panel allows users to securely manage their API tokens for accessing developer endpoints. It provides the ability to view, generate, and copy API tokens, with optional hiding for security. Tokens are required to interact programmatically with the Modix backend, enabling automation of server controls like starting, stopping, and checking server status, as well as retrieving system stats. The component displays available API endpoints with their methods and descriptions, gives warnings to keep tokens private, and supports easy token regeneration. This panel is ideal for developers and advanced users who want to integrate, automate, or extend the Modix Game Panel functionality. Please note: this page is still in development and may not be fully functional.",
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
    {
      code: "Workshop?",
      desc: "It lets you manage your Steam Workshop mods for your server with full control and ease. You can search for mods or enter Workshop Collection IDs, view detailed information including title, description, image, version, and last update, and directly manage installed mods via server.ini. It allows creating, renaming, deleting, and organizing modlists, exporting mod IDs for server.ini, checking mod updates and changelogs, reviewing mod logs, monitoring alerts for conflicts or issues, debugging mods, and managing load order. Additional features include adding mods to your server, highlighting mods with custom colors, and filtering displayed mods by lists or installation status. Every tool is designed specifically for Steam Workshop content, giving you complete organization, insight, and control to maintain a stable and optimized server experience.",
      tags: ["Workshop", "Documentation"],
    },
    {
      code: "Not Enough Space",
      desc: "💾 This error means your system has run out of storage space, preventing the server from saving logs, worlds, or mods. To fix this, delete unused backups, remove large crash logs, or clear mod download caches in `Zomboid\\Workshop`. If you're running on a dedicated machine, free up disk space on the drive containing your server files.",
      tags: ["Project Zomboid", "Server Issue", "Storage"],
    },
    {
      code: "Port Already in Use",
      desc: "🔌 The port your server is trying to use (e.g., 16261) is already taken by another process or an old instance still running in the background. Stop any running Project Zomboid servers, or change the port number in `servertest.ini` under `DefaultPort` and restart your server. You can check which program is using the port with `netstat -aon | findstr 16261` in Command Prompt.",
      tags: ["Network", "Server Startup", "Project Zomboid"],
    },
    {
      code: "Failed to Bind Socket",
      desc: "🌐 This error indicates that the server couldn’t connect to the network socket, usually caused by an invalid IP binding or blocked port. Make sure the IP in `server.ini` is valid (or leave it blank to auto-bind), disable conflicting firewall rules, and run the Modix panel or batch file as Administrator.",
      tags: ["Network", "Server Issue", "Project Zomboid"],
    },
    {
      code: "Missing Workshop Mods",
      desc: "🧩 The server can’t find one or more Workshop mods listed in your `servertest.ini`. This often happens when a Workshop ID is invalid or hasn’t been downloaded. Recheck your Workshop IDs, ensure each one exists on Steam, and verify your SteamCMD installation is up to date and logged in correctly.",
      tags: ["Mods", "Workshop", "Project Zomboid"],
    },
    {
      code: "Java Not Found",
      desc: '☕ The server cannot start because Java is missing or your batch file is pointing to the wrong Java path. Project Zomboid on Windows requires Java 17 or newer. Install Java 17, then open your server’s start batch file (e.g., `StartServer64.bat`) and update the Java path to match your installation — for example: `"C:\\Program Files\\Java\\jdk-17\\bin\\java.exe"`. Save the batch file, then restart it to apply the fix.',
      tags: ["Java", "Server Startup", "Batch File", "Windows"],
    },
    {
      code: "Access Denied",
      desc: "🔒 The server doesn’t have permission to access or modify certain files. Run the Modix panel or your batch file as Administrator, or ensure that your Windows user account has full control over the Project Zomboid server folder in its file properties.",
      tags: ["Permissions", "File System", "Windows"],
    },
    {
      code: "Server Not Responding",
      desc: "🕒 The server may have frozen or crashed during startup. Check your console window or `console.txt` for errors. Common causes include broken mods or corrupted saves. Try disabling mods temporarily or creating a new test server to verify that the core setup works.",
      tags: ["Crash", "Startup", "Project Zomboid"],
    },
    {
      code: "SteamCMD Timeout",
      desc: "⏳ SteamCMD took too long to download required game files or mods. This can happen due to poor connection or Steam downtime. Restart SteamCMD or your Modix panel, and try again later. You can also run SteamCMD manually with `+login anonymous +app_update 108600 validate` to confirm it works.",
      tags: ["SteamCMD", "Mods", "Network", "Windows"],
    },
    {
      code: "Corrupted Save File",
      desc: "💀 A world or save file is corrupted and cannot be loaded. This is often caused by an improper shutdown or crash. Restore a previous backup from `Zomboid\\Saves\\Multiplayer` or delete the corrupted world folder to generate a new one cleanly.",
      tags: ["World", "Save Data", "Project Zomboid"],
    },
    {
      code: "Memory Allocation Failed",
      desc: "🧠 The server ran out of available memory (RAM) while starting up or hosting players. Edit your batch file and increase the memory arguments — for example: `-Xms2G -Xmx4G` to allocate more RAM. Close unnecessary apps before launching, or upgrade your system memory if the issue persists.",
      tags: ["Memory", "Performance", "Windows"],
    },
    {
      code: "Failed to Connect to Backend",
      desc: "🌐 The panel could not reach the Flask backend API. This usually means the backend server (port 2010) isn’t running, or the API URL is incorrect. Make sure the Flask backend is started, check that the API base URL in your React configuration matches your server address (e.g., `http://localhost:2010`), and that your firewall or proxy isn’t blocking requests.",
      tags: ["React", "API", "Connection", "Frontend"],
    },
    {
      code: "CORS Policy Blocked Request",
      desc: "🚫 Your browser blocked a request due to CORS restrictions. This happens when the backend doesn’t include proper headers like `Access-Control-Allow-Origin`. To fix it, open your Flask backend and enable CORS with `from flask_cors import CORS` and `CORS(app)` right after app creation.",
      tags: ["CORS", "API", "Frontend", "React"],
    },
    {
      code: "Component Failed to Load",
      desc: "⚙️ A React component failed to render because of a missing import, syntax error, or incorrect file path. Check the browser console for details (`Ctrl+Shift+I` → Console tab). Ensure all component imports are spelled correctly, and that `.css` and `.tsx/.jsx` files exist in the expected directories.",
      tags: ["React", "UI", "Frontend"],
    },
    {
      code: "Blank Screen on Load",
      desc: "🧩 The page loads but displays a blank screen. This can occur due to a fatal JavaScript error or broken router path. Open the console and look for red error messages. Fix any syntax errors or missing imports, and make sure your routes (e.g., `/dashboard`, `/terminal`) are properly defined in `App.jsx` or `App.tsx`.",
      tags: ["React Router", "UI", "Frontend"],
    },
    {
      code: "State Not Updating",
      desc: "🔁 A UI element or component isn’t updating even after an action. This typically happens when state variables are not updated correctly using React hooks. Verify that you’re using `setState` or `useState` properly, and avoid mutating state directly (e.g., use `setItems([...items, newItem])` instead of modifying `items.push`).",
      tags: ["React", "Hooks", "State Management"],
    },
    {
      code: "Infinite Re-render Detected",
      desc: "♻️ The component is stuck in a re-render loop. This usually happens when `useEffect` is missing a dependency array or contains a state update that triggers itself. Fix it by adding a dependency array (e.g., `useEffect(() => { ... }, [])`) or moving updates out of the render cycle.",
      tags: ["React", "Hooks", "Performance"],
    },
    {
      code: "404 Page Not Found",
      desc: "🚷 A route was not recognized by the React Router. Double-check your route configuration and make sure your navigation links match existing routes. Add a fallback `<Route path='*' element={<NotFoundPage />}/>` to handle invalid URLs gracefully.",
      tags: ["Routing", "React", "Frontend"],
    },
    {
      code: "LocalStorage Not Accessible",
      desc: "🗄️ The panel couldn’t access localStorage, often due to browser privacy settings or running the panel in incognito mode. Try reopening in normal mode or checking that cookies and local data are allowed. If using embedded iframes, enable same-origin storage access.",
      tags: ["LocalStorage", "Browser", "Frontend"],
    },
    {
      code: "Network Request Failed",
      desc: "📡 This error appears when a fetch or axios request can’t reach the target API. It may be due to a wrong URL, server downtime, or missing SSL certificate. Check your browser console for the failing endpoint and verify the backend server is running and accessible at that URL.",
      tags: ["Network", "React", "API"],
    },
    {
      code: "Uncaught TypeError",
      desc: "💥 A variable or function was used incorrectly, such as calling a method on `undefined` or `null`. Check the line number in the browser console and trace where the variable is set. Add proper checks (e.g., `if (data) {...}`) before using values that might not exist yet.",
      tags: ["JavaScript", "React", "Frontend"],
    },
    {
      code: "Cannot Connect to Web Panel",
      desc: "🌐 The React web panel isn’t loading, which usually means it can’t reach the backend or the server URL is incorrect. To fix this: 1) Ensure the Flask backend is running on port 2010, 2) Confirm that the panel URL in your browser matches the server address (e.g., `http://localhost:2010` or your server’s IP), 3) Make sure your firewall allows traffic on that port, and 4) If using a remote server, verify that port forwarding or NAT rules are correctly configured.",
      tags: ["Web Panel", "Connection", "React", "Frontend"],
    }
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
                <div className="error-item">No errors or help documentation found. If stuck, reach out to us on our discord.</div>
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
