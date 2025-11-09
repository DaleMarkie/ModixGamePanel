"use client";

import React, { useState, useEffect } from "react";
import { ChromePicker } from "react-color";
import { FaPlus, FaTrash, FaPaperPlane, FaSave } from "react-icons/fa";
import { getServerUrl } from "@/app/config";
import "./EmbededMessages.css";

interface EmbedMessage {
  id: string;
  name: string;
  title: string;
  description: string;
  color: string;
  thumbnail?: string;
  image?: string;
  webhookUrl: string;
}

export default function EmbedMessagesPage() {
  const [messages, setMessages] = useState<EmbedMessage[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeMsg = messages.find((m) => m.id === activeId);

  useEffect(() => {
    const saved = localStorage.getItem("modixEmbeds");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  const saveMessagesToStorage = (msgs: EmbedMessage[]) => {
    localStorage.setItem("modixEmbeds", JSON.stringify(msgs));
  };

  const updateActive = (key: keyof EmbedMessage, value: any) => {
    if (!activeMsg) return;
    const updated = messages.map((m) =>
      m.id === activeMsg.id ? { ...m, [key]: value } : m
    );
    setMessages(updated);
    saveMessagesToStorage(updated);
  };

  const addMessage = () => {
    const newMsg: EmbedMessage = {
      id: Date.now().toString(),
      name: "New Embed",
      title: "",
      description: "",
      color: "#5865F2",
      webhookUrl: "",
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    saveMessagesToStorage(updated);
    setActiveId(newMsg.id);
  };

  const removeMessage = (id: string) => {
    const updated = messages.filter((m) => m.id !== id);
    setMessages(updated);
    saveMessagesToStorage(updated);
    if (activeId === id) setActiveId(null);
  };

  const sendEmbed = async () => {
    if (!activeMsg) return;
    if (!activeMsg.webhookUrl) return setError("Webhook URL is required!");
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch(`${getServerUrl()}/api/embed/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...activeMsg, footer: "By Modix Game Panel" }),
      });
      const data = await res.json();
      if (res.ok) setSuccess("Embed sent!");
      else throw new Error(data.message || "Failed to send embed");
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="embed-page">
      <div className="embed-header">
        <h1>Embed Manager</h1>
        <button className="add-btn" onClick={addMessage}>
          <FaPlus /> New Embed
        </button>
      </div>

      <div className="embed-sidebar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`embed-sidebar-item ${
              msg.id === activeId ? "active" : ""
            }`}
            onClick={() => setActiveId(msg.id)}
          >
            <span>{msg.name}</span>
            <FaTrash
              className="trash-btn"
              onClick={(e) => {
                e.stopPropagation();
                removeMessage(msg.id);
              }}
            />
          </div>
        ))}
        {messages.length === 0 && <p className="empty-msg">No saved embeds.</p>}
      </div>

      {activeMsg && (
        <div className="embed-editor">
          <input
            type="text"
            placeholder="Name"
            value={activeMsg.name}
            onChange={(e) => updateActive("name", e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Title"
            value={activeMsg.title}
            onChange={(e) => updateActive("title", e.target.value)}
            className="input-field"
          />
          <textarea
            placeholder="Description"
            value={activeMsg.description}
            onChange={(e) => updateActive("description", e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Webhook URL"
            value={activeMsg.webhookUrl}
            onChange={(e) => updateActive("webhookUrl", e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Thumbnail URL"
            value={activeMsg.thumbnail || ""}
            onChange={(e) => updateActive("thumbnail", e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Image URL"
            value={activeMsg.image || ""}
            onChange={(e) => updateActive("image", e.target.value)}
            className="input-field"
          />

          <p>Color:</p>
          <ChromePicker
            color={activeMsg.color}
            onChange={(c) => updateActive("color", c.hex)}
            className="color-picker"
          />

          <div className="editor-actions">
            <button onClick={sendEmbed} disabled={loading} className="send-btn">
              <FaPaperPlane /> {loading ? "Sending..." : "Send"}
            </button>
            <button
              onClick={() => saveMessagesToStorage(messages)}
              className="send-btn"
            >
              <FaSave /> Save Embed
            </button>
          </div>
          {success && <p className="success">{success}</p>}
          {error && <p className="error">{error}</p>}
        </div>
      )}

      {activeMsg && (
        <div className="embed-preview" style={{ borderColor: activeMsg.color }}>
          <h2>{activeMsg.title}</h2>
          <p>{activeMsg.description}</p>
          {activeMsg.thumbnail && (
            <img src={activeMsg.thumbnail} className="preview-thumb" />
          )}
          {activeMsg.image && (
            <img src={activeMsg.image} className="preview-img" />
          )}
          <p className="footer">By Modix Game Panel</p>
        </div>
      )}
    </div>
  );
}
