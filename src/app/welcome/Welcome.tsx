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
        fontSize: "0.75rem",
        maxWidth: 1200,
        margin: "0 auto",
        gap: 18,
      }}
    >
      <FaCheckCircle
        size={60}
        color="#43b581"
        style={{ marginBottom: 9, userSelect: "none" }}
      />

      <h1
        style={{
          fontSize: "2.1rem",
          fontWeight: "900",
          marginBottom: 9,
          userSelect: "none",
          color: "#43b581",
          lineHeight: 1.1,
        }}
      >
        🎉 Welcome to Modix!
      </h1>

      <p
        style={{
          fontSize: "0.86rem",
          maxWidth: 600,
          marginBottom: 13.5,
          lineHeight: 1.6,
          color: "#cfd8dc",
          userSelect: "none",
          fontWeight: "600",
        }}
      >
        Your Modix Game Panel has been installed successfully and is now ready
        to power your Project Zomboid experience.
      </p>

      {/* Improved Access Info Section with two buttons */}
      <section
        aria-label="Access information and panel benefits"
        style={{
          maxWidth: 450,
          margin: "0 auto 24px",
          color: "#a0a0a0",
          fontSize: "0.85rem",
          lineHeight: 1.5,
          fontStyle: "italic",
          userSelect: "none",
          textAlign: "center",
        }}
      >
        <p
          aria-label="Login prompt"
          style={{
            marginBottom: 14,
            fontWeight: 600,
            color: "#cfd8dc",
          }}
        >
          Please <strong>log in</strong> to access the panel — it’s free for
          personal use and quick to sign up.
        </p>

        <p aria-label="Panel features description" style={{ fontWeight: 400 }}>
          Manage your mods, customize settings, and monitor gameplay
          effortlessly — all within one sleek, modern interface.
        </p>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "center",
            gap: 16,
            userSelect: "none",
          }}
        >
          <button
            type="button"
            style={{
              backgroundColor: "#ff9f43",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 24px",
              fontWeight: "700",
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.3s ease",
              userSelect: "none",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#cc7f2f")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#ff9f43")
            }
            onClick={() => {
              // Replace with your tutorial start logic
              alert("Starting tutorial...");
            }}
          >
            Start tutorial
          </button>
        </div>
      </section>

      {/* Next Steps Section */}
      <section
        style={{
          backgroundColor: "#1e1e1e",
          padding: "18px 22.5px",
          borderRadius: 10.5,
          maxWidth: 525,
          userSelect: "none",
          textAlign: "left",
          width: "100%",
        }}
      >
        <h2
          style={{
            fontSize: "1.2rem",
            fontWeight: "700",
            marginBottom: 12,
            color: "#43b581",
            letterSpacing: "0.022em",
          }}
        >
          What’s next?
        </h2>
        <ul
          style={{
            listStyle: "none",
            paddingLeft: 0,
            color: "#c0c0c0",
            fontSize: "0.825rem",
            lineHeight: 1.6,
          }}
        >
          <li
            style={{
              marginBottom: 9,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FaCheckCircle color="#43b581" />
            Explore the <strong>Login</strong> to view your server status and
            quick actions.
          </li>
          <li
            style={{
              marginBottom: 9,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FaCheckCircle color="#43b581" />
            Manage your mods easily and keep your gameplay fresh and exciting.
          </li>
          <li
            style={{
              marginBottom: 9,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FaCheckCircle color="#43b581" />
            Customize your server settings with ease for the best experience.
          </li>
        </ul>
      </section>

      {/* Action Buttons Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 13.5,
          width: "100%",
          maxWidth: 525,
          marginBottom: 22.5,
          marginTop: 18,
        }}
      >
        {/* Login */}
        <Link
          href="/auth/login"
          style={{
            backgroundColor: "#43b581",
            padding: "10.5px 16.5px",
            borderRadius: 9,
            color: "#fff",
            fontWeight: "700",
            textDecoration: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            userSelect: "none",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#36a270")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#43b581")
          }
        >
          <FaGamepad size={13.5} />
          Login
        </Link>

        {/* Sign Up */}
        <Link
          href="/auth/signup"
          style={{
            backgroundColor: "#ff9f43",
            padding: "10.5px 16.5px",
            borderRadius: 9,
            color: "#fff",
            fontWeight: "700",
            textDecoration: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            userSelect: "none",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#cc7f2f")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#ff9f43")
          }
        >
          <FaLifeRing size={13.5} />
          Sign Up
        </Link>

        {/* Recover Account */}
        <Link
          href="/recover"
          style={{
            backgroundColor: "transparent",
            border: "2px solid #43b581",
            padding: "10.5px 16.5px",
            borderRadius: 9,
            color: "#43b581",
            fontWeight: "700",
            textDecoration: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            userSelect: "none",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#43b581";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#43b581";
          }}
        >
          <FaBookOpen size={13.5} />
          Recover Account
        </Link>
      </div>

      {/* Community & Support Info */}
      <div
        style={{
          fontSize: "0.675rem",
          maxWidth: 315,
          color: "#999",
          userSelect: "none",
          marginBottom: 18,
          lineHeight: 1.4,
        }}
      >
        <p>
          Need help or want to connect with fellow users? Join our community on
          Discord or support the project on Ko-fi!
        </p>
      </div>

      {/* Social Links */}
      <div style={{ display: "flex", gap: 12 }}>
        <a
          href="https://discord.gg/EwWZUSR9tM"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "#5865f2",
            padding: "7.5px 16.5px",
            borderRadius: 7.5,
            color: "#fff",
            fontWeight: "700",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
            userSelect: "none",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#4752c4")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#5865f2")
          }
        >
          <FaDiscord size={13.5} />
          Discord
        </a>
        <a
          href="https://ko-fi.com/modixgamepanel"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "#ff5e57",
            padding: "7.5px 16.5px",
            borderRadius: 7.5,
            color: "#fff",
            fontWeight: "700",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
            userSelect: "none",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#e04a46")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#ff5e57")
          }
        >
          <FaCoffee size={13.5} />
          Ko-fi
        </a>
      </div>
    </div>
  );
}
