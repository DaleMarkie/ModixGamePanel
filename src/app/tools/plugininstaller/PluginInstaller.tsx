"use client";

import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

const dummyPlugins = [
  {
    id: "webhookPlus",
    name: "Webhook+",
    description:
      "Advanced webhook routing, filters, embed templates, and retry rules.",
    version: "1.2.3",
    author: "Modix Team",
    installed: true,
    premium: false,
    type: "Core Extension",
    compatible: true,
  },
  {
    id: "proThemes",
    name: "Pro Themes",
    description: "Dark mode, cyberpunk skin, neon UI themes and color presets.",
    version: "2.0.0",
    author: "Skins4Modix",
    installed: false,
    premium: true,
    type: "UI Addon",
    compatible: true,
  },
  {
    id: "autoRestart",
    name: "Auto-Restart",
    description: "Automatically restarts dead containers with crash detection.",
    version: "1.1.0",
    author: "OpenModix",
    installed: true,
    premium: false,
    type: "Server Tool",
    compatible: true,
  },
  {
    id: "auditTrail",
    name: "Audit Trail",
    description:
      "Track every user change, setting toggle, and API action in Modix.",
    version: "0.9.2",
    author: "AuditPro",
    installed: false,
    premium: false,
    type: "Security Plugin",
    compatible: true,
  },
  {
    id: "zomboidPlus",
    name: "Zomboid+ Enhancer",
    description:
      "Adds enhanced player stat views, kick logging, and Zomboid server metrics.",
    version: "1.0.0",
    author: "Zomboid Dev",
    installed: false,
    premium: false,
    type: "Game Integration",
    compatible: true,
  },
];

const PluginDocsModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    className="fixed inset-0 z-50 flex items-center justify-center"
  >
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      aria-hidden="true"
    />
    <div className="relative bg-[#0d0d0d] border border-green-700 text-white w-full max-w-2xl rounded-xl shadow-lg p-6 z-50 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-green-400">
          📘 Plugin Manager Help
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>
      <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
        <p>
          The Plugin Manager lets you browse, install, and manage optional
          modules and enhancements for your Modix dashboard.
        </p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Install / Uninstall:</strong> Click to enable or remove any
            plugin.
          </li>
          <li>
            <strong>Premium Plugins:</strong> Require Modix Pro or a license
            key.
          </li>
          <li>
            <strong>Types:</strong> UI addons, server tools, game integrations,
            security modules.
          </li>
          <li>
            <strong>Compatibility:</strong> Auto-checks against your server
            config or version.
          </li>
        </ul>
        <p>
          Installed plugins will immediately activate additional features inside
          your dashboard such as tools, views, stats, or integrations.
        </p>
        <p className="mt-4 text-green-400">
          💡 Want to create your own plugins? Check out the Modix Module Dev
          Guide.
        </p>
      </div>
    </div>
  </Dialog>
);

const PluginManager = () => {
  const [plugins, setPlugins] = useState(dummyPlugins);
  const [docsOpen, setDocsOpen] = useState(false);

  const toggleInstall = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, installed: !p.installed } : p))
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-green-300">
          🧩 Modix Plugin Manager
        </h1>
        <p className="text-gray-400 mb-4">
          Add features to your dashboard using core and community plugins.
        </p>

        <div className="bg-green-900/50 text-green-300 border border-green-700 rounded-md px-4 py-3 mb-8">
          ⚠️ This plugin system is still in early access. Some modules may be
          experimental.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="bg-[#1a1a1a] border border-[#222] rounded-xl shadow-md p-5 flex flex-col justify-between transition hover:border-green-600"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    {plugin.name}
                  </h2>
                  {plugin.premium && (
                    <span className="bg-pink-600 text-xs font-bold px-2 py-1 rounded-md">
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-2 mb-3">
                  {plugin.description}
                </p>

                <ul className="text-sm text-gray-300 space-y-1 mb-4">
                  <li>
                    <span className="font-medium">Version:</span>{" "}
                    {plugin.version}
                  </li>
                  <li>
                    <span className="font-medium">Author:</span> {plugin.author}
                  </li>
                  <li>
                    <span className="font-medium">Type:</span> {plugin.type}
                  </li>
                  <li>
                    <span className="font-medium">Compatible:</span>{" "}
                    {plugin.compatible ? "✅ Yes" : "❌ No"}
                  </li>
                </ul>
              </div>

              <button
                onClick={() => toggleInstall(plugin.id)}
                className={`mt-auto w-full py-2 rounded-md font-semibold transition ${
                  plugin.installed
                    ? "bg-green-700 hover:bg-green-800"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {plugin.installed ? "Uninstall" : "Install"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Help Button */}
      <button
        onClick={() => setDocsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-full shadow-md transition"
      >
        📘 Help
      </button>

      <PluginDocsModal open={docsOpen} onClose={() => setDocsOpen(false)} />
    </div>
  );
};

export default PluginManager;
