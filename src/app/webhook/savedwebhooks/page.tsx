"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function SavedWebhooksPage() {
  const [savedWebhooks, setSavedWebhooks] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedWebhooks") || "[]");
    setSavedWebhooks(saved.reverse());
  }, []);

  return (
    <div
      style={{
        padding: 20,
        minHeight: "100vh",
        backgroundColor: "#121212",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <header
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>📦 Saved Webhooks</h1>
        <Link
          href="/webhook"
          style={{
            color: "#7289da",
            textDecoration: "underline",
            fontWeight: "bold",
          }}
        >
          ← Back to Webhook Sender
        </Link>
      </header>

      {savedWebhooks.length === 0 ? (
        <p>No saved webhooks found.</p>
      ) : (
        savedWebhooks.map(({ webhookUrl, embed, sentAt }, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#1f1f1f",
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
              borderLeft: `5px solid ${
                embed.color ? "#" + embed.color.toString(16) : "#7289da"
              }`,
              wordBreak: "break-word",
            }}
          >
            <div>
              <strong>Sent at:</strong> {new Date(sentAt).toLocaleString()}
            </div>
            <div>
              <strong>Webhook URL:</strong> {webhookUrl}
            </div>
            <div style={{ marginTop: 8 }}>
              <strong>Embed Title:</strong> {embed.title || "(none)"}
            </div>
            <div>
              <strong>Description:</strong> {embed.description || "(none)"}
            </div>
            {embed.fields && embed.fields.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <strong>Fields:</strong>
                <ul style={{ paddingLeft: 20 }}>
                  {embed.fields.map((field, idx) => (
                    <li key={idx}>
                      <strong>{field.name}:</strong> {field.value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {embed.footer && (
              <div>
                <strong>Footer:</strong> {embed.footer.text}
              </div>
            )}
            {embed.timestamp && (
              <div>
                <strong>Timestamp:</strong>{" "}
                {new Date(embed.timestamp).toLocaleString()}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
