"use client";

import React, { useState, useEffect, MouseEvent } from "react";
import Link from "next/link";
import { FaDiscord, FaCoffee } from "react-icons/fa";
import Games from "./Games";

// FIX: Define or import Workshop component
const Workshop: React.FC = () => {
  return <div>Workshop Component Placeholder</div>;
};

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/terminal", label: "Terminal" },
  { href: "/filemanager", label: "FileManager" },
  { href: "/modmanager", label: "Mod Manager" },
  { href: "/workshop", label: "Workshop" },
  { href: "/serversettings", label: "Settings" },
];

export default function Dashboard() {
  const [panelName, setPanelName] = useState<string>("MODIX");
  const [headerBgColor, setHeaderBgColor] = useState<string>("#1f1f1f");
  const [headerTextColor, setHeaderTextColor] = useState<string>("#ffffff");
  const [backgroundImage, setBackgroundImage] = useState<string>(
    'url("https://images7.alphacoders.com/627/thumb-1920-627909.jpg")'
  );
  const [gamesMenuOpen, setGamesMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const storedBg = localStorage.getItem("headerBgColor");
    const storedText = localStorage.getItem("headerTextColor");
    if (storedBg) setHeaderBgColor(storedBg);
    if (storedText) setHeaderTextColor(storedText);
  }, []);

  const handleMouseEnter = (
    e: MouseEvent<HTMLAnchorElement>,
    color: string
  ) => {
    e.currentTarget.style.backgroundColor = color;
  };

  const handleMouseLeave = (
    e: MouseEvent<HTMLAnchorElement>,
    color: string
  ) => {
    e.currentTarget.style.backgroundColor = color;
  };

  return (
    <div
      className="app-wrapper"
      style={{
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
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
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
          <header
            style={{
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
            }}
          >
            <div
              className="logo"
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "default",
                gap: 8,
              }}
            >
              <img
                src="https://i.ibb.co/cMPwcn8/logo.png"
                alt="Modix Logo"
                style={{ height: 50, objectFit: "contain" }}
              />
              <span
                style={{
                  fontWeight: 900,
                  fontSize: "1.6rem",
                  color: "inherit",
                }}
              >
                MODIX
              </span>
            </div>

            <nav
              className="top-menu"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                position: "relative",
              }}
            >
              {navLinks.map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  style={{
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
                  }}
                >
                  {label}
                </Link>
              ))}

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
                onMouseEnter={(e) => handleMouseEnter(e, "#555")}
                onMouseLeave={(e) => handleMouseLeave(e, "#3d3d3d")}
              >
                Login
              </Link>
            </nav>
          </header>

          <main className="main-content" style={{ flexGrow: 1, marginTop: 20 }}>
            <Workshop />
          </main>

          <footer
            style={{
              marginTop: 24,
              padding: "16px 24px",
              backgroundColor: "#1f1f1f",
              color: "#eee",
              borderRadius: "0 0 12px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              userSelect: "none",
              zIndex: 2,
            }}
          >
            <div>
              <span>© 2025 {panelName}</span> &nbsp;|&nbsp;{" "}
              <span>Made with 💚 for Project Zomboid</span>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
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
                  padding: "6px 10px",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  transition: "background-color 0.3s ease, color 0.3s ease",
                  userSelect: "none",
                  cursor: "pointer",
                  border: "1px solid transparent",
                }}
              >
                <FaDiscord />
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
                  padding: "6px 10px",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  transition: "background-color 0.3s ease, color 0.3s ease",
                  userSelect: "none",
                  cursor: "pointer",
                  border: "1px solid transparent",
                }}
              >
                <FaCoffee />
                Ko-fi
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
