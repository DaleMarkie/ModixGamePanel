"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaDiscord, FaCoffee } from "react-icons/fa";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/terminallayout", label: "Terminal" },
  { href: "/filemanager", label: "File Manager" },
  { href: "/modmanager", label: "Mod Manager" },
  { href: "/workshop", label: "Workshop" },
  { href: "/settings", label: "Settings" },
];

export default function Home() {
  const [panelName, setPanelName] = useState("MODIX");
  const [headerBgColor, setHeaderBgColor] = useState("#1f1f1f");
  const [headerTextColor, setHeaderTextColor] = useState("#ffffff");
  const [backgroundImage, setBackgroundImage] = useState(
    'url("https://images7.alphacoders.com/627/thumb-1920-627909.jpg")'
  );
  const [gamesMenuOpen, setGamesMenuOpen] = useState(false);

  useEffect(() => {
    const storedBg = localStorage.getItem("headerBgColor");
    const storedText = localStorage.getItem("headerTextColor");
    if (storedBg) setHeaderBgColor(storedBg);
    if (storedText) setHeaderTextColor(storedText);
  }, []);

  const appWrapperStyle: React.CSSProperties = {
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

  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    pointerEvents: "none",
    zIndex: 1,
  };

  const headerStyle: React.CSSProperties = {
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

  const warningLabelStyle: React.CSSProperties = {
    backgroundColor: "#b33939",
    color: "#fff",
    textAlign: "center",
    padding: "6px 12px",
    fontWeight: 600,
    fontSize: "0.9rem",
    borderRadius: "0 0 12px 12px",
    userSelect: "none",
    marginTop: -6,
    marginBottom: 12,
    zIndex: 3,
  };

  const headerButtonStyle: React.CSSProperties = {
    color: headerTextColor,
    padding: "8px 14px",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "1rem",
    cursor: "pointer",
    borderRadius: 8,
    userSelect: "none",
    transition: "background-color 0.3s ease",
    display: "inline-block",
  };

  const footerStyle: React.CSSProperties = {
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

  const submenuContainerStyle: React.CSSProperties = {
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

  const submenuItemStyle: React.CSSProperties = {
    padding: "8px 16px",
    color: "#eee",
    textDecoration: "none",
    display: "block",
    fontWeight: 500,
    cursor: "pointer",
  };

  return (
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
              {navLinks.map(({ href, label }) => (
                <Link key={label} href={href} style={headerButtonStyle}>
                  {label}
                </Link>
              ))}

              <div
                style={{ ...headerButtonStyle, userSelect: "none", position: "relative" }}
                onMouseEnter={() => setGamesMenuOpen(true)}
                onMouseLeave={() => setGamesMenuOpen(false)}
              >
                Games
                <div style={submenuContainerStyle}>
                  <Link
                    href="/games"
                    style={submenuItemStyle}
                    onClick={() => setGamesMenuOpen(false)}
                  >
                    All Games
                  </Link>
                  <Link
                    href="/myservers"
                    style={submenuItemStyle}
                    onClick={() => setGamesMenuOpen(false)}
                  >
                    My Servers
                  </Link>
                </div>
              </div>

              {/* ✅ Login Button */}
              <Link
                href="/login"
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
            {/* Here you would render the page content for the current route in Next.js */}
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
  );
}
