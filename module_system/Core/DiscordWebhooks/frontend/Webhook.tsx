"use client";
import React, { useEffect, useState } from "react";
import { FaDiscord, FaTrash, FaSave, FaTimes } from "react-icons/fa";

type Field = { name: string; value: string };

type Embed = {
  title: string;
  description: string;
  url: string;
  color: string;
  footer: string;
  timestamp: boolean;
  fields: Field[];
};

type SavedWebhook = { name: string; url: string };
type SavedTemplate = { name: string; embed: Embed };

export default function WebhookPage() {
  const user = { plan: "free" };

  const [webhookUrl, setWebhookUrl] = useState("");
  const [embed, setEmbed] = useState<Embed>({
    title: "",
    description: "",
    url: "",
    color: "#7289da",
    footer: "",
    timestamp: true,
    fields: [],
  });

  const [savedWebhooks, setSavedWebhooks] = useState<SavedWebhook[]>([]);
  const [selectedWebhooks, setSelectedWebhooks] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [newWebhookName, setNewWebhookName] = useState("");

  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [templateNameInput, setTemplateNameInput] = useState("");
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplateIndex, setEditingTemplateIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    const webhooks = localStorage.getItem("modix_webhooks");
    if (webhooks) {
      const parsed: SavedWebhook[] = JSON.parse(webhooks);
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
    if (savedWebhooks.some((w) => w.url === webhookUrl))
      return alert("Webhook URL already saved.");
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

  const updateField = (index: number, key: keyof Field, value: string) => {
    const newFields = [...embed.fields];
    newFields[index][key] = value;
    setEmbed({ ...embed, fields: newFields });
  };

  const addField = () => {
    setEmbed({ ...embed, fields: [...embed.fields, { name: "", value: "" }] });
  };

  const removeField = (index: number) => {
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
      text: user.plan === "free" ? "Powered By Modix Game Panel" : embed.footer,
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
    if (!selectedWebhooks.length) return alert("Select at least one webhook.");
    for (const url of selectedWebhooks) await sendToWebhook(url);
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
                {React.createElement(FaDiscord)} Save Webhook
              </button>
            </div>
          </div>
          {/* ...rest of the component unchanged... */}
        </div>
      </div>
    </div>
  );
}
