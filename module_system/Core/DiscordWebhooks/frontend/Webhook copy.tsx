"use client";
import React, { useState } from "react";
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
      style={{
        backgroundColor: "#121212",
        color: "#fff",
        minHeight: "100vh",
        padding: "16px",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontSize: "1.6rem",
          marginBottom: 16,
          fontWeight: 600,
        }}
      >
        📡 Webhook Sender
      </h1>

      {/* Main Content */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* Form */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <div
            style={{
              background: "#1a1a1a",
              padding: 16,
              borderRadius: 10,
              fontSize: "0.9rem",
            }}
          >
            {/* Input Fields */}
            {[
              ["Webhook URL", webhookUrl, setWebhookUrl],
              [
                "Embed Title",
                embed.title,
                (v) => setEmbed({ ...embed, title: v }),
              ],
              [
                "Description",
                embed.description,
                (v) => setEmbed({ ...embed, description: v }),
                true,
              ],
              [
                "URL (optional)",
                embed.url,
                (v) => setEmbed({ ...embed, url: v }),
              ],
              [
                "Footer",
                embed.footer,
                (v) => setEmbed({ ...embed, footer: v }),
              ],
            ].map(([label, value, setter, isTextArea], i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <label style={{ display: "block", marginBottom: 4 }}>
                  {label}
                </label>
                {isTextArea ? (
                  <textarea
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 8,
                      background: "#222",
                      border: "none",
                      borderRadius: 6,
                      color: "#eee",
                    }}
                    rows={3}
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 8,
                      background: "#222",
                      border: "none",
                      borderRadius: 6,
                      color: "#eee",
                    }}
                  />
                )}
              </div>
            ))}

            {/* Color Picker */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4 }}>Color</label>
              <input
                type="color"
                value={embed.color}
                onChange={(e) => setEmbed({ ...embed, color: e.target.value })}
                style={{
                  width: "100%",
                  height: 36,
                  background: "#222",
                  border: "none",
                  borderRadius: 6,
                }}
              />
            </div>

            {/* Timestamp Toggle */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 12,
              }}
            >
              <input
                type="checkbox"
                checked={embed.timestamp}
                onChange={(e) =>
                  setEmbed({ ...embed, timestamp: e.target.checked })
                }
              />
              Include Timestamp
            </label>

            {/* Embed Fields */}
            <div style={{ marginBottom: 16 }}>
              <strong style={{ display: "block", marginBottom: 6 }}>
                Fields
              </strong>
              {embed.fields.map((field, index) => (
                <div
                  key={index}
                  style={{ display: "flex", gap: 6, marginBottom: 6 }}
                >
                  <input
                    type="text"
                    placeholder="Name"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    style={{
                      flex: 1,
                      padding: 6,
                      background: "#222",
                      border: "none",
                      borderRadius: 6,
                      color: "#eee",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={field.value}
                    onChange={(e) =>
                      updateField(index, "value", e.target.value)
                    }
                    style={{
                      flex: 1,
                      padding: 6,
                      background: "#222",
                      border: "none",
                      borderRadius: 6,
                      color: "#eee",
                    }}
                  />
                  <button
                    onClick={() => removeField(index)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#ff5f5f",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                    }}
                  >
                    ✖
                  </button>
                </div>
              ))}
              <button
                onClick={addField}
                style={{
                  marginTop: 4,
                  background: "#2a2a2a",
                  color: "#ccc",
                  padding: "6px 10px",
                  border: "none",
                  borderRadius: 6,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                ➕ Add Field
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={sendWebhook}
              style={{
                backgroundColor: "#7289da",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.95rem",
                width: "100%",
              }}
            >
              🚀 Send Webhook
            </button>
          </div>
        </div>

        {/* Preview */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <div
            style={{
              background: "#1d1d1d",
              padding: 16,
              borderRadius: 10,
              border: `2px solid ${embed.color}`,
              fontSize: "0.9rem",
            }}
          >
            <strong style={{ fontSize: "1rem" }}>📋 Live Preview</strong>
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
              <div style={{ fontSize: "0.85rem" }}>{embed.footer}</div>
            )}
            {embed.timestamp && (
              <div style={{ fontSize: "0.75rem", color: "#aaa", marginTop: 6 }}>
                {new Date().toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          marginTop: 24,
          padding: "12px 16px",
          backgroundColor: "#1f1f1f",
          color: "#aaa",
          borderRadius: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.85rem",
        }}
      >
        <span>© 2025 MODIX</span>
        <div style={{ display: "flex", gap: 10 }}>
          <a
            href="https://discord.gg/EwWZUSR9tM"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#2c2c2c",
              color: "#eee",
              padding: "6px 12px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            <FaDiscord size={16} />
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
              backgroundColor: "#2c2c2c",
              color: "#eee",
              padding: "6px 12px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            <FaCoffee size={16} />
            Ko-fi
          </a>
        </div>
      </footer>
    </div>
  );
}
