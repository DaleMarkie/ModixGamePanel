"use client";
import React, { useEffect, useState } from "react";
import {
  FaDiscord,
  FaTrash,
  FaSave,
  FaTimes,
} from "react-icons/fa";

export default function WebhookPage() {
  // Replace with your real user plan (free / pro / host)
  const user = { plan: "free" };

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

  const [savedWebhooks, setSavedWebhooks] = useState<
    { name: string; url: string }[]
  >([]);
  const [selectedWebhooks, setSelectedWebhooks] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [newWebhookName, setNewWebhookName] = useState("");

  const [savedTemplates, setSavedTemplates] = useState<
    { name: string; embed: typeof embed }[]
  >([]);
  const [templateNameInput, setTemplateNameInput] = useState("");
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplateIndex, setEditingTemplateIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    const webhooks = localStorage.getItem("modix_webhooks");
    if (webhooks) {
      const parsed = JSON.parse(webhooks);
      setSavedWebhooks(parsed);
      setSelectedWebhooks(parsed.map((w) => w.url));
    }

    const templates = localStorage.getItem("modix_templates");
    if (templates) {
      setSavedTemplates(JSON.parse(templates));
    }
  }, []);

  const saveWebhookToLocal = () => {
    if (!newWebhookName || !webhookUrl)
      return alert("Webhook name and URL required.");
    const exists = savedWebhooks.some((w) => w.url === webhookUrl);
    if (exists) return alert("Webhook URL already saved.");
    const updated = [
      ...savedWebhooks,
      { name: newWebhookName, url: webhookUrl },
    ];
    setSavedWebhooks(updated);
    setSelectedWebhooks([...selectedWebhooks, webhookUrl]);
    localStorage.setItem("modix_webhooks", JSON.stringify(updated));
    setNewWebhookName("");
    setWebhookUrl("");
  };

  const deleteSavedWebhook = (url: string) => {
    if (!confirm("Delete this webhook?")) return;
    const updated = savedWebhooks.filter((w) => w.url !== url);
    setSavedWebhooks(updated);
    setSelectedWebhooks((prev) => prev.filter((u) => u !== url));
    localStorage.setItem("modix_webhooks", JSON.stringify(updated));
  };

  const toggleWebhookSelection = (url: string) => {
    setSelectedWebhooks((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

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

  const buildPayload = () => ({
    title: embed.title,
    description: embed.description,
    url: embed.url || undefined,
    color: parseInt(embed.color.replace("#", ""), 16),
    footer: {
      text:
        user.plan === "free" ? "Powered By Modix Game Panel" : embed.footer,
    },
    timestamp: embed.timestamp ? new Date().toISOString() : undefined,
    fields: embed.fields.length ? embed.fields : undefined,
  });

  const sendToWebhook = async (url: string) => {
    const embedPayload = buildPayload();
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embedPayload] }),
      });
      const msg = res.ok ? `✅ Sent to ${url}` : `❌ Failed: ${url}`;
      setLogs((prev) => [
        `${new Date().toLocaleTimeString()} - ${msg}`,
        ...prev.slice(0, 5),
      ]);
    } catch {
      setLogs((prev) => [
        `${new Date().toLocaleTimeString()} - ❌ Error sending to ${url}`,
        ...prev.slice(0, 5),
      ]);
    }
  };

  const sendToAll = async () => {
    if (selectedWebhooks.length === 0)
      return alert("Select at least one webhook.");
    for (const url of selectedWebhooks) await sendToWebhook(url);
  };

  const saveTemplate = () => {
    const name = templateNameInput.trim();
    if (!name) return alert("Template name required.");

    if (isEditingTemplate && editingTemplateIndex !== null) {
      const duplicate = savedTemplates.find(
        (t, i) =>
          t.name.toLowerCase() === name.toLowerCase() &&
          i !== editingTemplateIndex
      );
      if (duplicate) return alert("Another template with this name exists.");
      const updatedTemplates = [...savedTemplates];
      updatedTemplates[editingTemplateIndex] = { name, embed: { ...embed } };
      setSavedTemplates(updatedTemplates);
      localStorage.setItem("modix_templates", JSON.stringify(updatedTemplates));
      cancelEditTemplate();
    } else {
      const duplicate = savedTemplates.find(
        (t) => t.name.toLowerCase() === name.toLowerCase()
      );
      if (duplicate) return alert("Template with this name already exists.");
      const updated = [...savedTemplates, { name, embed: { ...embed } }];
      setSavedTemplates(updated);
      localStorage.setItem("modix_templates", JSON.stringify(updated));
      setTemplateNameInput("");
    }
  };

  const loadTemplate = (templateEmbed, index) => {
    setEmbed({ ...templateEmbed });
    setTemplateNameInput(savedTemplates[index].name);
    setIsEditingTemplate(true);
    setEditingTemplateIndex(index);
  };

  const deleteTemplate = (index) => {
    if (!confirm(`Delete template "${savedTemplates[index].name}"?`)) return;
    const updated = savedTemplates.filter((_, i) => i !== index);
    setSavedTemplates(updated);
    localStorage.setItem("modix_templates", JSON.stringify(updated));
    if (isEditingTemplate && editingTemplateIndex === index)
      cancelEditTemplate();
  };

  const cancelEditTemplate = () => {
    setIsEditingTemplate(false);
    setEditingTemplateIndex(null);
    setTemplateNameInput("");
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6 font-sans max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 select-none">
        📡 Discord Webhook Sender
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 bg-[#1a1a1c] p-4 rounded-xl space-y-8 sticky top-6 max-h-[90vh] overflow-y-auto">
          {/* Saved Webhooks */}
          <div>
            <h2 className="text-lg font-semibold mb-3 border-b border-[#444] pb-1 select-none">
              💾 Saved Webhooks
            </h2>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {savedWebhooks.length === 0 && (
                <p className="text-gray-500 text-sm">No saved webhooks yet.</p>
              )}
              {savedWebhooks.map((w, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-[#2a2a2d] p-2 rounded-md text-sm"
                >
                  <label className="flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedWebhooks.includes(w.url)}
                      onChange={() => toggleWebhookSelection(w.url)}
                      className="mr-2 accent-[#7289da]"
                    />
                    <span className="truncate max-w-[12rem]" title={w.name}>
                      {w.name}
                    </span>
                  </label>
                  <button
                    onClick={() => deleteSavedWebhook(w.url)}
                    title="Delete Webhook"
                    className="text-red-500 hover:text-red-400 transition"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <input
                placeholder="Webhook Name"
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
                className="w-full rounded-md p-2 bg-[#121212] border border-[#444] focus:outline-none focus:border-[#7289da] text-white text-sm"
              />
              <input
                placeholder="Webhook URL"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full rounded-md p-2 bg-[#121212] border border-[#444] focus:outline-none focus:border-[#7289da] text-white text-sm"
              />
              <button
                onClick={saveWebhookToLocal}
                className="w-full bg-[#7289da] hover:bg-[#5a6fc6] transition rounded-md py-2 font-semibold flex justify-center items-center gap-2"
              >
                <FaDiscord /> Save Webhook
              </button>
            </div>
          </div>

          {/* Templates */}
          <div>
            <h2 className="text-lg font-semibold mb-3 border-b border-[#444] pb-1 select-none">
              📚 Templates
            </h2>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {savedTemplates.length === 0 && (
                <p className="text-gray-500 text-sm">No templates saved.</p>
              )}
              {savedTemplates.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-[#2a2a2d] p-2 rounded-md text-sm cursor-pointer hover:bg-[#3a3a3d]"
                  onClick={() => loadTemplate(t.embed, i)}
                  title="Click to load and edit"
                >
                  <span className="truncate max-w-[12rem]" title={t.name}>
                    {t.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTemplate(i);
                    }}
                    title="Delete Template"
                    className="text-red-500 hover:text-red-400 transition"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <input
                placeholder="Template Name"
                value={templateNameInput}
                onChange={(e) => setTemplateNameInput(e.target.value)}
                className="w-full rounded-md p-2 bg-[#121212] border border-[#444] focus:outline-none focus:border-[#7289da] text-white text-sm"
              />
              <div className="flex gap-2">
                {isEditingTemplate ? (
                  <>
                    <button
                      onClick={saveTemplate}
                      className="flex-1 bg-green-600 hover:bg-green-700 transition rounded-md py-2 font-semibold flex justify-center items-center gap-2"
                      title="Save Changes"
                    >
                      <FaSave /> Save Changes
                    </button>
                    <button
                      onClick={cancelEditTemplate}
                      className="flex-1 bg-red-600 hover:bg-red-700 transition rounded-md py-2 font-semibold flex justify-center items-center gap-2"
                      title="Cancel Editing"
                    >
                      <FaTimes /> Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={saveTemplate}
                    className="flex-1 bg-[#7289da] hover:bg-[#5a6fc6] transition rounded-md py-2 font-semibold flex justify-center items-center gap-2"
                  >
                    <FaSave /> Save Template
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="lg:col-span-3 bg-[#1a1a1c] p-6 rounded-xl overflow-y-auto max-h-[90vh]">
          <h2 className="text-2xl font-semibold mb-4 select-none">
            📝 Embed Editor
          </h2>

          <div className="space-y-4 max-w-3xl">
            <input
              placeholder="Title"
              value={embed.title}
              onChange={(e) => setEmbed({ ...embed, title: e.target.value })}
              className="w-full rounded-md p-3 bg-[#121212] border border-[#444] focus:outline-none focus:border-[#7289da] text-white text-lg font-semibold"
            />
            <textarea
              placeholder="Description"
              value={embed.description}
              onChange={(e) =>
                setEmbed({ ...embed, description: e.target.value })
              }
              rows={4}
              className="w-full rounded-md p-3 bg-[#121212] border border-[#444] focus:outline-none focus:border-[#7289da] text-white resize-y"
            />
            <input
              placeholder="URL (optional)"
              value={embed.url}
              onChange={(e) => setEmbed({ ...embed, url: e.target.value })}
              className="w-full rounded-md p-3 bg-[#121212] border border-[#444] focus:outline-none focus:border-[#7289da] text-white text-sm"
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="color"
                  value={embed.color}
                  onChange={(e) =>
                    setEmbed({ ...embed, color: e.target.value })
                  }
                  className="w-10 h-10 p-0 border border-[#444] rounded-md cursor-pointer"
                />
                <span>Embed Color</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={embed.timestamp}
                  onChange={(e) =>
                    setEmbed({ ...embed, timestamp: e.target.checked })
                  }
                />
                Timestamp
              </label>
            </div>

            {/* Footer */}
            <input
              placeholder="Footer text (optional)"
              value={
                user.plan === "free"
                  ? "Powered By Modix Game Panel"
                  : embed.footer
              }
              onChange={(e) => {
                if (user.plan !== "free") {
                  setEmbed({ ...embed, footer: e.target.value });
                }
              }}
              className={`w-full rounded-md p-2 bg-[#121212] border border-[#444] focus:outline-none focus:border-[#7289da] text-white text-sm ${
                user.plan === "free" ? "cursor-not-allowed opacity-60" : ""
              }`}
              disabled={user.plan === "free"}
            />

            {/* Fields */}
            <div className="space-y-2">
              <h3 className="font-semibold">Fields</h3>
              {embed.fields.length === 0 && (
                <p className="text-gray-400 text-sm">No fields added.</p>
              )}
              {embed.fields.map((field, index) => (
                <div
                  key={index}
                  className="bg-[#2a2a2d] p-3 rounded-md flex gap-2 items-center"
                >
                  <input
                    placeholder="Name"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    className="flex-1 rounded-md p-2 bg-[#121212] border border-[#444] focus:outline-none focus:border-[#7289da] text-white text-sm"
                  />
                  <input
                    placeholder="Value"
                    value={field.value}
                    onChange={(e) =>
                      updateField(index, "value", e.target.value)
                    }
                    className="flex-1 rounded-md p-2 bg-[#121212] border border-[#444] focus:outline-none focus:border-[#7289da] text-white text-sm"
                  />
                  <button
                    onClick={() => removeField(index)}
                    className="text-red-500 hover:text-red-400 transition"
                    title="Remove field"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                onClick={addField}
                className="mt-2 bg-[#7289da] hover:bg-[#5a6fc6] transition rounded-md py-2 px-4 text-sm font-semibold"
              >
                + Add Field
              </button>
            </div>

            {/* Send Button */}
            <button
              onClick={sendToAll}
              className="mt-6 bg-green-600 hover:bg-green-700 transition rounded-md py-3 w-full text-lg font-bold"
            >
              Send to Selected Webhooks
            </button>

            {/* Logs */}
            <div className="mt-8 bg-[#121212] rounded-md p-4 max-h-40 overflow-y-auto font-mono text-xs text-gray-400">
              {logs.length === 0 ? (
                <p className="italic text-gray-600 select-none">No logs yet.</p>
              ) : (
                logs.map((log, i) => <p key={i}>{log}</p>)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
