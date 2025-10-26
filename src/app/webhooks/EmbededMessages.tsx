"use client";

import React, { useState } from "react";
import { ChromePicker } from "react-color";
import { FaPlus, FaTrash, FaPaperPlane } from "react-icons/fa";
import { getServerUrl } from "@/app/config";
import "./EmbededMessages.css";

interface EmbedField {
  name: string;
  value: string;
  inline: boolean;
}

interface EmbedMessage {
  id: string;
  name: string;
  title: string;
  description: string;
  color: string;
  fields?: EmbedField[];
  thumbnail?: string;
  image?: string;
}

export default function EmbedMessagesPage() {
  const [messages, setMessages] = useState<EmbedMessage[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeMsg = messages.find((m) => m.id === activeId);

  const updateActive = (key: keyof EmbedMessage, value: any) => {
    if (!activeMsg) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === activeMsg.id ? { ...m, [key]: value } : m))
    );
  };

  const addMessage = () => {
    const newMsg: EmbedMessage = {
      id: Date.now().toString(),
      name: "New Message",
      title: "",
      description: "",
      color: "#5865F2",
      fields: [],
    };
    setMessages([...messages, newMsg]);
    setActiveId(newMsg.id);
  };

  const removeMessage = (id: string) => {
    setMessages(messages.filter((m) => m.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const addField = () => {
    if (!activeMsg) return;
    updateActive("fields", [
      ...(activeMsg.fields || []),
      { name: "", value: "", inline: false },
    ]);
  };

  const removeField = (index: number) => {
    if (!activeMsg) return;
    const newFields = [...(activeMsg.fields || [])];
    newFields.splice(index, 1);
    updateActive("fields", newFields);
  };

  const updateField = (index: number, key: keyof EmbedField, value: any) => {
    if (!activeMsg) return;
    const newFields = [...(activeMsg.fields || [])];
    newFields[index][key] = value;
    updateActive("fields", newFields);
  };

  const sendEmbed = async () => {
    if (!activeMsg) return;
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
      <h1 className="embed-title">Embed Message Manager</h1>

      <div className="embed-container">
        {/* Sidebar */}
        <div className="embed-sidebar">
          <h3>Messages</h3>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`embed-sidebar-item ${
                msg.id === activeId ? "active" : ""
              }`}
            >
              <span onClick={() => setActiveId(msg.id)}>{msg.name}</span>
              <button
                onClick={() => removeMessage(msg.id)}
                className="trash-btn"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button onClick={addMessage} className="add-btn">
            <FaPlus /> Add Message
          </button>
        </div>

        {/* Editor */}
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

            <h4>Fields</h4>
            {(activeMsg.fields || []).map((f, idx) => (
              <div key={idx} className="field-row">
                <input
                  placeholder="Name"
                  value={f.name}
                  onChange={(e) => updateField(idx, "name", e.target.value)}
                />
                <input
                  placeholder="Value"
                  value={f.value}
                  onChange={(e) => updateField(idx, "value", e.target.value)}
                />
                <label>
                  Inline
                  <input
                    type="checkbox"
                    checked={f.inline}
                    onChange={(e) =>
                      updateField(idx, "inline", e.target.checked)
                    }
                  />
                </label>
                <button onClick={() => removeField(idx)} className="trash-btn">
                  <FaTrash />
                </button>
              </div>
            ))}
            <button onClick={addField} className="add-btn">
              <FaPlus /> Add Field
            </button>

            <button onClick={sendEmbed} className="send-btn" disabled={loading}>
              <FaPaperPlane /> {loading ? "Sending..." : "Send Embed"}
            </button>
            {success && <p className="success">{success}</p>}
            {error && <p className="error">{error}</p>}
          </div>
        )}

        {/* Preview */}
        {activeMsg && (
          <div
            className="embed-preview"
            style={{ borderColor: activeMsg.color }}
          >
            <h2>{activeMsg.title}</h2>
            <p>{activeMsg.description}</p>
            {activeMsg.fields?.map((f, i) => (
              <div
                key={i}
                className={`preview-field ${f.inline ? "inline" : ""}`}
              >
                <strong>{f.name}:</strong> {f.value}
              </div>
            ))}
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
    </div>
  );
}
