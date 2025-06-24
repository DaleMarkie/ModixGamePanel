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
        fontSize: "0.9rem",
        animation: "fadeIn 1s ease-in-out",
      }}
    >
      <FaCheckCircle
        size={72}
        color="#43b581"
        style={{ marginBottom: 18, filter: "drop-shadow(0 0 8px #43b581aa)" }}
      />
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "900",
          marginBottom: 6,
          userSelect: "none",
        }}
      >
        🎉 Modix Installed Successfully!
      </h1>
      <div
        style={{
          fontSize: "1rem",
          color: "#888",
          marginBottom: 18,
          fontWeight: "600",
          userSelect: "none",
        }}
      >
        v1.1.2
      </div>

      <p
        style={{
          fontSize: "1rem",
          maxWidth: 500,
          marginBottom: 12,
          lineHeight: 1.6,
          color: "#c0c0c0",
          userSelect: "none",
        }}
      >
        Your Modix Game Panel is now ready to manage your Project Zomboid
        server. You can start customizing your server, managing mods, and
        monitoring your gameplay experience right away.
      </p>

      <p
        style={{
          fontSize: "0.875rem",
          maxWidth: 500,
          marginBottom: 30,
          lineHeight: 1.5,
          color: "#888",
          fontStyle: "italic",
          userSelect: "none",
        }}
      >
        Note: This version may contain bugs or unfinished features. Thank you
        for your understanding!
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "18px",
          width: "100%",
          maxWidth: "600px",
          marginBottom: 30,
        }}
      >
        {/* Dashboard */}
        <Link
          href="/dashboard"
          style={{
            background: "linear-gradient(135deg, #43b581, #36a270)",
            padding: "12px 20px",
            borderRadius: 12,
            color: "#fff",
            fontWeight: "700",
            textDecoration: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 5px 15px rgba(67, 181, 129, 0.5)",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <FaGamepad size={18} />
          Go to Dashboard
        </Link>

        {/* Support */}
        <a
          href="/support"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "linear-gradient(135deg, #ff9f43, #cc7f2f)",
            padding: "12px 20px",
            borderRadius: 12,
            color: "#fff",
            fontWeight: "700",
            textDecoration: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 5px 15px rgba(255, 159, 67, 0.5)",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <FaLifeRing size={18} />
          Support
        </a>

        {/* Docs */}
        <a
          href="/docs"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "#2f3136",
            border: "2px solid #43b581",
            padding: "12px 20px",
            borderRadius: 12,
            color: "#e0e0e0",
            fontWeight: "700",
            textDecoration: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#43b581";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#2f3136";
            e.currentTarget.style.color = "#e0e0e0";
          }}
        >
          <FaBookOpen size={18} />
          Documentation
        </a>
      </div>

      <div
        style={{
          fontSize: "0.875rem",
          marginBottom: 25,
          maxWidth: 400,
          color: "#999",
          userSelect: "none",
        }}
      >
        <p>
          Need assistance or want to join the community? Connect with us on
          Discord or support development on Ko-fi!
        </p>
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        <a
          href="https://discord.gg/EwWZUSR9tM"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "#7289da",
            padding: "9px 18px",
            borderRadius: 10,
            color: "#fff",
            fontWeight: "700",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 12px rgba(114, 137, 218, 0.5)",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <FaDiscord size={18} />
          Discord
        </a>

        <a
          href="https://ko-fi.com/modixgamepanel"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "#ff5e57",
            padding: "9px 18px",
            borderRadius: 10,
            color: "#fff",
            fontWeight: "700",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 12px rgba(255, 94, 87, 0.5)",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <FaCoffee size={18} />
          Ko-fi
        </a>
      </div>
    </div>
  );
}
