"use client";

import React, { useState } from "react";
import "./ModixHealth.css";

const modules = [
  {
    name: "Terminal",
    category: "Core",
    status: "ok",
    description:
      "Handles server command input/output. Stable and fully operational.",
    bugs: [],
    patched: ["Fixed input buffer overflow"],
    waiting: [],
    version: "v1.0.0",
    lastUpdated: "2025-06-22",
    changelog: [
      {
        version: "v1.0.0",
        date: "2025-06-22",
        changes: [
          "Initial stable release",
          "Input handling improved",
          "Color-coded output",
        ],
      },
    ],
  },
  {
    name: "File Manager",
    category: "Tools",
    status: "error",
    description: "Used to edit and upload server files. Currently broken.",
    bugs: ["File tree fails to load on Safari", "Drag-drop broken"],
    patched: ["Directory sync bug fixed"],
    waiting: ["File permission handling fix pending"],
    version: "v1.0.0",
    lastUpdated: "2025-06-20",
    changelog: [
      {
        version: "v1.0.0",
        date: "2025-06-20",
        changes: [
          "Introduced drag-drop uploading",
          "Fixed recursive folder display",
        ],
      },
    ],
  },
  {
    name: "Mod Manager",
    category: "Tools",
    status: "patched",
    description:
      "Manages installed mods and workshop content. Running with latest patches.",
    bugs: ["Occasional mod install delay"],
    patched: ["Workshop ID validation improved"],
    waiting: [],
    version: "v1.0.0",
    lastUpdated: "2025-06-25",
    changelog: [
      {
        version: "v1.0.0",
        date: "2025-06-25",
        changes: [
          "Initial release",
          "Basic install/uninstall functionality",
          "UI tweaks",
        ],
      },
    ],
  },
  {
    name: "Workshop",
    category: "Other",
    status: "waiting",
    description:
      "Integration with Steam Workshop for mod downloads. Some issues pending.",
    bugs: ["Download stalls on large mods"],
    patched: [],
    waiting: ["Improved download manager in progress"],
    version: "v1.0.0",
    lastUpdated: "2025-06-18",
    changelog: [
      {
        version: "v1.0.0",
        date: "2025-06-18",
        changes: [
          "Workshop integration initialized",
          "Steam login support added",
        ],
      },
    ],
  },
];

export default function ModixHealth() {
  const [active, setActive] = useState(null);

  const categories = modules.reduce((acc, mod) => {
    if (!acc[mod.category]) acc[mod.category] = [];
    acc[mod.category].push(mod);
    return acc;
  }, {} as Record<string, typeof modules>);

  // Map for better status display info
  const statusInfo = {
    ok: {
      label: "OK",
      icon: "✅",
      colorClass: "ok",
      description: "Module is stable and running smoothly",
    },
    error: {
      label: "ERROR",
      icon: "❌",
      colorClass: "error",
      description: "Module has critical errors",
    },
    patched: {
      label: "PATCHED",
      icon: "🛠",
      colorClass: "patched",
      description: "Module has recent patches applied",
    },
    waiting: {
      label: "WAITING FIX",
      icon: "⏳",
      colorClass: "waiting",
      description: "Module is waiting for fixes",
    },
  };

  return (
    <main className="modix-health">
      <h1 className="modix-title">Modix Health</h1>
      <p className="modix-subtitle">
        View the current status and diagnostic reports for each core module.
      </p>

      <a href="/support" className="report-bug-btn">
        Report Bug
      </a>

      {Object.entries(categories).map(([category, mods]) => (
        <section key={category} className="modix-category">
          <h2 className="modix-category-title">{category}</h2>
          <div className="modix-category-scroll">
            {mods.map((mod, idx) => {
              const status = statusInfo[mod.status];
              return (
                <article
                  key={idx}
                  className={`modix-card ${mod.status}`}
                  onClick={() => setActive(mod)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={active === mod}
                  aria-label={`Details for ${mod.name}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setActive(mod);
                  }}
                >
                  <header className="modix-card-header">
                    <h3>{mod.name}</h3>
                    <span
                      className={`modix-status ${status.colorClass}`}
                      title={status.description}
                      aria-label={`Status: ${status.label}`}
                    >
                      {status.icon} {status.label}
                    </span>
                  </header>
                  <p className="modix-description-short">{mod.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {active && (
        <div
          className="modix-modal-overlay"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modix-modal"
            onClick={(e) => e.stopPropagation()}
            tabIndex={0}
          >
            <h2>{active.name}</h2>
            <p className="modix-description">{active.description}</p>

            <div className="modix-detail-grid">
              <div>
                <h4>🧮 Known Issues</h4>
                <p>{active.bugs.length + active.waiting.length}</p>
              </div>
              <div>
                <h4>📦 Version</h4>
                <p>{active.version}</p>
              </div>
              <div>
                <h4>📅 Last Updated</h4>
                <p>{active.lastUpdated}</p>
              </div>
            </div>

            <div className="modix-section">
              <h4>🪲 Bugs</h4>
              <ul>
                {active.bugs.length ? (
                  active.bugs.map((b, i) => <li key={i}>{b}</li>)
                ) : (
                  <li>No known bugs</li>
                )}
              </ul>
            </div>

            <div className="modix-section">
              <h4>✅ Patched</h4>
              <ul>
                {active.patched.length ? (
                  active.patched.map((p, i) => <li key={i}>{p}</li>)
                ) : (
                  <li>None</li>
                )}
              </ul>
            </div>

            <div className="modix-section">
              <h4>🕐 Awaiting Fix</h4>
              <ul>
                {active.waiting.length ? (
                  active.waiting.map((w, i) => <li key={i}>{w}</li>)
                ) : (
                  <li>None</li>
                )}
              </ul>
            </div>

            <div className="modix-section">
              <h4>📝 Change Log</h4>
              {active.changelog?.length ? (
                active.changelog.map((log, i) => (
                  <div key={i} style={{ marginBottom: "1rem" }}>
                    <strong>{log.version}</strong>{" "}
                    <span style={{ color: "#888" }}>({log.date})</span>
                    <ul>
                      {log.changes.map((c, j) => (
                        <li key={j}>{c}</li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p>No changelog available.</p>
              )}
            </div>

            <button className="modal-close" onClick={() => setActive(null)}>
              ✖ Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
