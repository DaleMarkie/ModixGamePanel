"use client";

import React, { useState } from "react";
import { ChromePicker } from "react-color";
import { FaPlus, FaTrash, FaPaperPlane, FaEdit, FaSave } from "react-icons/fa";
import "./EmbededMessages.css";
import { getServerUrl } from "@/app/config";

interface EmbedField {
  name: string;
  value: string;
  inline: boolean;
}

interface PredefinedMessage {
  id: string;
  name: string;
  title: string;
  description: string;
  color: string;
  fields?: EmbedField[];
  image?: string;
  thumbnail?: string;
}

export default function EmbededMessagesPage() {
  const [predefinedMessages, setPredefinedMessages] = useState<PredefinedMessage[]>([
    {
      id: "1",
      name: "Server Restart",
      title: "Server Restarting Soon!",
      description: "Attention players, the server will restart in 5 minutes.",
      color: "#FF5555",
    },
    {
      id: "2",
      name: "Event Announcement",
      title: "Special Event Today!",
      description: "Join us for the big in-game event starting at 8 PM!",
      color: "#55FF55",
      fields: [{ name: "Event Type", value: "PvP Tournament", inline: true }],
    },
  ]);

  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeMessage = predefinedMessages.find((m) => m.id === activeMessageId) || null;

  const updateActiveMessage = (key: keyof PredefinedMessage, value: any) => {
    if (!activeMessage) return;
    setPredefinedMessages((prev) =>
      prev.map((m) => (m.id === activeMessage.id ? { ...m, [key]: value } : m))
    );
  };

  const addField = () => {
    if (!activeMessage) return;
    const newFields = [...(activeMessage.fields || []), { name: "", value: "", inline: false }];
    updateActiveMessage("fields", newFields);
  };

  const removeField = (index: number) => {
    if (!activeMessage) return;
    const newFields = [...(activeMessage.fields || [])];
    newFields.splice(index, 1);
    updateActiveMessage("fields", newFields);
  };

  const updateField = (index: number, key: keyof EmbedField, value: any) => {
    if (!activeMessage) return;
    const newFields = [...(activeMessage.fields || [])];
    newFields[index][key] = value;
    updateActiveMessage("fields", newFields);
  };

  const addPredefinedMessage = () => {
    const newMsg: PredefinedMessage = {
      id: (Math.random() * 100000).toFixed(0),
      name: "New Message",
      title: "",
      description: "",
      color: "#5865F2",
      fields: [],
    };
    setPredefinedMessages([...predefinedMessages, newMsg]);
    setActiveMessageId(newMsg.id);
  };

  const removePredefinedMessage = (id: string) => {
    setPredefinedMessages(predefinedMessages.filter((m) => m.id !== id));
    if (activeMessageId === id) setActiveMessageId(null);
  };

  const sendEmbed = async () => {
    if (!activeMessage) return;
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch(`${getServerUrl()}/api/embed/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...activeMessage,
          footer: "By Modix Game Panel | https://discord.gg/EwWZUSR9tM",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Embed sent successfully!");
      } else {
        throw new Error(data.message || "Failed to send embed.");
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="embed-page p-6">
      <h1 className="text-4xl font-bold mb-6 flex items-center gap-2">
        <FaPaperPlane /> Embed Message Manager
      </h1>

      {/* Predefined Messages Sidebar */}
      <div className="flex gap-6">
        <div className="sidebar w-1/4 bg-gray-800 p-4 rounded-lg space-y-2">
          <h3 className="font-semibold text-lg mb-2">Predefined Messages</h3>
          {predefinedMessages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded cursor-pointer hover:bg-gray-700 ${
                msg.id === activeMessageId ? "bg-gray-700 border-l-4 border-blue-500" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <span onClick={() => setActiveMessageId(msg.id)}>{msg.name}</span>
                <button onClick={() => removePredefinedMessage(msg.id)} className="text-red-500">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addPredefinedMessage}
            className="bg-green-500 text-white px-3 py-1 mt-2 rounded flex items-center gap-1"
          >
            <FaPlus /> Add Message
          </button>
        </div>

        {/* Editor + Preview */}
        {activeMessage && (
          <div className="flex-1 grid grid-cols-2 gap-6">
            {/* Editor */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={activeMessage.name}
                onChange={(e) => updateActiveMessage("name", e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Title"
                value={activeMessage.title}
                onChange={(e) => updateActiveMessage("title", e.target.value)}
                className="input-field"
              />
              <textarea
                placeholder="Description"
                value={activeMessage.description}
                onChange={(e) => updateActiveMessage("description", e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Thumbnail URL"
                value={activeMessage.thumbnail || ""}
                onChange={(e) => updateActiveMessage("thumbnail", e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={activeMessage.image || ""}
                onChange={(e) => updateActiveMessage("image", e.target.value)}
                className="input-field"
              />
              <div>
                <p className="mb-1">Color:</p>
                <ChromePicker
                  color={activeMessage.color}
                  onChange={(c) => updateActiveMessage("color", c.hex)}
                  className="color-picker"
                />
              </div>

              <div className="fields-section">
                <h3 className="font-semibold mb-2">Fields</h3>
                {(activeMessage.fields || []).map((f, idx) => (
                  <div key={idx} className="field-row flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={f.name}
                      onChange={(e) => updateField(idx, "name", e.target.value)}
                      className="input-field flex-1"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={f.value}
                      onChange={(e) => updateField(idx, "value", e.target.value)}
                      className="input-field flex-1"
                    />
                    <label className="inline-flex items-center gap-1">
                      Inline
                      <input
                        type="checkbox"
                        checked={f.inline}
                        onChange={(e) => updateField(idx, "inline", e.target.checked)}
                      />
                    </label>
                    <button onClick={() => removeField(idx)} className="text-red-500">
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addField}
                  className="bg-green-500 px-3 py-1 rounded text-white flex items-center gap-1"
                >
                  <FaPlus /> Add Field
                </button>
              </div>

              <button
                onClick={sendEmbed}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-4 flex items-center gap-2"
                disabled={loading}
              >
                <FaPaperPlane /> {loading ? "Sending..." : "Send Embed"}
              </button>

              {success && <p className="text-green-500 mt-2">{success}</p>}
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>

            {/* Live Preview */}
            <div className="embed-preview p-4 rounded-lg border border-gray-600 bg-gray-900 text-white">
              <div
                className="embed-header mb-2"
                style={{ borderLeft: `4px solid ${activeMessage.color}`, paddingLeft: "8px" }}
              >
                {activeMessage.title && <h2 className="font-bold text-lg">{activeMessage.title}</h2>}
                {activeMessage.name && <p className="text-sm text-gray-400">{activeMessage.name}</p>}
              </div>
              {activeMessage.description && <p className="mb-2">{activeMessage.description}</p>}
              {activeMessage.fields && activeMessage.fields.length > 0 && (
                <div className="grid grid-cols-1 gap-2">
                  {activeMessage.fields.map((f, idx) => (
                    <div key={idx} className={`field ${f.inline ? "inline-field" : ""}`}>
                      <p className="font-semibold">{f.name}</p>
                      <p>{f.value}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeMessage.thumbnail && (
                <img src={activeMessage.thumbnail} alt="Thumbnail" className="w-16 h-16 object-cover mt-2" />
              )}
              {activeMessage.image && (
                <img src={activeMessage.image} alt="Image" className="w-full mt-2 rounded" />
              )}
              <p className="text-gray-400 text-sm mt-2">
                By <a href="https://discord.gg/EwWZUSR9tM" target="_blank" className="text-blue-400">
                  Modix Game Panel
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
