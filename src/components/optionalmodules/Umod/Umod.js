import React, { useState } from "react";
import "./Umod.css";

function Umod() {
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
    <div className="webhook-container">
      <h2 className="webhook-title">📡 Webhook Sender</h2>
      <div className="webhook-grid">
        <div className="webhook-form">
          <label>Webhook URL</label>
          <input
            type="text"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://discord.com/api/webhooks/..."
          />

          <label>Embed Title</label>
          <input
            type="text"
            value={embed.title}
            onChange={(e) => setEmbed({ ...embed, title: e.target.value })}
          />

          <label>Description</label>
          <textarea
            value={embed.description}
            onChange={(e) => setEmbed({ ...embed, description: e.target.value })}
          />

          <label>URL (optional)</label>
          <input
            type="text"
            value={embed.url}
            onChange={(e) => setEmbed({ ...embed, url: e.target.value })}
          />

          <label>Footer</label>
          <input
            type="text"
            value={embed.footer}
            onChange={(e) => setEmbed({ ...embed, footer: e.target.value })}
          />

          <label>Color</label>
          <input
            type="color"
            value={embed.color}
            onChange={(e) => setEmbed({ ...embed, color: e.target.value })}
          />

          <label>
            <input
              type="checkbox"
              checked={embed.timestamp}
              onChange={(e) => setEmbed({ ...embed, timestamp: e.target.checked })}
            />
            Include Timestamp
          </label>

          <div className="embed-fields">
            <h4>Fields</h4>
            {embed.fields.map((field, index) => (
              <div className="field-row" key={index}>
                <input
                  type="text"
                  placeholder="Field Name"
                  value={field.name}
                  onChange={(e) => updateField(index, "name", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Field Value"
                  value={field.value}
                  onChange={(e) => updateField(index, "value", e.target.value)}
                />
                <button className="remove-btn" onClick={() => removeField(index)}>✖</button>
              </div>
            ))}
            <button className="add-field-btn" onClick={addField}>+ Add Field</button>
          </div>

          <button className="send-btn" onClick={sendWebhook}>🚀 Send Webhook</button>
        </div>

        <div className="webhook-preview">
          <h3>📋 Live Preview</h3>
          <div className="embed-preview" style={{ borderColor: embed.color }}>
            {embed.title && <div className="embed-title">{embed.title}</div>}
            {embed.description && <div className="embed-description">{embed.description}</div>}
            {embed.fields.map((field, i) => (
              <div key={i} className="embed-field">
                <strong>{field.name}</strong>: {field.value}
              </div>
            ))}
            {embed.footer && <div className="embed-footer">{embed.footer}</div>}
            {embed.timestamp && (
              <div className="embed-timestamp">
                {new Date().toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Umod;
