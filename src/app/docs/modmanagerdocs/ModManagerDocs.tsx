"use client";

import React, { useState } from "react";

export default function ModManagerDocs() {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Last edited date
  const lastEdited = "2025-06-25";

  const handleSubmit = () => {
    if (!feedback.trim() && rating === null) return;
    console.log("Feedback submitted:", { rating, feedback });
    setSubmitted(true);
  };

  const backToDocsButton = (
    <a
      href="/docs"
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
        padding: "1rem 2rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#e0e0e0",
        backgroundColor: "#121212",
        borderRadius: 12,
        boxShadow: "0 0 20px rgba(0,0,0,0.7)",
        minHeight: "80vh",
      }}
    >
      {backToDocsButton}

      <h1
        style={{
          fontSize: "2rem",
          marginBottom: "0.25rem",
          color: "#43b581",
          fontWeight: "700",
        }}
      >
        🧩 Mod Manager
      </h1>

      <p
        style={{
          fontSize: "0.9rem",
          color: "#666",
          marginTop: 0,
          marginBottom: "2rem",
          fontStyle: "italic",
          userSelect: "none",
        }}
      >
        Last Edited: {lastEdited}
      </p>

      <p
        style={{
          fontSize: "1.2rem",
          color: "#a0a0a0",
          marginBottom: "2rem",
          maxWidth: 700,
        }}
      >
        Manage your Project Zomboid mods easily with Modix Game Panel’s Mod
        Manager. Browse, categorize, enable, disable, and uninstall mods right
        from your dashboard.
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#43b581", marginBottom: "0.5rem" }}>Features</h2>
        <ul style={{ lineHeight: 1.6, paddingLeft: "1.5rem" }}>
          <li>Search mods by name or description.</li>
          <li>Filter mods by category, or add your own categories.</li>
          <li>Enable, disable, or uninstall mods with one click.</li>
          <li>Check for mod updates directly.</li>
          <li>Organize mods with customizable categories.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#43b581", marginBottom: "0.5rem" }}>
          Using the Mod Manager
        </h2>
        <ol style={{ lineHeight: 1.6, paddingLeft: "1.5rem" }}>
          <li>Use the search box to quickly find mods.</li>
          <li>Filter by category using the category buttons.</li>
          <li>
            Change a mod's category by selecting a new category from the
            dropdown.
          </li>
          <li>
            Click <strong>Enable</strong> or <strong>Disable</strong> to toggle
            mod states.
          </li>
          <li>
            Uninstall mods with the <strong>Uninstall</strong> button when no
            longer needed.
          </li>
          <li>
            Click <strong>Check for Updates</strong> to verify if a mod has a
            newer version.
          </li>
        </ol>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#43b581", marginBottom: "0.5rem" }}>
          Mod Categories
        </h2>
        <p style={{ lineHeight: 1.6, maxWidth: 700 }}>
          Mods are organized into categories to help you manage and find them
          quickly. You can filter mods by category using the buttons above the
          mod list. If you want to add a new category, use the "Add Category"
          input in the Mod Manager.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#43b581", marginBottom: "0.5rem" }}>
          Tips & Best Practices
        </h2>
        <ul style={{ lineHeight: 1.6, paddingLeft: "1.5rem" }}>
          <li>Always check for mod updates to avoid compatibility issues.</li>
          <li>Disable mods you’re not actively using to reduce server load.</li>
          <li>Organize mods into logical categories for easier maintenance.</li>
          <li>Back up your mod configurations before uninstalling mods.</li>
        </ul>
      </section>

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

      {backToDocsButton}
    </main>
  );
}
