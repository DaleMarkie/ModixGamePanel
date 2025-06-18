"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaDiscord, FaCoffee } from "react-icons/fa";
import UserManager from "../usermanager/UserManager";

// Visible in top nav
const navLinks = [
  { label: "📊 Dashboard", href: "/dashboard" },
  { label: "💻 Terminal", href: "/terminal" },
  { label: "📁 Files", href: "/filemanager" },
  { label: "🧩 Mod Manager", href: "/modmanager" },
  { label: "🛠 Workshop", href: "/workshop" },
  { label: "👥 Players", href: "/modules/steamplayermanager" },
  { label: "🔐 Login", href: "/login" },
];

// Only appear in search
const extraSearchPages = [
  { label: "📄 About", href: "/about" },
  { label: "📚 Docs", href: "/docs" },
  { label: "📬 Contact", href: "/contact" },
  { label: "👥 Team", href: "/team" },
  { label: "⚖️ Terms of Service", href: "/terms" },
  { label: "🔒 Privacy Policy", href: "/privacy" },
];

const searchablePages = [...navLinks, ...extraSearchPages];

export default function Dashboard() {
  const [panelName, setPanelName] = useState("MODIX");
  const [headerBgColor, setHeaderBgColor] = useState("#1f1f1f");
  const [headerTextColor, setHeaderTextColor] = useState("#ffffff");
  const [backgroundImage, setBackgroundImage] = useState(
    'url("https://images7.alphacoders.com/627/thumb-1920-627909.jpg")'
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    const storedBg = localStorage.getItem("headerBgColor");
    const storedText = localStorage.getItem("headerTextColor");
    if (storedBg) setHeaderBgColor(storedBg);
    if (storedText) setHeaderTextColor(storedText);
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredResults([]);
      return;
    }

    const matches = searchablePages.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredResults(matches);
  }, [searchQuery]);

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
            overflow: "visible",
          }}
        >
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
              style={{ display: "flex", alignItems: "center", gap: 8 }}
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
                {panelName}
              </span>
            </div>

            <nav
              className="top-menu"
              style={{
                display: "flex",
                gap: 20,
                position: "relative",
                zIndex: 3,
              }}
            >
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    color: headerTextColor,
                    padding: "8px 14px",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "1rem",
                    cursor: "pointer",
                    borderRadius: 8,
                    transition: "background-color 0.3s ease",
                    display: "inline-block",
                    whiteSpace: "nowrap",
                    userSelect: "none",
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </header>

          {/* 🔍 Search */}
          <div
            style={{
              padding: "16px 20px",
              position: "relative",
              zIndex: 10,
            }}
          >
            <input
              type="text"
              placeholder="🔍 Search Modix pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                fontSize: "1rem",
                backgroundColor: "#222",
                color: "#fff",
                outline: "none",
              }}
            />
            {searchQuery && filteredResults.length > 0 && (
              <div
                style={{
                  backgroundColor: "#1e1e1e",
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                  marginTop: 8,
                  maxHeight: 240,
                  overflowY: "auto",
                  padding: "6px 0",
                  position: "absolute",
                  width: "100%",
                  zIndex: 10,
                }}
              >
                {filteredResults.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      display: "block",
                      padding: "10px 14px",
                      color: "#ddd",
                      textDecoration: "none",
                      fontSize: "0.95rem",
                      borderBottom: "1px solid #333",
                      userSelect: "none",
                    }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <main className="main-content" style={{ flexGrow: 1, marginTop: 20 }}>
            <Welcome />
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
              <FooterLink href="https://discord.gg/EwWZUSR9tM">
                <FaDiscord size={16} /> Discord
              </FooterLink>
              <FooterLink href="https://ko-fi.com/modixgamepanel">
                <FaCoffee size={16} /> Ko-fi
              </FooterLink>
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/team">Team</FooterLink>
              <FooterLink href="/docs">Docs</FooterLink>
              <FooterLink href="/terms">Terms</FooterLink>
              <FooterLink href="/privacy">Privacy</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function FooterLink({ href, children }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : "_self"}
      rel="noopener noreferrer"
      style={{
        color: "#eee",
        padding: "6px 10px",
        textDecoration: "none",
        fontWeight: 600,
        fontSize: "0.75rem",
        borderRadius: 8,
        transition: "background-color 0.3s ease",
        display: "flex",
        alignItems: "center",
        gap: 6,
        userSelect: "none",
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#444")}
      onMouseOut={(e) =>
        (e.currentTarget.style.backgroundColor = "transparent")
      }
    >
      {children}
    </a>
  );
}
