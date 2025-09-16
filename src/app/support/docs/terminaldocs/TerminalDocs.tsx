"use client";

import React, { useState, ChangeEvent } from "react";

export default function TerminalDocs() {
  const [feedback, setFeedback] = useState<string>("");
  const [rating, setRating] = useState<number | null>(null); // ✅ Fixed type
  const [submitted, setSubmitted] = useState<boolean>(false);

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
        {/* ... all other content remains unchanged ... */}
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
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setFeedback(e.target.value)
              }
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
