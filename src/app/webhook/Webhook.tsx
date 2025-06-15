"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FaDiscord, FaCoffee } from "react-icons/fa";

export default function WebhookPage() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [embed, setEmbed] = useState({
    title: "",
    description: "",
    url: "",
    color: "#7289da",
    footer: "",
    timestamp: true,
    fields: [],
  });

  const updateField = (index, key, value) => {
    const newFields = [...embed.fields];
    newFields[index][key] = value;
    setEmbed({ ...embed, fields: newFields });
  };

  const addField = () => {
    setEmbed({ ...embed, fields: [...embed.fields, { name: "", value: "" }] });
  };

  const removeField = (index) => {
    const newFields = [...embed.fields];
    newFields.splice(index, 1);
    setEmbed({ ...embed, fields: newFields });
  };

  const sendWebhook = async () => {
    const embedPayload = {
      title: embed.title,
      description: embed.description,
      url: embed.url || undefined,
      color: parseInt(embed.color.replace("#", ""), 16),
      footer: embed.footer ? { text: embed.footer } : undefined,
      timestamp: embed.timestamp ? new Date().toISOString() : undefined,
      fields: embed.fields.length ? embed.fields : undefined,
    };

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embedPayload] }),
      });
      alert(res.ok ? "Webhook sent!" : "Failed to send webhook.");
    } catch (err) {
      alert("Error sending webhook.");
    }
  };

  return (
    <div
      className="app-wrapper"
      style={{
        backgroundColor: "#121212",
        color: "#fff",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <header
        style={{
          backgroundColor: "#1f1f1f",
          padding: "16px 24px",
          borderRadius: "12px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>
          📡 Webhook Sender
        </h1>
        <nav style={{ display: "flex", gap: "12px" }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/settings">Settings</Link>
          <Link href="/webhook">Webhook</Link>
        </nav>
      </header>

      <div
        className="webhook-grid"
        style={{
          display: "flex",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ background: "#1b1b1b", padding: 20, borderRadius: 12 }}>
            <label>Webhook URL</label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              style={{ width: "100%", marginBottom: 12 }}
            />

            <label>Embed Title</label>
            <input
              type="text"
              value={embed.title}
              onChange={(e) => setEmbed({ ...embed, title: e.target.value })}
              style={{ width: "100%", marginBottom: 12 }}
            />

            <label>Description</label>
            <textarea
              value={embed.description}
              onChange={(e) =>
                setEmbed({ ...embed, description: e.target.value })
              }
              style={{ width: "100%", marginBottom: 12 }}
            />

            <label>URL (optional)</label>
            <input
              type="text"
              value={embed.url}
              onChange={(e) => setEmbed({ ...embed, url: e.target.value })}
              style={{ width: "100%", marginBottom: 12 }}
            />

            <label>Footer</label>
            <input
              type="text"
              value={embed.footer}
              onChange={(e) => setEmbed({ ...embed, footer: e.target.value })}
              style={{ width: "100%", marginBottom: 12 }}
            />

            <label>Color</label>
            <input
              type="color"
              value={embed.color}
              onChange={(e) => setEmbed({ ...embed, color: e.target.value })}
              style={{ width: "100%", marginBottom: 12 }}
            />

            <label>
              <input
                type="checkbox"
                checked={embed.timestamp}
                onChange={(e) =>
                  setEmbed({ ...embed, timestamp: e.target.checked })
                }
              />
              &nbsp;Include Timestamp
            </label>

            <div style={{ marginTop: 20 }}>
              <h4>Fields</h4>
              {embed.fields.map((field, index) => (
                <div
                  key={index}
                  style={{ display: "flex", gap: 8, marginBottom: 8 }}
                >
                  <input
                    type="text"
                    placeholder="Field Name"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    placeholder="Field Value"
                    value={field.value}
                    onChange={(e) =>
                      updateField(index, "value", e.target.value)
                    }
                    style={{ flex: 1 }}
                  />
                  <button onClick={() => removeField(index)}>✖</button>
                </div>
              ))}
              <button onClick={addField} style={{ marginTop: 8 }}>
                ➕ Add Field
              </button>
            </div>

            <button
              onClick={sendWebhook}
              style={{
                marginTop: 20,
                backgroundColor: "#7289da",
                color: "#fff",
                padding: "10px 20px",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              🚀 Send Webhook
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 300 }}>
          <div
            style={{
              background: "#1e1e1e",
              padding: 20,
              borderRadius: 12,
              border: `2px solid ${embed.color}`,
            }}
          >
            <h3>📋 Live Preview</h3>
            {embed.title && (
              <div style={{ fontWeight: 700 }}>{embed.title}</div>
            )}
            {embed.description && <p>{embed.description}</p>}
            {embed.fields.map((field, i) => (
              <p key={i}>
                <strong>{field.name}</strong>: {field.value}
              </p>
            ))}
            {embed.footer && (
              <div style={{ fontSize: "0.9rem" }}>{embed.footer}</div>
            )}
            {embed.timestamp && (
              <div style={{ fontSize: "0.8rem", color: "#aaa", marginTop: 8 }}>
                {new Date().toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer
        style={{
          marginTop: 40,
          padding: "16px 24px",
          backgroundColor: "#1f1f1f",
          color: "#eee",
          borderRadius: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.9rem",
        }}
      >
        <div>
          <span>© 2025 MODIX</span> | <span>Made for Project Zomboid</span>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <a
            href="https://discord.gg/EwWZUSR9tM"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#444",
              color: "#eee",
              padding: "8px 14px",
              borderRadius: 12,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            <FaDiscord size={20} />
            Discord
          </a>

          <a
            href="https://ko-fi.com/modixgamepanel"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#444",
              color: "#eee",
              padding: "8px 14px",
              borderRadius: 12,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            <FaCoffee size={20} />
            Ko-fi
          </a>
        </div>
      </footer>
    </div>
  );
}
