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
  // Add your other links as needed
];

function FancyNavItem({ item }: { item: (typeof navLinks)[0] }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={item.href}
        style={{
          color: "white",
          textDecoration: "none",
          padding: "8px 12px",
          display: "inline-block",
          fontWeight: 500,
          transition: "all 0.2s",
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
            backgroundColor: "#222",
            borderRadius: "8px",
            padding: "8px 0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
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
          flexDirection: "column",
        }}
      >
        <ModuleProvider>
          <ContainerProvider>
            <UserProvider>
              {/* Fancy top navbar */}
              <header
                style={{
                  width: "100%",
                  backgroundColor: "#1E1E1E",
                  borderBottom: "1px solid #333",
                  padding: "12px 32px",
                  display: "flex",
                  gap: "16px",
                  flexWrap: "wrap",
                  alignItems: "center",
                  position: "sticky",
                  top: 0,
                  zIndex: 1000,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: "22px" }}>LOGO</div>
                <nav
                  style={{ display: "flex", gap: "16px", alignItems: "center" }}
                >
                  {navLinks.map((link, idx) => (
                    <FancyNavItem key={idx} item={link} />
                  ))}
                </nav>
              </header>

              {/* Main content */}
              <main
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "24px",
                  overflowY: "auto",
                }}
              >
                {children}
              </main>
            </UserProvider>
          </ContainerProvider>
        </ModuleProvider>
      </body>
    </html>
  );
}
