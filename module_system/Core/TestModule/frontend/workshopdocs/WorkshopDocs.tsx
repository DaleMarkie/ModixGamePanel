"use client";

import React, { useState } from "react";

export default function WorkshopDocs() {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!feedback.trim() && rating === null) return;
    console.log("Feedback submitted:", { rating, feedback });
    setSubmitted(true);
  };

  const backToDocsButton = (
    <a
      href="/docs" // Adjust this if needed for your workshop docs URL
      style={{
        padding: "0.3rem 0.8rem",
        fontSize: "0.8rem",
        backgroundColor: "#43b581",
        color: "#000",
        fontWeight: "600",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        marginBottom: "1rem",
        display: "inline-block",
      }}
    >
      ← Back to Docs
    </a>
  );

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "1rem auto",
        padding: "0 1rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#e0e0e0",
        backgroundColor: "#121212",
        borderRadius: 12,
        boxShadow: "0 0 20px rgba(0,0,0,0.7)",
        minHeight: "80vh",
      }}
    >
      {/* Back to Docs */}
      {backToDocsButton}

      <img
        src="https://media.discordapp.net/attachments/1386780008919470162/1387223513886363698/image.png?ex=685c9013&is=685b3e93&hm=4fb30edd4159a6d2cdfe6a0ef591f59366dba98ef94b9a86033edc2af393485a&=&format=webp&quality=lossless&width=1491&height=753"
        alt="Workshop Illustration"
        style={{
          width: "100%",
          height: "auto",
          borderRadius: 12,
          marginBottom: "2rem",
          objectFit: "cover",
          boxShadow: "0 8px 16px rgba(0,0,0,0.6)",
        }}
      />

      <h1
        style={{
          fontSize: "1.8rem",
          marginBottom: "0.2rem",
          color: "#43b581",
          fontWeight: "700",
        }}
      >
        🛠️ Workshop Management
      </h1>
      <p
        style={{
          fontSize: "1.2rem",
          color: "#a0a0a0",
          marginBottom: "2rem",
          maxWidth: 700,
        }}
      >
        Manage your Project Zomboid mods seamlessly with the integrated Workshop
        feature in Modix Game Panel. Browse, install, update, and remove mods
        without leaving the dashboard.
      </p>

      {/* --- GETTING STARTED --- */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#43b581", marginBottom: "0.5rem" }}>
          Getting Started
        </h2>
        <p style={{ lineHeight: 1.6, marginBottom: "1rem" }}>
          The Workshop feature connects directly to Steam Workshop to let you
          browse and manage mods for your server quickly. You can subscribe to
          mods, see details, and apply updates with ease.
        </p>
        <p style={{ lineHeight: 1.6, marginBottom: "1rem" }}>
          Changes you make here sync with your server instance and Modix will
          handle downloading and updating mods automatically during restarts.
        </p>

        <h3
          style={{
            color: "#43b581",
            marginTop: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          🧠 Basic Usage
        </h3>
        <ul style={{ lineHeight: 1.6, paddingLeft: "1.5rem" }}>
          <li>Search and browse mods from the Workshop tab.</li>
          <li>Subscribe to mods to add them to your server.</li>
          <li>Manage mod load order for compatibility.</li>
          <li>Update mods manually or enable auto-updates.</li>
          <li>Unsubscribe to remove mods from your server.</li>
        </ul>

        <h3
          style={{
            color: "#43b581",
            marginTop: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          ⚙️ Features
        </h3>
        <ul style={{ lineHeight: 1.6, paddingLeft: "1.5rem" }}>
          <li>Direct Steam Workshop integration for live mod data.</li>
          <li>Automatic mod downloads and updates during server restarts.</li>
          <li>Mod conflict detection and load order management.</li>
          <li>Support for batch updates and mass uninstall.</li>
          <li>Real-time mod status and metadata.</li>
        </ul>

        <h3
          style={{
            color: "#43b581",
            marginTop: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          🛡️ Permissions & Security
        </h3>
        <ul style={{ lineHeight: 1.6, paddingLeft: "1.5rem" }}>
          <li>
            Only users with <code>workshop:manage</code> permission can modify
            mods.
          </li>
          <li>All mod changes are logged and auditable.</li>
          <li>
            Download sources are verified through Steam to prevent tampering.
          </li>
        </ul>

        <h3
          style={{
            color: "#43b581",
            marginTop: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          🪄 Advanced Tips
        </h3>
        <ul style={{ lineHeight: 1.6, paddingLeft: "1.5rem" }}>
          <li>Use load order settings to fix mod conflicts.</li>
          <li>Enable auto-update cautiously on production servers.</li>
          <li>
            Combine Workshop with Modix API for automated mod deployments.
          </li>
          <li>Keep backups before major mod changes.</li>
        </ul>

        <h3
          style={{
            color: "#43b581",
            marginTop: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          🚫 Known Limitations
        </h3>
        <ul style={{ lineHeight: 1.6, paddingLeft: "1.5rem" }}>
          <li>No offline mod installation support currently.</li>
          <li>Mod updates require server restarts to apply.</li>
          <li>Large mod lists may increase load time slightly.</li>
        </ul>
      </section>

      {/* Common Commands */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#43b581", marginBottom: "0.5rem" }}>
          Common Actions
        </h2>
        <ul style={{ lineHeight: 1.6 }}>
          <li>
            <code>Subscribe</code> – Add a mod to your server.
          </li>
          <li>
            <code>Unsubscribe</code> – Remove a mod from your server.
          </li>
          <li>
            <code>Update</code> – Download the latest mod version.
          </li>
          <li>
            <code>Set Load Order</code> – Adjust mod priority.
          </li>
          <li>
            <code>Refresh</code> – Reload mod list from Steam Workshop.
          </li>
        </ul>
      </section>

      {/* Tips */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#43b581", marginBottom: "0.5rem" }}>
          Tips & Best Practices
        </h2>
        <ul style={{ lineHeight: 1.6 }}>
          <li>Keep mods updated regularly to avoid compatibility issues.</li>
          <li>Test mod changes on a staging server first.</li>
          <li>Use Modix API to automate mod management workflows.</li>
          <li>Monitor mod dependencies and conflicts closely.</li>
        </ul>
      </section>

      {/* Support */}
      <section>
        <h2 style={{ color: "#43b581", marginBottom: "0.5rem" }}>
          Need More Help?
        </h2>
        <p>
          Visit our{" "}
          <a
            href="https://modix.app/docs/support"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#43b581", textDecoration: "underline" }}
          >
            Support & Tickets
          </a>{" "}
          page or join the Modix Discord community for real-time assistance.
        </p>
      </section>

      {/* Feedback */}
      <section
        style={{
          marginTop: "3rem",
          paddingTop: "2rem",
          borderTop: "1px solid #333",
        }}
      >
        <h2 style={{ color: "#43b581", marginBottom: "1rem" }}>
          💬 Was this page helpful?
        </h2>

        {!submitted ? (
          <>
            <div style={{ marginBottom: "1rem" }}>
              <button
                onClick={() => setRating(1)}
                style={{
                  marginRight: 10,
                  padding: "0.5rem 1rem",
                  backgroundColor: rating === 1 ? "#43b581" : "#1f1f1f",
                  border: "1px solid #43b581",
                  color: "#fff",
                  cursor: "pointer",
                  borderRadius: 8,
                }}
              >
                👍 Yes
              </button>
              <button
                onClick={() => setRating(0)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: rating === 0 ? "#e06c75" : "#1f1f1f",
                  border: "1px solid #e06c75",
                  color: "#fff",
                  cursor: "pointer",
                  borderRadius: 8,
                }}
              >
                👎 No
              </button>
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Leave a comment..."
              style={{
                width: "100%",
                minHeight: "100px",
                backgroundColor: "#1c1c1c",
                color: "#e0e0e0",
                border: "1px solid #333",
                borderRadius: 8,
                padding: "0.75rem",
                marginBottom: "1rem",
                resize: "vertical",
              }}
            />

            <button
              onClick={handleSubmit}
              style={{
                padding: "0.6rem 1.2rem",
                backgroundColor: "#43b581",
                color: "#000",
                fontWeight: 600,
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Submit Feedback
            </button>
          </>
        ) : (
          <p style={{ color: "#a0ffcc" }}>✅ Thank you for your feedback!</p>
        )}
      </section>

      {/* Back to Docs at the bottom */}
      {backToDocsButton}
    </main>
  );
}
