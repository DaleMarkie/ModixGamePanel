"use client";

import React, { useState } from "react";

export default function WebhookDocs() {
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
      {/* Back to Docs at the top */}
      {backToDocsButton}

      <img
        src="https://cdn-icons-png.flaticon.com/512/4315/4315574.png"
        alt="Webhook Illustration"
        style={{
          width: "100%",
          height: "auto",
          maxHeight: 300,
          borderRadius: 12,
          marginBottom: "2rem",
          objectFit: "contain",
          boxShadow: "0 8px 16px rgba(0,0,0,0.6)",
          backgroundColor: "#222",
          padding: 20,
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
        🔗 Webhook Integration
      </h1>
      <p
        style={{
          fontSize: "1.2rem",
          color: "#a0a0a0",
          marginBottom: "2rem",
          maxWidth: 700,
        }}
      >
        Webhooks let your Modix Game Panel automatically notify external
        services about important events like server status changes, mod updates,
        or player actions.
      </p>

      {/* --- GETTING STARTED --- */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#43b581", marginBottom: "0.5rem" }}>
          Getting Started
        </h2>
        <p style={{ lineHeight: 1.6, marginBottom: "1rem" }}>
          To set up a webhook, provide a URL endpoint where Modix will send HTTP
          POST requests whenever specific events occur on your Project Zomboid
          server.
        </p>
        <p style={{ lineHeight: 1.6, marginBottom: "1rem" }}>
          The payload contains JSON data describing the event details so your
          external system can process it.
        </p>

        <h3
          style={{
            color: "#43b581",
            marginTop: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          🔧 How It Works
        </h3>
        <ul style={{ lineHeight: 1.6, paddingLeft: "1.5rem" }}>
          <li>You configure a webhook URL inside Modix Game Panel.</li>
          <li>
            When an event (like server start, player join, or mod update)
            happens, Modix sends an HTTP POST to your URL.
          </li>
          <li>
            Your service receives the JSON payload and can take actions like
            updating dashboards, sending notifications, or logging data.
          </li>
          <li>
            Modix expects a 2xx HTTP status code to confirm successful delivery.
          </li>
        </ul>

        <h3
          style={{
            color: "#43b581",
            marginTop: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          📋 Supported Events
        </h3>
        <ul style={{ lineHeight: 1.6, paddingLeft: "1.5rem" }}>
          <li>
            <strong>server.started</strong> — when the server boots up.
          </li>
          <li>
            <strong>server.stopped</strong> — when the server shuts down.
          </li>
          <li>
            <strong>player.joined</strong> — when a player connects.
          </li>
          <li>
            <strong>player.left</strong> — when a player disconnects.
          </li>
          <li>
            <strong>mod.updated</strong> — when a mod is installed, updated, or
            removed.
          </li>
        </ul>

        <h3
          style={{
            color: "#43b581",
            marginTop: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          🔐 Security Tips
        </h3>
        <ul style={{ lineHeight: 1.6, paddingLeft: "1.5rem" }}>
          <li>Use HTTPS URLs to secure webhook data in transit.</li>
          <li>
            Validate incoming webhook payloads by verifying shared secrets or
            signatures.
          </li>
          <li>
            Restrict your webhook receiver to only accept requests from Modix
            IPs.
          </li>
        </ul>
      </section>

      {/* Example Payload */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#43b581", marginBottom: "0.5rem" }}>
          Example Payload
        </h2>
        <pre
          style={{
            backgroundColor: "#1c1c1c",
            padding: "1rem",
            borderRadius: 8,
            overflowX: "auto",
            fontSize: "0.9rem",
          }}
        >
          {`{
  "event": "player.joined",
  "timestamp": "2025-06-25T14:30:00Z",
  "data": {
    "playerName": "Survivor123",
    "playerId": "abc123",
    "serverId": "pz-server-01"
  }
}`}
        </pre>
      </section>

      {/* Troubleshooting */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#43b581", marginBottom: "0.5rem" }}>
          Troubleshooting
        </h2>
        <ul style={{ lineHeight: 1.6 }}>
          <li>Ensure your webhook URL is publicly reachable.</li>
          <li>Check your server logs for any non-2xx HTTP responses.</li>
          <li>
            Use tools like <code>ngrok</code> or request bin services for
            testing.
          </li>
          <li>
            Verify you handle retries gracefully because Modix retries on
            failures.
          </li>
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
