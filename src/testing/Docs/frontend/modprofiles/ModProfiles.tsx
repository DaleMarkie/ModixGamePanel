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
        🧩 Mod Manager Profiles
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
        Mod Profiles allow you to create and switch between different mod
        collections easily. Each profile maintains its own list of mods,
        categories, and settings.
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#43b581", marginBottom: "0.5rem" }}>Features</h2>
        <ul style={{ lineHeight: 1.6, paddingLeft: "1.5rem" }}>
          <li>Create multiple mod profiles to organize different setups.</li>
          <li>Switch between profiles to quickly load different mod lists.</li>
          <li>Reset profiles to default mods at any time.</li>
          <li>
            Each profile stores mods, categories, and filter settings
            independently.
          </li>
          <li>
            Supports exporting mod lists per profile for backups or sharing.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#43b581", marginBottom: "0.5rem" }}>
          Using Mod Profiles
        </h2>
        <ol style={{ lineHeight: 1.6, paddingLeft: "1.5rem" }}>
          <li>
            Select a profile from the profile dropdown at the top of the Mod
            Manager.
          </li>
          <li>
            Create a new profile by entering a name and clicking "Create
            Profile".
          </li>
          <li>
            Each profile loads its own mods list, which you can customize
            independently.
          </li>
          <li>
            Reset the current profile to default mods using the reset button.
          </li>
          <li>
            Switch between list and grid views to display mods in your preferred
            style.
          </li>
          <li>
            Export or backup your profile’s mod list to keep your setups safe.
          </li>
        </ol>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#43b581", marginBottom: "0.5rem" }}>
          Tips & Best Practices
        </h2>
        <ul style={{ lineHeight: 1.6, paddingLeft: "1.5rem" }}>
          <li>
            Create separate profiles for different game modes or playstyles.
          </li>
          <li>
            Keep backups of your mod profiles to avoid losing custom setups.
          </li>
          <li>
            Regularly clean up unused profiles to keep your dashboard organized.
          </li>
          <li>
            Use descriptive profile names to easily identify your mod setups.
          </li>
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
