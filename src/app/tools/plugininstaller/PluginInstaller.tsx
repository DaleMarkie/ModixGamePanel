"use client";

import React, { useState } from "react";

const dummyPlugins = [
  {
    id: "webhookPlus",
    name: "Webhook+",
    description: "Advanced webhook routing, filters, embed templates, and retry rules.",
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
    description: "Track every user change, setting toggle, and API action in Modix.",
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
    description: "Adds enhanced player stat views, kick logging, and Zomboid server metrics.",
    version: "1.0.0",
    author: "Zomboid Dev",
    installed: false,
    premium: false,
    type: "Game Integration",
    compatible: true,
  },
];

const PluginManager = () => {
  const [plugins, setPlugins] = useState(dummyPlugins);

  const toggleInstall = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, installed: !p.installed } : p))
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🧩 Modix Plugin Manager</h1>
        <p className="text-gray-400 mb-4">
          Enhance your panel with official and community-built plugins. Browse and manage dashboard features, automations, and integrations.
        </p>

        {/* ⚠️ Development Warning */}
        <div className="bg-yellow-900/60 text-yellow-300 border border-yellow-700 rounded-md px-4 py-3 mb-8">
          <div className="flex items-center space-x-3">
            <span className="text-yellow-400 text-lg">⚠️</span>
            <p className="text-sm">
              This Plugin Manager is still under development. Some features may not work yet or may change in upcoming updates.
            </p>
          </div>
        </div>

        {/* Plugin Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="bg-[#1a1a1a] rounded-xl shadow-lg p-5 flex flex-col justify-between hover:shadow-xl transition-all duration-200 border border-[#222]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{plugin.name}</h2>
                  {plugin.premium && (
                    <span className="bg-pink-600 text-xs font-bold px-2 py-1 rounded-md">
                      Premium
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-400 mt-1 mb-3">
                  {plugin.description}
                </p>

                <ul className="text-sm text-gray-300 space-y-1 mb-4">
                  <li>
                    <span className="font-medium">Version:</span> {plugin.version}
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
                className={`w-full mt-auto px-4 py-2 rounded-md font-semibold transition-colors ${
                  plugin.installed
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                onClick={() => toggleInstall(plugin.id)}
              >
                {plugin.installed ? "Uninstall" : "Install"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PluginManager;
