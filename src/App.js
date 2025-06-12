import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { FaDiscord, FaCoffee } from "react-icons/fa";

import Welcome from "./components/welcome/Welcome";

// === Core Pages ===
import Dashboard2 from "./components/core/dashboard/Dashboard2";
import MyAccount from "./components/core/dashboard/MyAccount/MyAccount";
import Games from "./components/core/games/Games";
import Help from "./components/core/help/Help";
import Login from "./components/core/auth/login";
import Signup from "./components/core/auth/signup";
import UserManager from "./components/core/usermanager/UserManager";
import ServerHealth from "./components/core/serverhealth/ServerHealth";


// === Game Management ===
import MyServers from "./components/core/games/myservers/MyServers";
import GameManager from "./components/core/gamemanager/GameManager";
import SteamSetup from "./components/core/steamsetup/SteamSetup";
import PlayerManager from "./components/core/playermanager/PlayerManager";
import SteamPlayerManager from "./components/core/steamplayermanager/SteamPlayerManager";
import BanManager from "./components/core/games/projectzomboid/modules/pzbanmanager/BanManager";
import PzDatabase from "./components/core/games/projectzomboid/modules/pzdatabase/PzDatabase";
import PzModManager from "./components/core/games/projectzomboid/modules/pzmodmanager/PzModManager";
import PzPlayerManager from "./components/core/games/projectzomboid/modules/pzplayermanager/PzPlayerManager";
// === Server Tools ===
import TerminalLayout from "./components/core/terminal/TerminalLayout";
import FileManager from "./components/core/filemanager/FileManager";
import BackUpManager from "./components/core/backupmanager/BackUpManager";
import TaskManager from "./components/core/taskmanager/TaskManager";
import SystemMonitor from "./components/core/systemonitor/SystemMonitor";


// === Workshop / Mods ===
import Workshop from "./components/core/workshopmanager/Workshop";
import ModManager from "./components/core/workshopmanager/ModManager";
import Settings from "./components/core/workshopmanager/Settings";
import PluginManager from "./components/core/pluginmanager/PluginManager";
import SteamParser from "./components/core/steamparser/SteamParser";


// === Panel Customization ===
import PanelSettings from "./components/core/panelsettings/PanelSettings";
import ThemeManager from "./components/core/thememanager/ThemeManager";
import Webhook from "./components/core/webhook/Webhook";

// === Logs & Monitoring ===
import AuditLogs from "./components/core/auditlogs/AuditLogs";

function App() {
  const [panelName, setPanelName] = useState("MODIX");
  const [headerBgColor, setHeaderBgColor] = useState("#1f1f1f");
  const [headerTextColor, setHeaderTextColor] = useState("#ffffff");

  // Load backgroundImage from localStorage or use default
  const [backgroundImage, setBackgroundImage] = useState(
    () => localStorage.getItem("backgroundImage") || 'url("https://images7.alphacoders.com/627/thumb-1920-627909.jpg")'
  );
  const [gamesMenuOpen, setGamesMenuOpen] = useState(false);

  useEffect(() => {
    const storedBg = localStorage.getItem("headerBgColor");
    const storedText = localStorage.getItem("headerTextColor");
    if (storedBg) setHeaderBgColor(storedBg);
    if (storedText) setHeaderTextColor(storedText);
  }, []);

  // Save backgroundImage to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("backgroundImage", backgroundImage);
  }, [backgroundImage]);

  const appWrapperStyle = {
    backgroundColor: "#121212",
    backgroundImage,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center",
    minHeight: "100vh",
    transition: "background-color 0.3s ease, background-image 0.5s ease",
    position: "relative",
    zIndex: 0,
    color: "white",
  };

  // (rest of your styles and JSX unchanged...)

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

  // ...other styles omitted for brevity

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/terminallayout", label: "Terminal" },
    { to: "/filemanager", label: "File Manager" },
    { to: "/modmanager", label: "Mod Manager" },
    { to: "/workshop", label: "Workshop" },
    { to: "/settings", label: "Settings" },
  ];

  return (
    <Router>
      <div className="app-wrapper" style={appWrapperStyle}>
        <div style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",backgroundColor:"rgba(0,0,0,0.5)",pointerEvents:"none",zIndex:1}} />
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
                  <Link key={label} to={to} style={{color: headerTextColor, padding: "8px 14px", fontWeight: 600, fontSize: "1rem", textDecoration:"none"}}>
                    {label}
                  </Link>
                ))}

                {/* ... rest of nav and games menu unchanged ... */}

                <Link to="/login" style={{
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
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#555"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#3d3d3d"}
                >
                  Login
                </Link>
              </nav>
            </header>

            <div style={{
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
            }}>
              ⚠️ Modix is still in development. Some features may not work as expected.
            </div>

            <main className="main-content" style={{ flexGrow: 1, marginTop: 20 }}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard2 />} />
                <Route path="/myservers" element={<MyServers />} />
                <Route path="/filemanager" element={<FileManager />} />
                <Route path="/workshop" element={<Workshop />} />
                <Route path="/modmanager" element={<ModManager />} />
                <Route path="/playermanager" element={<PlayerManager />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/terminallayout" element={<TerminalLayout />} />
                <Route path="/webhook" element={<Webhook />} />
                <Route path="/help" element={<Help />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/games" element={<Games />} />
                <Route path="/dashboard2" element={<Dashboard2 />} />
                <Route
                  path="/thememanager"
                  element={<ThemeManager setBackgroundImage={setBackgroundImage} />}
                />
                <Route path="/gamemanager" element={<GameManager />} />
                <Route path="/myaccount" element={<MyAccount />} />
                <Route path="/panelsettings" element={<PanelSettings />} />
                <Route path="/backupmanager" element={<BackUpManager />} />
                <Route path="/system-monitor" element={<SystemMonitor />} />
                <Route path="/taskmanager" element={<TaskManager />} />
                <Route path="/steamplayermanager" element={<SteamPlayerManager />} />
                <Route path="/pluginmanager" element={<PluginManager />} /> 
                <Route path="/auditlogs" element={<AuditLogs />} /> 
                <Route path="/steamparser" element={<SteamParser />} />
                <Route path="/usermanager" element={<UserManager />} />
                <Route path="/pzbanmanager" element={<BanManager />} />
                <Route path="/pzdatabase" element={<PzDatabase />} />
                <Route path="/pzmodmanager" element={<PzModManager />} /> 
                <Route path="/pzplayermanager" element={<PzPlayerManager />} />      
                <Route path="/steamparser" element={<SteamParser />} />  
                <Route path="/serverhealth" element={<ServerHealth />} />
     
              </Routes>
            </main>

            <footer style={{
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
            }}>
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