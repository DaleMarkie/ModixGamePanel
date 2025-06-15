"use client";
import React from "react";
import Link from "next/link";
import {
  FaDiscord,
  FaCoffee,
  FaCheckCircle,
  FaGamepad,
  FaBookOpen,
  FaLifeRing,
} from "react-icons/fa";

export default function InstalledPage() {
  return (
    <div
      style={{
        backgroundColor: "#121212",
        color: "#e0e0e0",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 15px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        textAlign: "center",
        fontSize: "0.75rem", // base text 75%
      }}
    >
      <FaCheckCircle size={72} color="#43b581" style={{ marginBottom: 18 }} />
      <h1
        style={{
          fontSize: "2.25rem",
          fontWeight: "900",
          marginBottom: 6,
          userSelect: "none",
        }}
      >
        🎉 Modix Installed Successfully!
      </h1>
      <div
        style={{
          fontSize: "0.875rem",
          color: "#7a7a7a",
          marginBottom: 18,
          fontWeight: "600",
          userSelect: "none",
        }}
      >
        v1.1.2
      </div>

      <p
        style={{
          fontSize: "0.975rem",
          maxWidth: 450,
          marginBottom: 12,
          lineHeight: 1.5,
          color: "#b0b0b0",
          userSelect: "none",
        }}
      >
        Your Modix Game Panel is now ready to manage your Project Zomboid
        server. You can start customizing your server, managing mods, and
        monitoring your gameplay experience right away.
      </p>

      <p
        style={{
          fontSize: "0.85rem",
          maxWidth: 450,
          marginBottom: 24,
          lineHeight: 1.4,
          color: "#999",
          fontStyle: "italic",
          userSelect: "none",
        }}
      >
        Note: This version may contain bugs or unfinished features. Thank you
        for your understanding!
      </p>

      <div
        style={{
          display: "flex",
          gap: 18,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 30,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            backgroundColor: "#43b581",
            padding: "10.5px 27px",
            borderRadius: 9,
            color: "#fff",
            fontWeight: "700",
            fontSize: "0.9rem",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 9,
            boxShadow: "0 3px 11px rgba(67, 181, 129, 0.7)",
            transition: "background-color 0.3s ease",
            userSelect: "none",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#389d6e")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#43b581")
          }
          aria-label="Go to Dashboard"
        >
          <FaGamepad size={18} />
          Go to Dashboard
        </Link>

        <Link
          href="/games"
          style={{
            backgroundColor: "#5865f2",
            padding: "10.5px 27px",
            borderRadius: 9,
            color: "#fff",
            fontWeight: "700",
            fontSize: "0.9rem",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 9,
            boxShadow: "0 3px 11px rgba(88, 101, 242, 0.7)",
            transition: "background-color 0.3s ease",
            userSelect: "none",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#4759c4")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#5865f2")
          }
          aria-label="Pick Game"
        >
          <FaGamepad size={18} />
          Pick Game
        </Link>

        <a
          href="/support"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "#ff9f43",
            padding: "10.5px 27px",
            borderRadius: 9,
            color: "#fff",
            fontWeight: "700",
            fontSize: "0.9rem",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 9,
            boxShadow: "0 3px 11px rgba(255, 159, 67, 0.7)",
            transition: "background-color 0.3s ease",
            userSelect: "none",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#cc7f2f")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#ff9f43")
          }
          aria-label="Support"
        >
          <FaLifeRing size={18} />
          Support
        </a>

        <a
          href="/docs"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "#2f3136",
            padding: "10.5px 27px",
            borderRadius: 9,
            color: "#e0e0e0",
            fontWeight: "700",
            fontSize: "0.9rem",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 9,
            border: "2px solid #43b581",
            transition: "background-color 0.3s ease, color 0.3s ease",
            userSelect: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#43b581";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#2f3136";
            e.currentTarget.style.color = "#e0e0e0";
          }}
          aria-label="Open Documentation"
        >
          <FaBookOpen size={18} />
          Documentation
        </a>
      </div>

      <div
        style={{
          fontSize: "0.825rem",
          marginBottom: 30,
          maxWidth: 390,
          color: "#999",
          userSelect: "none",
        }}
      >
        <p>
          Need assistance or want to join the community? Connect with us on
          Discord or support development on Ko-fi!
        </p>
      </div>

      <div style={{ display: "flex", gap: 15 }}>
        <a
          href="https://discord.gg/EwWZUSR9tM"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: "#7289da",
            color: "#fff",
            padding: "7.5px 16.5px",
            borderRadius: 9,
            textDecoration: "none",
            fontWeight: "700",
            fontSize: "0.825rem",
            boxShadow: "0 3px 9px rgba(114, 137, 218, 0.7)",
            transition: "background-color 0.3s ease",
            userSelect: "none",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#5a6fbf")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#7289da")
          }
          aria-label="Join our Discord"
        >
          <FaDiscord size={18} />
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
            backgroundColor: "#ff5e57",
            color: "#fff",
            padding: "7.5px 16.5px",
            borderRadius: 9,
            textDecoration: "none",
            fontWeight: "700",
            fontSize: "0.825rem",
            boxShadow: "0 3px 9px rgba(255, 94, 87, 0.7)",
            transition: "background-color 0.3s ease",
            userSelect: "none",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#e84e48")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#ff5e57")
          }
          aria-label="Support us on Ko-fi"
        >
          <FaCoffee size={18} />
          Ko-fi
        </a>
      </div>
    </div>
  );
}
