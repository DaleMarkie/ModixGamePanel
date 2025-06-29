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

const statusInfo = {
  ok: { label: "OK", icon: "✅", class: "ok", tooltip: "Module is stable" },
  error: {
    label: "ERROR",
    icon: "❌",
    class: "error",
    tooltip: "Critical errors",
  },
  patched: {
    label: "PATCHED",
    icon: "🛠",
    class: "patched",
    tooltip: "Patched with updates",
  },
  waiting: {
    label: "WAITING",
    icon: "⏳",
    class: "waiting",
    tooltip: "Fixes pending",
  },
};

export default function ModixHealth() {
  const [active, setActive] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);

  const categorizedModules = modules.reduce((acc, mod) => {
    (acc[mod.category] = acc[mod.category] || []).push(mod);
    return acc;
  }, {});

  return (
    <main className="modix-health">
      <h1 className="modix-title">Modix Health</h1>
      <p className="modix-subtitle">
        Status and diagnostic report for each core module.
      </p>

      <button className="report-bug-btn" onClick={() => setReportOpen(true)}>
        🐞 Report Bug
      </button>

      {Object.entries(categorizedModules).map(([category, mods]) => (
        <section key={category} className="modix-category">
          <h2 className="modix-category-title">{category}</h2>
          <div className="modix-category-scroll">
            {mods.map((mod) => {
              const status = statusInfo[mod.status];
              return (
                <article
                  key={mod.name}
                  className={`modix-card ${status.class}`}
                  onClick={() => setActive(mod)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Details for ${mod.name}`}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && setActive(mod)
                  }
                >
                  <header className="modix-card-header">
                    <h3>{mod.name}</h3>
                    <span
                      className={`modix-status ${status.class}`}
                      title={status.tooltip}
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

      {/* Module Details Modal */}
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

            <DetailsSection title="🪲 Bugs" items={active.bugs} />
            <DetailsSection title="✅ Patched" items={active.patched} />
            <DetailsSection title="🕐 Awaiting Fix" items={active.waiting} />

            <div className="modix-section">
              <h4>📝 Changelog</h4>
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

      {/* Bug Report Modal */}
      {reportOpen && (
        <div
          className="modix-modal-overlay"
          onClick={() => setReportOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modix-modal"
            onClick={(e) => e.stopPropagation()}
            tabIndex={0}
          >
            <h2>🐞 Report a Bug</h2>
            <p>Tell us what went wrong and we’ll look into it.</p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const textarea = e.currentTarget.querySelector("textarea");
                const message = textarea?.value.trim();

                if (!message) return;

                const metadata = `🌐 ${navigator.userAgent}
🕒 ${new Date().toLocaleString()}
🧩 Modules Loaded: ${modules.length}`;

                try {
                  await fetch(
                    "https://discord.com/api/webhooks/your_webhook_here",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        content: `🐞 **Bug Report Submitted**\n${message}\n\n${metadata}`,
                      }),
                    }
                  );
                  alert("✅ Bug report sent successfully!");
                  setReportOpen(false);
                } catch {
                  alert("❌ Failed to send bug report. Try again later.");
                }
              }}
              className="modix-form"
            >
              <label htmlFor="report-message">Description:</label>
              <textarea
                id="report-message"
                required
                placeholder="Describe what happened, which module, etc..."
                rows={5}
                className="modix-textarea"
              ></textarea>

              <div
                style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}
              >
                <button type="submit" className="modal-submit">
                  🚀 Submit
                </button>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setReportOpen(false)}
                >
                  ✖ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function DetailsSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="modix-section">
      <h4>{title}</h4>
      <ul>
        {items.length ? (
          items.map((item, i) => <li key={i}>{item}</li>)
        ) : (
          <li>None</li>
        )}
      </ul>
    </div>
  );
}
