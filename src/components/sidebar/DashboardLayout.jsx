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

const displayTags = [
  { key: "Getting Started", label: "📘 Getting Started" },
  { key: "Frontend Issue", label: "🛠 Frontend Issue" },
  { key: "Backend Issue", label: "🖥 Backend Issue" },
  { key: "Game Server Issue", label: "⚠️ Game Server Issue" },
  { key: "Reported Bugs", label: "⚠️ Reported Bugs" },
];

const mockErrorDatabase = [
  {
    code: "What Is Modix Game Panel?",
    desc: "Modix Game Panel is a long-term project by DaleMarkie (aka OV3RLORD), built to redefine server management for Project Zomboid and beyond. Over the past year, I’ve crafted a powerful, intuitive, and stylish panel from scratch, combining modern UI design with robust features. Modix offers complete server control, automated mod management, real time monitoring, and seamless updates all in one place. Modix is completely free for personal use under the personal license. Commercial use is not permitted, but you can request a commercial license through our Discord community. Click Support for more information. Looking forward, Modix will expand to support other Steam games and experimental Linux servers with Docker, making it a versatile, all-in-one game server solution. This is a long-term project that will continue to evolve, delivering more features, enhanced usability, and an even better experience for server administrators over time.",
    tags: ["Getting Started", "Modix"],
  },
  {
    code: "What Is Account?",
    desc: "The Account section allows users to manage their personal Modix profile, configure permissions, and maintain security credentials. Here, you can view your account details, change your password, configure two-factor authentication, and review login history to monitor access activity. Staff roles can also be managed here if you have admin privileges, giving you the ability to assign or revoke access to specific parts of the panel.",
    tags: ["Getting Started", "Modix"],
  },
  {
    code: "Dashboard?",
    desc: "The Dashboard provides a comprehensive overview of your server and panel status. It includes real-time server health, system performance metrics (CPU, RAM, Disk usage), active players, and mod update status. If the API fails to start, the dashboard may show incomplete or missing data. In that case, open your terminal or check the `console.txt` file to review error messages. Common issues include missing Python modules, incorrect configuration paths, or network restrictions. Always follow the traceback carefully to pinpoint the root cause.",
    tags: ["Getting Started"],
  },
  {
    code: "Activity?",
    desc: "This experimental feature is designed to track staff activity within the Modix Game Panel. It logs when staff members sign in, sign out, view pages, and the duration of their sessions. An interactive activity feed displays weekly stats, showing login frequency, most visited pages, and engagement patterns. Administrators can click on a staff member to view detailed metrics, providing insights into how the team interacts with the panel and identifying potential workflow optimizations.",
    tags: ["Getting Started"],
  },
  {
    code: "My License",
    desc: "The License section displays your current Modix license type, usage restrictions, and validity period. Personal licenses are free and intended for private servers, while commercial use requires a paid license. You can request a commercial license through the Modix Discord community. The panel also indicates if your license is active or expired and provides guidance on how to upgrade or renew.",
    tags: ["Getting Started"],
  },
  {
    code: "Staff Accounts",
    desc: "Manage all staff members assigned to your server, including roles, permissions, and access levels. You can create new accounts, remove inactive staff, and configure detailed permissions for each user, such as access to the terminal, mod manager, or server settings. This ensures that sensitive operations are limited to trusted personnel only.",
    tags: ["Getting Started"],
  },
  {
    code: "Settings",
    desc: "The Settings page allows full customization of the Modix Panel and server integration. Here, you can configure UI themes, header and text colors, server paths, batch file locations, and default Steam Workshop settings. Additional options include toggling debug mode, enabling real-time log streaming, configuring notification preferences, and managing panel security settings such as login restrictions and IP whitelists.",
    tags: ["Getting Started"],
  },
  {
    code: "Console?",
    desc: "The Terminal component is a powerful, web-based console that provides complete control over your Project Zomboid server. Users can start, stop, restart, and shut down the server with a single click. Commands like saving the world, kicking or banning players, reloading scripts, and running custom server commands are supported. Logs are streamed in real time, with search, auto-scroll, and copy/clear functionality. Performance metrics such as memory usage, tick rate, and server uptime are displayed alongside the console. This enables both new and experienced administrators to monitor, manage, and troubleshoot the server entirely from the browser.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "My Mods?",
    desc: "The Mod Manager is an all-in-one tool for browsing, searching, and organizing your game mods. Users can create, edit, move, or delete files and folders within mods, manage favorites, customize color labels, and open multiple files in a live code editor with syntax highlighting. Changes are saved in real time, and mod data refreshes instantly. The Mod Manager also allows exporting mod IDs for server.ini integration, checking mod updates, reviewing changelogs, debugging mods, monitoring for conflicts, and adjusting load order. All these actions are handled from a single, intuitive interface, giving full control over mod management and server content.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Change Game?",
    desc: "The Change Game feature lets users select from all supported games within the panel. Each game card displays a summary including description, Steam/Discord links, and supported status. Selecting a game automatically updates related panel settings like mods, workshop integration, and server configuration paths. For supported games like Project Zomboid, users can create a new server session, define batch file paths, and launch dedicated servers directly. Community resources, guides, and official wikis are accessible directly from this page for convenient setup and management.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Server Settings?",
    desc: "The Server Settings page allows administrators to configure core server options such as Server Name, Max Players, PvP settings, Zombie Count, XP multipliers, and more. Panel features like Mods, Workshop, and game-specific settings update dynamically based on selected game. The interface uses left and right panels for intuitive management, category toggling for easier navigation, and single-click save functionality. Both new and experienced users can reliably set up and run servers without manually editing configuration files.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "BackUp?",
    desc: "⚠️ This section is still in development. When completed, it will allow full server backup and restore capabilities, including automated scheduling, selective world/mod backup, and one-click restoration.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Steam Install?",
    desc: "⚠️ This section is still in development. The future functionality will allow installing Project Zomboid and other supported games directly via SteamCMD from the panel, with progress monitoring and automated dependency checks.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Steam Update?",
    desc: "⚠️ This section is still in development. Once complete, it will handle automated updates of games and mods through SteamCMD, ensuring servers remain current without manual intervention.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Workshop Manager?",
    desc: "Manage Steam Workshop mods by creating modlists, adding/removing mods, renaming or deleting entries, exporting mod IDs for server.ini, checking for updates, and reviewing changelogs. The interface also provides conflict alerts and load order customization, giving administrators full control over workshop integration.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Check Mod Updates?",
    desc: "⚠️ Still in development. When functional, it will allow checking installed mods for updates, viewing version differences, and optionally applying updates directly through the panel.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Create Mod?",
    desc: "⚠️ Still in development. Once implemented, this feature will enable creating new mods, editing assets, configuring metadata, and integrating mods seamlessly with server.ini and the Workshop system.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Manage Assets",
    desc: "⚠️ Still in development. Will allow administrators to manage mod assets including images, scripts, and configuration files, with live preview and version control support.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Player List?",
    desc: "⚠️ Still in development. This feature will allow administrators to view, sort, and manage all connected players, including permissions, roles, and activity statistics.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Player Search?",
    desc: "⚠️ Still in development. Will enable searching for specific players across sessions and servers, supporting advanced filtering by role, status, or activity.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "ChatLog?",
    desc: "⚠️ Still in development. Will provide detailed access to server chat logs, including timestamps, message content, user info, and moderation tools.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Ddos Manager?",
    desc: "⚠️ Experimental. Monitors incoming network traffic in real time, showing server status, traffic intensity, and attacking IPs. Helps administrators detect and mitigate potential DDoS attacks, though still under testing.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "FireWall Rules?",
    desc: "⚠️ Still in development. Future functionality will allow configuring firewall rules to restrict access to server ports and services directly from the panel.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Connection Logs",
    desc: "⚠️ Still in development. Will track all inbound and outbound connections, logging IPs, ports, protocols, and timestamps for auditing and troubleshooting purposes.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Check Ports?",
    desc: "The Game Server Ports Checker allows you to verify if default or custom ports are open and reachable. This helps identify connection issues, troubleshoot firewalls or NAT restrictions, and ensure no other applications are blocking essential ports. For example, Project Zomboid defaults to 16261 for TCP and UDP; you can test using built-in network utilities or external tools.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Custom Scripts?",
    desc: "⚠️ Still in development. Intended to allow creating, managing, and automating custom server scripts for scheduled or event-driven tasks. Will support shell scripts, Python scripts, and batch files.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Scheduled Jobs?",
    desc: "⚠️ Still in development. Will allow scheduling recurring server tasks such as backups, restarts, mod updates, and maintenance scripts, with logs and notification tracking.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Webhooks & API?",
    desc: "The Webhooks & API page allows creating, editing, and sending Discord-style embed messages. You can configure name, title, description, colors, images, thumbnails, and webhook URLs. The live editor shows real-time previews, and the sidebar manages multiple embeds. Ideal for announcements, updates, and server notifications.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Game Tools?",
    desc: "⚠️ Still in development. Will provide utilities for configuring and managing game servers, adjusting server parameters, and accessing additional tools for optimization and maintenance.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "API Keys?",
    desc: "Manage API tokens for secure developer access, automation, and integration. Supports token creation, viewing, hiding, and regeneration. Tokens are required for programmatic interaction with the Modix backend, such as starting/stopping servers or retrieving stats.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Theme Manager?",
    desc: "Customize dashboard backgrounds, gradients, logos, sidebar titles, and colors. Changes are applied in real-time, saved automatically, and can be reset to defaults. Supports live previews and allows advanced users to modify styles directly.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Staff Chat?",
    desc: "A real-time communication hub for server staff (Owners, Admins, SubUsers). Supports messaging, tagging, threaded replies, emoji reactions, optional Discord webhooks, live previews, and scroll management. Access is restricted to authorized staff to prevent sensitive information leaks.",
    tags: ["Getting Started", "Documentation"],
  },
  {
    code: "Workshop?",
    desc: "Manage Steam Workshop mods for your server with full control. Search, add/remove mods, view titles, descriptions, images, versions, last update, export mod IDs, check updates, review logs, monitor conflicts, adjust load order, and highlight important mods. All tools are designed for Steam Workshop content.",
    tags: ["Getting Started", "Workshop"],
  },
  // --- Game Server Issues ---
  // --- Project Zomboid Game Server Issues (Windows) ---
  {
    code: "Server Crashes on Startup",
    desc: "💥 The server crashes immediately on launch. Often caused by incompatible mods, corrupted files, or incorrect Java installation. Check `console.txt` for errors and disable mods temporarily.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Java Path Incorrect",
    desc: "☕ The batch file cannot find Java. Ensure Java 17+ is installed and the path in your `StartServer64.bat` points to the correct `java.exe`.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Server Hangs on Loading",
    desc: "🕒 The server freezes while loading a world. Causes include large worlds, too many mods, or corrupted save data. Try a clean save or reduce mods.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Port Already in Use",
    desc: "🔌 The default server port (16261) is occupied. Close other instances or change `DefaultPort` in `servertest.ini`.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Firewall Blocking Server",
    desc: "🔥 Windows Firewall may block server connections. Add exceptions for Java and your server port to allow players to connect.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Server Not Saving World",
    desc: "💾 The world is not saving. Causes include read-only folder permissions or insufficient disk space. Check save folder permissions.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Crash Logs Overwriting",
    desc: "📝 Crash logs are being overwritten or not generated. Ensure the server folder has write permissions and monitor `Zomboid\\Logs`.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Mods Not Loading",
    desc: "🧩 Some mods fail to load. Ensure the correct Workshop IDs are listed in `servertest.ini` and mods are installed in `Zomboid\\Workshop`.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "World Corruption",
    desc: "💀 A saved world is corrupted. Restore backups from `Zomboid\\Saves\\Multiplayer` or start a new world to prevent crashes.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Server Memory Usage High",
    desc: "🧠 The server consumes too much RAM, causing slow performance. Increase system memory or reduce mods and players.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Workshop Download Fails",
    desc: "⏳ SteamCMD fails to download mods. Check network connectivity, SteamCMD login, and validate Workshop IDs.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Cannot Connect Locally",
    desc: "🌐 Local clients cannot connect. Ensure server is running, firewall allows the port, and `servertest.ini` has correct IP (leave blank for auto).",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Cannot Connect Remotely",
    desc: "🌍 Remote players cannot join. Verify port forwarding, firewall exceptions, and that the public IP is correct.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Server Freezes During Gameplay",
    desc: "🕹️ The server hangs while players are online. Could be caused by heavy mods, AI calculations, or insufficient CPU/RAM.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Backup Fails",
    desc: "💾 Automatic backups do not run. Check permissions on the backup folder and ensure enough free space is available.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Save File Too Large",
    desc: "📂 The world save file exceeds size limits. Reduce world complexity, mods, or map expansions to avoid crashes.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Server Logs Not Updating",
    desc: "📄 The console or logs do not show new activity. Ensure write permissions on `Zomboid\\Logs` and that the server is running.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Server Backup Corrupted",
    desc: "💀 A backup file is damaged. Restore an earlier backup or manually copy world files to a safe location.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Server Performance Lag",
    desc: "⚡ The server experiences high latency or slow updates. Reduce number of players, mods, or increase CPU/RAM resources.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Save File Permission Denied",
    desc: "🔒 The server cannot write to the save folder. Check folder permissions and run the server with administrative rights.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "SteamCMD Not Found",
    desc: "🛠️ SteamCMD executable is missing or not installed. Download and place it in the correct folder, then update Workshop mods.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Server Crashes After Mod Update",
    desc: "🔄 After updating a mod, the server fails to start. Rollback the mod or verify compatibility with other installed mods.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Zombie AI Glitches",
    desc: "🧟 Unexpected AI behavior occurs, often due to mod conflicts or corrupted scripts. Disable problematic mods and test.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Item Duplication Bug",
    desc: "📦 Players report duplicated items. Check mods and server scripts that affect inventory, as some may conflict.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Server Disconnects Players",
    desc: "⚠️ Players are disconnected randomly. Causes include high latency, server overload, or firewall/router issues.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Invalid Config File",
    desc: "⚙️ The `servertest.ini` or `SandboxVars.lua` file contains syntax errors. Check formatting and restore from backup if needed.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Server Console Frozen",
    desc: "🖥️ The console window stops responding. This may happen with heavy logs or memory issues. Restart the server and monitor log size.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Workshop Mod Conflict",
    desc: "⚔️ Two or more mods conflict, causing crashes or broken gameplay. Check mod load order and disable conflicting mods.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Server Time Incorrect",
    desc: "⏰ In-game time is wrong or jumps unexpectedly. Usually caused by mods or server clock settings. Verify `servertest.ini` time settings.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Invalid Server Name",
    desc: "🏷️ Server name in `servertest.ini` contains illegal characters or is too long. Rename and restart the server.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Admin Commands Not Working",
    desc: "🛡️ Server admin commands fail to execute. Ensure your SteamID is listed in `admin.txt` and that commands are typed correctly.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Player Data Not Saving",
    desc: "💾 Player stats and items are lost on disconnect. Causes include write permission issues or corrupted player files in `Zomboid\\Saves\\Multiplayer\\username`.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Server Resource Leak",
    desc: "🔧 Memory or file handles are not released, eventually causing slowdowns. Monitor server process and restart periodically.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "World Generation Fails",
    desc: "🌍 The server fails to generate a new world. Could be caused by missing map files, invalid mods, or corrupted templates.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Lua Script Errors",
    desc: "📜 Custom Lua scripts cause runtime errors. Check `Lua.log` for details and disable problematic scripts.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Server Does Not Respond to Ping",
    desc: "🏓 Players cannot see the server in the server list. Ensure UDP port is open and `DefaultPort` is correct.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Players Cannot Pick Up Items",
    desc: "🛒 Inventory bugs occur. Often due to mod conflicts or corrupted world files. Check for mod updates or remove conflicting mods.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Server Crashes During Night",
    desc: "🌙 Nighttime in-game triggers crashes. Could be due to lighting mods or AI pathing issues. Check logs and disable related mods.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "World Not Syncing Between Clients",
    desc: "🔄 Clients see different world states. Causes include desynced mods, corrupted saves, or network instability.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Server Does Not Shut Down Properly",
    desc: "🛑 Closing the server leaves the process running. Always use `shutdown` command or batch script with `pause` to stop cleanly.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Server Logs Flooded",
    desc: "📈 Excessive logs cause console to lag. Enable log rotation or reduce debug-level logging.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Players Experience Rubberbanding",
    desc: "🏃‍♂️ Players teleport or lag in place. Often caused by network latency, overloaded CPU, or mod issues.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Server Cannot Load Lua Map",
    desc: "🗺️ Custom Lua maps fail to load. Ensure map files exist in `Zomboid\\Maps` and are compatible with current server version.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
  {
    code: "Server Crashes on Mod Load",
    desc: "📦 Loading certain mods crashes the server. Check mod dependencies, version compatibility, and try loading mods one at a time.",
    tags: ["Game Server Issue", "Project Zomboid"],
  },
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
  });
  const [currentUserState, setCurrentUserState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const allTags = useMemo(() => displayTags.map((t) => t.key), []);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved)
      try {
        const parsed = JSON.parse(saved);
        setTheme(parsed);
        applyTheme(parsed);
      } catch {}
    const handle = (e) =>
      e.detail && (setTheme(e.detail), applyTheme(e.detail));
    window.addEventListener("themeUpdate", handle);
    return () => window.removeEventListener("themeUpdate", handle);
  }, []);

  const applyTheme = (t) => {
    const body = document.body;
    body.style.background =
      t.gradient ||
      (t.background ? `url(${t.background}) no-repeat center/cover` : "");
  };

  const allowedPages =
    currentUserState?.role === "Owner" ? null : currentUserState?.pages || [];
  const toggleSubMenu = (href) =>
    setOpenMenus((prev) => ({ ...prev, [href]: !prev[href] }));

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

  // Fade-in content on navigation
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 100); // small delay for fade
    return () => clearTimeout(timer);
  }, [pathname]);

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

  const filteredErrors = useMemo(() => {
    return mockErrorDatabase
      .filter((e) => !activeTag || e.tags.includes(activeTag))
      .filter(
        (e) =>
          !errorSearch ||
          [e.code, e.desc, ...e.tags].some((t) =>
            t.toLowerCase().includes(errorSearch.toLowerCase())
          )
      );
  }, [activeTag, errorSearch]);

  const getTagLabel = (key) =>
    displayTags.find((t) => t.key === key)?.label || key;

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
          <div className="error-search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Quickly search our documentation..."
              value={errorSearch}
              onChange={(e) => setErrorSearch(e.target.value)}
            />
          </div>

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
              {displayTags.map((t) => (
                <button
                  key={t.key}
                  onClick={() =>
                    setActiveTag((prev) => (prev === t.key ? "" : t.key))
                  }
                  className={`tag-filter-button ${
                    activeTag === t.key ? "active" : ""
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {(errorSearch || activeTag) && (
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
          )}

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
