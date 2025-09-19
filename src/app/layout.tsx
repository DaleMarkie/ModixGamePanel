"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ModuleProvider } from "./ModuleContext";
import { UserProvider } from "./UserContext";
import { ContainerProvider } from "./ContainerContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const navLinks = [
  { label: "👤 Account Info", href: "/auth/myaccount" },
  { label: "📊 Dashboard", href: "/dashboard" },
  { label: "💻 Terminal", href: "/terminal" },
  { label: "📦 Mod Manager", href: "/workshop" },
  { label: "🗂️ File Manager", href: "/FileBrowser" },
  {
    label: "👥 Player Management",
    href: "/players",
    submenu: [
      { label: "🧍 All Players", href: "/PlayerManagement/AllPlayers" },
      { label: "🔍 Player Search", href: "/steamplayermanager" },
      { label: "💬 Chat Logs", href: "/PlayerManagement/ChatLogs" },
      { label: "⛔ Players Banned", href: "/PlayerManagement/PlayerBanned" },
    ],
  },
  {
    label: "🎮 Game Config",
    href: "/settings",
    submenu: [
      { label: "🗄️ Backup Server", href: "/server/backup" },
      { label: "⚙️ General Settings", href: "/server/ServerSettings" },
      { label: "🧑 User Permissions", href: "/RBAC" },
    ],
  },
];

function FancyNavItem({ item }: { item: (typeof navLinks)[0] }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{ position: "relative", display: "flex", flexDirection: "column" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={item.href}
        style={{
          color: "white",
          textDecoration: "none",
          padding: "8px 14px",
          fontWeight: 500,
          borderRadius: "6px",
          transition: "all 0.15s",
          whiteSpace: "nowrap",
        }}
      >
        {item.label}
      </Link>

      {item.submenu && open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            backgroundColor: "#1f1f1f",
            borderRadius: "8px",
            padding: "6px 0",
            boxShadow: "0 6px 12px rgba(0,0,0,0.6)",
            minWidth: "200px",
            zIndex: 1000,
          }}
        >
          {item.submenu.map((sub, idx) => (
            <FancyNavItem key={idx} item={sub} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          backgroundColor: "#121212",
          minHeight: "100vh",
          color: "white",
          margin: 0,
          padding: 0,
          fontFamily: "var(--font-geist-sans)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <ModuleProvider>
          <ContainerProvider>
            <UserProvider>
              <div
                style={{
                  maxWidth: "1400px",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  padding: "24px",
                }}
              >
                {/* Header */}
                <header
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    padding: "12px 24px",
                    backgroundColor: "#1f1f1f",
                    borderRadius: "12px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
                    flexWrap: "nowrap",
                  }}
                >
                  {/* Left: Logo */}
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#ffffff",
                      letterSpacing: "0.5px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Modix: Game Panel
                  </div>

                  {/* Center: Menu */}
                  <nav
                    style={{
                      display: "flex",
                      gap: "-100px",
                      justifyContent: "center",
                      flex: 1,
                      marginLeft: "6px",
                      marginRight: "-5px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {navLinks.map((link, idx) => (
                      <FancyNavItem key={idx} item={link} />
                    ))}
                  </nav>

                  {/* Right: Login Button */}
                  <div style={{ whiteSpace: "nowrap" }}>
                    <Link
                      href="/auth/login"
                      style={{
                        padding: "6px 16px",
                        backgroundColor: "#2a2a2a",
                        color: "#ffffff",
                        fontWeight: 500,
                        borderRadius: "6px",
                        textDecoration: "none",
                        transition: "all 0.2s",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#3a3a3a")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#2a2a2a")
                      }
                    >
                      Login
                    </Link>
                  </div>
                </header>

                {/* Main content */}
                <main
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "20px",
                  }}
                >
                  {children}
                </main>
              </div>
            </UserProvider>
          </ContainerProvider>
        </ModuleProvider>
      </body>
    </html>
  );
}
