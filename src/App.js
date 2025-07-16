import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { FaDiscord, FaCoffee } from "react-icons/fa";
import { loadEnabledModules } from "./module_system/frontend_module_loader";

import Dashboard from './components/core/dashboard/Dashboard';
import MyServers from "./components/core/games/myservers/MyServers";
import FileManager from "./components/core/filemanager/FileManager";
import Workshop from "./components/core/workshopmanager/Workshop";
import ModManager from "./components/core/workshopmanager/ModManager";
import PlayerManager from "./components/core/playermanager/PlayerManager";
import Settings from "./components/core/workshopmanager/Settings";
import Webhook from "./components/core/webhook/Webhook";
import Help from "./components/core/help/Help";
import Login from "./components/core/auth/login";
import Signup from "./components/core/auth/signup";
import Games from "./components/core/games/Games";
import ThemeManager from './components/core/thememanager/ThemeManager';
import GameManager from './components/core/gamemanager/GameManager';
import MyAccount from "./components/core/dashboard/MyAccount/MyAccount";

function App() {
  const [panelName, setPanelName] = useState("MODIX");
  const [headerBgColor, setHeaderBgColor] = useState("#1f1f1f");
  const [headerTextColor, setHeaderTextColor] = useState("#ffffff");
  const [backgroundImage, setBackgroundImage] = useState(
    'url("https://images7.alphacoders.com/627/thumb-1920-627909.jpg")'
  );
  const [gamesMenuOpen, setGamesMenuOpen] = useState(false);
  const [dynamicModules, setDynamicModules] = useState([]);

  useEffect(() => {
    const storedBg = localStorage.getItem("headerBgColor");
    const storedText = localStorage.getItem("headerTextColor");
    if (storedBg) setHeaderBgColor(storedBg);
    if (storedText) setHeaderTextColor(storedText);
    // Load dynamic modules from backend
    loadEnabledModules("/api")
      .then(setDynamicModules)
      .catch((e) => console.error("Failed to load modules:", e));
  }, []);

  const appWrapperStyle = {
    backgroundColor: "#121212",
    backgroundImage,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center",
    minHeight: "100vh",
    transition: "background-color 0.3s ease",
    position: "relative",
    zIndex: 0,
    color: "white",
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    pointerEvents: "none",
    zIndex: 1,
  };

  const headerStyle = {
    backgroundColor: headerBgColor,
    color: headerTextColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    height: 60,
    userSelect: "none",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    position: "relative",
    zIndex: 3,
  };

  const warningLabelStyle = {
    backgroundColor: "#b33939",
    color: "#fff",
    textAlign: "center",
    padding: "6px 12px",
    fontWeight: "600",
    fontSize: "0.9rem",
    borderRadius: "0 0 12px 12px",
    userSelect: "none",
    marginTop: -6,
    marginBottom: 12,
    zIndex: 3,
  };

  const headerButtonStyle = {
    color: headerTextColor,
    padding: "8px 14px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "1rem",
    cursor: "pointer",
    borderRadius: 8,
    userSelect: "none",
    transition: "background-color 0.3s ease",
    display: "inline-block",
  };

  const footerStyle = {
    marginTop: 24,
    padding: "16px 24px",
    backgroundColor: "#1f1f1f",
    color: "#eee",
    borderRadius: "0 0 12px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.9rem",
    userSelect: "none",
    zIndex: 2,
  };

  const submenuContainerStyle = {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    backgroundColor: "#222",
    borderRadius: 8,
    boxShadow: "0 4px 8px rgba(0,0,0,0.8)",
    padding: "8px 0",
    minWidth: 140,
    zIndex: 10,
    display: gamesMenuOpen ? "block" : "none",
  };

  const submenuItemStyle = {
    padding: "8px 16px",
    color: "#eee",
    textDecoration: "none",
    display: "block",
    fontWeight: 500,
    cursor: "pointer",
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/filemanager", label: "File Manager" },
    { to: "/modmanager", label: "Mod Manager" },
    { to: "/workshop", label: "Workshop" },
    { to: "/settings", label: "Settings" },
  ];

  return (
    <Router>
      <div className="app-wrapper" style={appWrapperStyle}>
        <div style={overlayStyle} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              maxWidth: 1200,
              margin: "40px auto",
              padding: "20px",
              backgroundColor: "rgba(30,30,30,0.85)",
              borderRadius: 12,
              boxShadow: "0 0 20px rgba(0,0,0,0.7)",
              minHeight: "calc(100vh - 80px)",
              display: "flex",
              flexDirection: "column",
              zIndex: 2,
            }}
          >
            {/* Header */}
            <header style={headerStyle}>
              <div
                className="logo"
                style={{ fontWeight: 700, fontSize: "1.6rem", cursor: "default" }}
              >
                {panelName}
              </div>

              <nav
                className="top-menu"
                style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}
              >
                {navLinks.map(({ to, label }) => (
                  <Link key={label} to={to} style={headerButtonStyle}>
                    {label}
                  </Link>
                ))}
                {/* Dynamic module menu items */}
                {dynamicModules.flatMap((mod) =>
                  (mod.frontend?.nav_items || []).map((item) => (
                    <Link key={mod.name + item.path} to={item.path} style={headerButtonStyle}>
                      {item.label}
                    </Link>
                  ))
                )}

                <div
                  style={{ ...headerButtonStyle, userSelect: "none", position: "relative" }}
                  onMouseEnter={() => setGamesMenuOpen(true)}
                  onMouseLeave={() => setGamesMenuOpen(false)}
                >
                  Games
                  <div style={submenuContainerStyle}>
                    <Link
                      to="/games"
                      style={submenuItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#444")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      onClick={() => setGamesMenuOpen(false)}
                    >
                      All Games
                    </Link>
                    <Link
                      to="/myservers"
                      style={submenuItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#444")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      onClick={() => setGamesMenuOpen(false)}
                    >
                      My Servers
                    </Link>
                  </div>
                </div>

                {/* ✅ Login Button */}
                <Link
                  to="/login"
                  style={{
                    backgroundColor: "#3d3d3d",
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #666",
                    fontWeight: 600,
                    fontSize: "1rem",
                    textDecoration: "none",
                    transition: "all 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#555")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3d3d3d")}
                >
                  Login
                </Link>
              </nav>
            </header>

            {/* Warning Label */}
            <div style={warningLabelStyle}>
              ⚠️ Modix is still in development. Some features may not work as expected.
            </div>

            <main className="main-content" style={{ flexGrow: 1, marginTop: 20 }}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/myservers" element={<MyServers />} />
                <Route path="/filemanager" element={<FileManager />} />
                <Route path="/workshop" element={<Workshop />} />
                <Route path="/modmanager" element={<ModManager />} />
                <Route path="/playermanager" element={<PlayerManager />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/webhook" element={<Webhook />} />
                <Route path="/help" element={<Help />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/games" element={<Games />} />
                <Route path="/thememanager" element={<ThemeManager />} />
                <Route path="/gamemanager" element={<GameManager />} />
                <Route path="/myaccount" element={<MyAccount />} />
                {/* Dynamic module routes */}
                {dynamicModules.flatMap((mod) =>
                  (mod.frontend?.routes || []).map((route) =>
                    route.path && route.component ? (
                      <Route
                        key={mod.name + route.path}
                        path={route.path}
                        element={React.createElement(route.component)}
                      />
                    ) : null
                  )
                )}
              </Routes>
            </main>

            <footer style={footerStyle}>
              <div>
                <span>© 2025 {panelName}</span> &nbsp;|&nbsp;{" "}
                <span>Made with 💚 for Project Zomboid</span>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <a
                  href="https://discord.gg/EwWZUSR9tM"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: "#444",
                    color: "#eee",
                    padding: "8px 14px",
                    borderRadius: 12,
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "1rem",
                    transition: "background-color 0.3s ease, color 0.3s ease",
                    userSelect: "none",
                    cursor: "pointer",
                    border: "1px solid transparent",
                  }}
                >
                  <FaDiscord size={20} />
                  Discord
                </a>

                <a
                  href="https://ko-fi.com/modixgamepanel"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: "#444",
                    color: "#eee",
                    padding: "8px 14px",
                    borderRadius: 12,
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "1rem",
                    transition: "background-color 0.3s ease, color 0.3s ease",
                    userSelect: "none",
                    cursor: "pointer",
                    border: "1px solid transparent",
                  }}
                >
                  <FaCoffee size={20} />
                  Ko-fi
                </a>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
