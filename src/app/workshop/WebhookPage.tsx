import React, { useState, useRef } from "react";
import "./Webhook.css";

// Webhook Modal Component
const WebhookModal = ({ onClose }) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#1DB954");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");

  const sendEmbed = async () => {
    if (!url.startsWith("https://discord.com/api/webhooks/")) {
      return setResult("Invalid Discord webhook URL.");
    }

    const payload = {
      embeds: [
        {
          title,
          description,
          color: parseInt(color.replace("#", ""), 16),
        },
      ],
    };

    try {
      setSending(true);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to send webhook.");
      setResult("✅ Embed sent successfully!");
    } catch (err) {
      console.error(err);
      setResult("❌ Failed to send webhook.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-header">📨 Send Discord Embed</h3>
        <input
          type="text"
          placeholder="Discord Webhook URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="modal-input"
        />
        <input
          type="text"
          placeholder="Embed Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="modal-input"
        />
        <textarea
          placeholder="Embed Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="modal-textarea"
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="modal-color"
        />
        <div className="modal-buttons">
          <button onClick={sendEmbed} disabled={sending} className="modal-button">
            {sending ? "Sending..." : "🚀 Send"}
          </button>
          <button onClick={onClose} className="modal-button close-button">
            ✖ Close
          </button>
        </div>
        {result && <div className="modal-result">{result}</div>}
      </div>
    </div>
  );
};

// Export Modal Component
const ExportModal = ({ modIds = ["123456789", "987654321"], onClose, listName = "Example List" }) => {
  const textareaRef = useRef(null);
  const formattedIds = modIds.join(",");

  const fallbackCopy = () => {
    if (!textareaRef.current) return;
    textareaRef.current.select();
    document.execCommand("copy");
    alert("Copied mod IDs to clipboard!");
  };

  const copyAll = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(formattedIds)
        .then(() => {
          alert("Copied mod IDs to clipboard!");
        })
        .catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-header">📦 Export Modlist: {listName}</h3>
        <p>Paste into your server.ini under WorkshopItems=</p>
        <textarea
          ref={textareaRef}
          readOnly
          value={formattedIds}
          className="modal-textarea"
          spellCheck={false}
        />
        <div className="modal-buttons">
          <button onClick={copyAll} className="modal-button copy-button">
            📋 Copy All
          </button>
          <button onClick={onClose} className="modal-button close-button">
            ✖ Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Page
const WebhookPage = () => {
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div className="webhook-page">
      <div className="webhook-actions">
        <button
          onClick={() => setShowWebhookModal(true)}
          className="action-button new-webhook-button"
        >
          ➕ New Webhook
        </button>
        <button
          onClick={() => setShowExportModal(true)}
          className="action-button export-button"
        >
          📤 Export
        </button>
      </div>

      {showWebhookModal && <WebhookModal onClose={() => setShowWebhookModal(false)} />}
      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} />}
    </div>
  );
};

export default WebhookPage;
