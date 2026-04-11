"use client";

import React, { useState } from "react";

const categories = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: `
      Welcome to Modix. This section helps you get up and running.

      - Install Modix
      - Setup your environment
      - Run your first mod
    `,
  },
  {
    id: "api",
    title: "API",
    content: `
      Learn how to interact with the Modix backend API.

      - Authentication
      - Endpoints
      - Requests & Responses
    `,
  },
  {
    id: "mods",
    title: "Mods",
    content: `
      Everything about managing mods.

      - Installing mods
      - Updating mods
      - Removing mods
    `,
  },
  {
    id: "performance",
    title: "Performance",
    content: `
      Optimize Modix performance.

      - Resource usage
      - Caching
      - Debugging slow mods
    `,
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    content: `
      Fix common issues.

      - Mod not loading
      - API errors
      - Permission issues
    `,
  },
];

export default function DocumentationPage() {
  const [active, setActive] = useState(categories[0].id);

  const activeCategory = categories.find((c) => c.id === active);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-neutral-800 p-4">
        <h2 className="text-xl font-semibold mb-4">Modix Docs</h2>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`text-left px-3 py-2 rounded-lg transition ${
                active === cat.id ? "bg-neutral-800" : "hover:bg-neutral-900"
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-4">{activeCategory?.title}</h1>
        <div className="whitespace-pre-line text-neutral-300 leading-relaxed">
          {activeCategory?.content}
        </div>
      </div>
    </div>
  );
}
