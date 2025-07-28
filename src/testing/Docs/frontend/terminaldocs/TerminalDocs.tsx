"use client";

import React, { useState } from "react";

export default function TerminalDocs() {
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
      href="/docs" // Change this to your actual docs URL
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
      {/* Back to Docs at the top */}
      {backToDocsButton}

      <img
        src="https://media.discordapp.net/attachments/1386780008919470162/1387223513886363698/image.png?ex=685c9013&is=685b3e93&hm=4fb30edd4159a6d2cdfe6a0ef591f59366dba98ef94b9a86033edc2af393485a&=&format=webp&quality=lossless&width=1491&height=753"
        alt="Terminal Control Illustration"
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
        💻 Terminal Control
      </h1>
      <p
        style={{
          fontSize: "1.2rem",
          color: "#a0a0a0",
          marginBottom: "2rem",
          maxWidth: 700,
        }}
      >
        Use the integrated terminal in Modix Game Panel to run commands, manage
        your Project Zomboid server, and perform advanced operations without
        leaving the dashboard.
      </p>

      {/* --- GETTING STARTED --- */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#43b581", marginBottom: "0.5rem" }}>
          Getting Started
        </h2>
        <p style={{ lineHeight: 1.6, marginBottom: "1rem" }}>
          The Modix Terminal is a real-time command interface designed to give
          you direct control over your Project Zomboid server — similar to a
          remote SSH shell, but tailored for admin command execution and log
          monitoring.
        </p>
        <p style={{ lineHeight: 1.6, marginBottom: "1rem" }}>
          When you enter a command, it's sent to a backend daemon over a secure
          WebSocket connection. That daemon has elevated access to the game
          server instance and responds with the live output of the executed
          command. Responses are streamed back and displayed immediately under
          the input field.
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
          <li>
            Start typing in the input field at the bottom of the terminal area.
          </li>
          <li>
            Press <code>Enter</code> to execute the command.
          </li>
          <li>
            Use <code>↑</code> and <code>↓</code> arrows to scroll through
            previous commands (history is session-based).
          </li>
          <li>
            Output appears instantly. If a command runs long (e.g. log tailing),
            it will stream in real-time.
          </li>
          <li>
            Use <code>Ctrl + C</code> to abort certain active streams like{" "}
            <code>log tail</code>.
          </li>
        </ul>

        <h3
          style={{
            color: "#43b581",
            marginTop: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          ⚙️ Supported Command Types
        </h3>
        <ul style={{ lineHeight: 1.6, paddingLeft: "1.5rem" }}>
          <li>
            <strong>Game commands:</strong> Like <code>save</code>,{" "}
            <code>kick "username"</code>, or <code>banid</code>. These are
            routed directly to the game server console.
          </li>
          <li>
            <strong>Modix CLI commands:</strong> Internal helper commands like{" "}
            <code>mods list</code>, <code>log tail</code>, or{" "}
            <code>restart</code>.
          </li>
          <li>
            <strong>Batch commands:</strong> Chain commands using{" "}
            <code>&&</code> or <code>;</code> (e.g. <code>stop && start</code>).
          </li>
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
            Only users with the <code>terminal:execute</code> permission can
            send commands.
          </li>
          <li>
            All commands are logged, timestamped, and attributed to the issuing
            user.
          </li>
          <li>
            Dangerous operations may require elevated roles or confirmation
            prompts.
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
          <li>
            Use <code>log tail --filter ERROR</code> to only see error messages
            in live logs.
          </li>
          <li>
            Combine tasks: <code>mods update && restart</code>
          </li>
          <li>You can automate terminal commands using the Modix REST API.</li>
          <li>
            Output auto-scrolls, but can be paused by clicking inside the output
            window.
          </li>
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
          <li>No multi-line scripting — use the Scripts section instead.</li>
          <li>10-second timeout for most commands unless streaming output.</li>
          <li>Output truncated after ~10,000 characters per response.</li>
        </ul>
      </section>

      {/* Common Commands */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#43b581", marginBottom: "0.5rem" }}>
          Common Commands
        </h2>
        <ul style={{ lineHeight: 1.6 }}>
          <li>
            <code>status</code> – Check current server status.
          </li>
          <li>
            <code>start</code> – Start the server.
          </li>
          <li>
            <code>stop</code> – Stop the server safely.
          </li>
          <li>
            <code>restart</code> – Restart the server.
          </li>
          <li>
            <code>mods list</code> – Show installed mods.
          </li>
          <li>
            <code>log tail</code> – Stream real-time logs.
          </li>
        </ul>
      </section>

      {/* Tips */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#43b581", marginBottom: "0.5rem" }}>
          Tips & Best Practices
        </h2>
        <ul style={{ lineHeight: 1.6 }}>
          <li>
            Always run <code>stop</code> before config changes.
          </li>
          <li>
            Use <code>log tail</code> to watch for crashes live.
          </li>
          <li>Pair terminal use with Modix API for automation.</li>
          <li>Restart the terminal tab if you see stuck output.</li>
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
