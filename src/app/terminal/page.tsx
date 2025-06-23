"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaDiscord, FaCoffee } from "react-icons/fa";
import Terminal from "../terminal/Terminal";

// Visible in menu with submenu items
const navLinks = [
  {
    label: "📊 Dashboard",
    href: "/dashboard",
    submenu: [
      { label: "Overview", href: "/dashboard/overview" },
      { label: "Stats", href: "/dashboard/stats" },
    ],
  },
  { label: "💻 Terminal", href: "/terminal" },
  {
    label: "📁 Files",
    href: "/filemanager",
    submenu: [
      { label: "File Upload", href: "/filemanager/upload" },
      { label: "File Browser", href: "/filemanager/browser" },
    ],
  },
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

const searchablePages = [
  ...navLinks.flatMap((link) => [link, ...(link.submenu || [])]),
  ...extraSearchPages,
];

export default function Dashboard2() {
  const [panelName, setPanelName] = useState("MODIX");
  const [headerBgColor, setHeaderBgColor] = useState("#1f1f1f");
  const [headerTextColor, setHeaderTextColor] = useState("#ffffff");
  const [backgroundImage, setBackgroundImage] = useState(
    'url("https://images7.alphacoders.com/627/thumb-1920-627909.jpg")'
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>(
    {}
  );

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

  // Toggle submenu open/close
  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
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
        display: "flex",
        flexDirection: "row", // side-by-side layout
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

      {/* Fixed Sidebar */}
      <nav
        style={{
          position: "fixed", // fixed to viewport
          top: 0,
          left: 0,
          width: 220,
          height: "100vh",
          backgroundColor: headerBgColor,
          color: headerTextColor,
          display: "flex",
          flexDirection: "column",
          padding: "20px 10px",
          borderTopRightRadius: 12,
          borderBottomRightRadius: 12,
          userSelect: "none",
          overflowY: "auto",
          zIndex: 1000,
        }}
      >
        <div
          className="logo"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 16,
            userSelect: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
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
                userSelect: "none",
              }}
            >
              {panelName}
            </span>
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: "700",
              color: "#f39c12",
              letterSpacing: 2,
              userSelect: "none",
            }}
          >
            BETA
          </span>
        </div>

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
            marginBottom: 20,
          }}
        />
        {searchQuery && filteredResults.length > 0 && (
          <div
            style={{
              backgroundColor: "#1e1e1e",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              marginBottom: 20,
              maxHeight: 240,
              overflowY: "auto",
              padding: "6px 0",
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

        <div style={{ flexGrow: 1 }}>
          {navLinks.map(({ href, label, submenu }) => (
            <div key={href} style={{ marginBottom: 8 }}>
              <div
                onClick={() => (submenu ? toggleSubmenu(label) : null)}
                style={{
                  padding: "12px 20px",
                  color: headerTextColor,
                  backgroundColor: "transparent",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: "1rem",
                  cursor: submenu ? "pointer" : "default",
                  userSelect: "none",
                  transition: "background-color 0.2s ease",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onMouseOver={(e) =>
                  !submenu &&
                  (e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.1)")
                }
                onMouseOut={(e) =>
                  !submenu &&
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {submenu ? (
                  <span>{label}</span>
                ) : (
                  <Link
                    href={href}
                    style={{
                      color: headerTextColor,
                      textDecoration: "none",
                      flexGrow: 1,
                      userSelect: "none",
                    }}
                  >
                    {label}
                  </Link>
                )}

                {submenu && (
                  <span
                    style={{
                      fontWeight: "bold",
                      userSelect: "none",
                      transform: openSubmenus[label]
                        ? "rotate(90deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    ▶
                  </span>
                )}
              </div>

              {/* Submenu */}
              {submenu && openSubmenus[label] && (
                <div
                  style={{
                    marginTop: 4,
                    marginLeft: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  {submenu.map(({ href: subHref, label: subLabel }) => (
                    <Link
                      key={subHref}
                      href={subHref}
                      style={{
                        padding: "8px 16px",
                        color: headerTextColor,
                        fontSize: "0.9rem",
                        borderRadius: 6,
                        textDecoration: "none",
                        userSelect: "none",
                        backgroundColor: "transparent",
                        transition: "background-color 0.2s ease",
                        cursor: "pointer",
                        display: "block",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "rgba(255,255,255,0.1)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      {subLabel}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main
        style={{
          marginLeft: 220, // offset for fixed sidebar
          position: "relative",
          zIndex: 2,
          flexGrow: 1,
          maxWidth: 1200,
          marginTop: 40,
          marginRight: 40,
          padding: "20px",
          backgroundColor: "rgba(30,30,30,0.85)",
          borderRadius: 12,
          boxShadow: "0 0 20px rgba(0,0,0,0.7)",
          minHeight: "calc(100vh - 80px)",
          overflow: "visible",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Terminal />

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
      </main>
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
