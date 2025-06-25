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
        padding: "30px 15px", // 40*0.75=30, 20*0.75=15
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        textAlign: "center",
        fontSize: "0.75rem", // 1rem * 0.75
        maxWidth: 1200, // 1200 * 0.75
        margin: "0 auto",
        gap: 18, // 24 * 0.75
      }}
    >
      <FaCheckCircle
        size={60} // 80 * 0.75
        color="#43b581"
        style={{
          marginBottom: 9, // 12 * 0.75
          userSelect: "none",
        }}
      />

      <h1
        style={{
          fontSize: "2.1rem", // 2.8 * 0.75
          fontWeight: "900",
          marginBottom: 9, // 12 * 0.75
          userSelect: "none",
          color: "#43b581",
          lineHeight: 1.1,
        }}
      >
        🎉 Welcome to Modix!
      </h1>

      <p
        style={{
          fontSize: "0.86rem", // 1.15 * 0.75
          maxWidth: 600, // 600 * 0.75
          marginBottom: 13.5, // 18 * 0.75
          lineHeight: 1.6,
          color: "#cfd8dc",
          userSelect: "none",
          fontWeight: "600",
        }}
      >
        Your Modix Game Panel has been installed successfully and is now ready
        to power your Project Zomboid experience.
      </p>

      {/* New login/signup info paragraph */}
      <p
        style={{
          fontSize: "0.75rem",
          maxWidth: 450,
          marginBottom: 18,
          lineHeight: 1.5,
          color: "#a0a0a0",
          fontStyle: "italic",
          userSelect: "none",
        }}
      >
        Please <strong>login</strong> to access the panel. It’s free for
        personal use, and signing up takes just a few minutes.
      </p>

      <p
        style={{
          fontSize: "0.75rem", // 1 * 0.75
          maxWidth: 450, // 600 * 0.75
          marginBottom: 24, // 32 * 0.75
          lineHeight: 1.5,
          color: "#a0a0a0",
          fontStyle: "italic",
          userSelect: "none",
        }}
      >
        This panel helps you effortlessly manage mods, customize server
        settings, and monitor your gameplay — all in one clean, modern
        interface.
      </p>

      <section
        style={{
          backgroundColor: "#1e1e1e",
          padding: "18px 22.5px", // 24*0.75=18, 30*0.75=22.5
          borderRadius: 10.5, // 14 * 0.75
          maxWidth: 525, // 700 * 0.75
          userSelect: "none",
        }}
      >
        <h2
          style={{
            fontSize: "1.2rem", // 1.6 * 0.75
            fontWeight: "700",
            marginBottom: 12, // 16 * 0.75
            color: "#43b581",
            letterSpacing: "0.022em", // 0.03em * 0.75 approx
          }}
        >
          What’s next?
        </h2>
        <ul
          style={{
            listStyle: "none",
            paddingLeft: 0,
            textAlign: "left",
            color: "#c0c0c0",
            fontSize: "0.825rem", // 1.1 * 0.75
            lineHeight: 1.6,
          }}
        >
          <li
            style={{
              marginBottom: 9, // 12 * 0.75
              display: "flex",
              alignItems: "center",
              gap: 6, // 8 * 0.75
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", // 160 * 0.75 = 120
          gap: 13.5, // 18 * 0.75
          width: "100%",
          maxWidth: 525, // 700 * 0.75
          marginBottom: 22.5, // 30 * 0.75
        }}
      >
        {/* Login */}
        <Link
          href="/login"
          style={{
            backgroundColor: "#43b581",
            padding: "10.5px 16.5px", // 14*0.75=10.5, 22*0.75=16.5
            borderRadius: 9, // 12 * 0.75
            color: "#fff",
            fontWeight: "700",
            textDecoration: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6, // 8 * 0.75
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
          href="/signup"
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

      <div
        style={{
          fontSize: "0.675rem", // 0.9 * 0.75
          maxWidth: 315, // 420 * 0.75
          color: "#999",
          userSelect: "none",
          marginBottom: 18, // 24 * 0.75
          lineHeight: 1.4,
        }}
      >
        <p>
          Need help or want to connect with fellow users? Join our community on
          Discord or support the project on Ko-fi!
        </p>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <a
          href="https://discord.gg/EwWZUSR9tM"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "#5865f2",
            padding: "7.5px 16.5px", // 10*0.75=7.5, 22*0.75=16.5
            borderRadius: 7.5, // 10 * 0.75
            color: "#fff",
            fontWeight: "700",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 6, // 8 * 0.75
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
