"use client";

import React, { useState, useMemo } from "react";
import "./ModixHealth.css";

const modules = [
  {
    name: "Terminal",
    status: "ok",
    description:
      "Handles server command input/output. Stable and fully operational.",
    bugs: [],
    patched: ["Fixed input buffer overflow (v2.3.4)"],
    waiting: [],
    lastLog: "Command queue executed in 11ms.",
    uptime: "99.98%",
    version: "v2.3.4",
    lastUpdated: "2025-06-22",
    tests: ["Command passthrough ✅", "ANSI render ✅", "Flood check ✅"],
    security: "No known vulnerabilities.",
    tips: ["Use `/clear` to wipe logs instantly."],
  },
  {
    name: "File Manager",
    status: "error",
    description: "Used to edit and upload server files. Currently broken.",
    bugs: ["File tree fails to load on Safari", "Drag-drop broken"],
    patched: ["Directory sync bug fixed (v2.2.9)"],
    waiting: ["File permission handling fix pending"],
    lastLog: "Error: EACCES: permission denied, open '/root/.env'",
    uptime: "83.3%",
    version: "v2.2.9",
    lastUpdated: "2025-06-20",
    tests: ["File open ❌", "Upload ✅", "Permissions ❌"],
    security: "Needs sandboxing for uploads.",
    tips: ["Switch to Chrome for drag-drop."],
  },
  {
    name: "Mod Manager",
    status: "patched",
    description:
      "Manages installed mods and workshop content. Running with latest patches.",
    bugs: ["Occasional mod install delay"],
    patched: ["Workshop ID validation improved (v1.9.1)"],
    waiting: [],
    lastLog: "Mod install queue processed successfully.",
    uptime: "98.6%",
    version: "v1.9.1",
    lastUpdated: "2025-06-25",
    tests: ["Install mods ✅", "Remove mods ✅", "Update mods ✅"],
    security: "Sandboxed mod installs.",
    tips: ["Restart panel after bulk installs."],
  },
  {
    name: "Workshop",
    status: "waiting",
    description:
      "Integration with Steam Workshop for mod downloads. Some issues pending.",
    bugs: ["Download stalls on large mods"],
    patched: [],
    waiting: ["Improved download manager in progress"],
    lastLog: "Downloading mod #45321 stalled at 67%.",
    uptime: "90.1%",
    version: "v1.4.8",
    lastUpdated: "2025-06-18",
    tests: ["Download mod ✅", "Subscribe to mod ❌", "Unsubscribe ✅"],
    security: "Requires Steam API key validation.",
    tips: ["Check internet connection for stalled downloads."],
  },
];

const statusLabels = {
  ok: "✅ OK",
  error: "❌ ERROR",
  patched: "🛠 PATCHED",
  waiting: "⏳ WAITING FIX",
};

export default function ModixHealth() {
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");

  // Filter modules based on search input (name or description)
  const filteredModules = useMemo(() => {
    const query = search.toLowerCase();
    return modules.filter(
      (mod) =>
        mod.name.toLowerCase().includes(query) ||
        mod.description.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <main
      className="modix-health"
      role="main"
      aria-label="Modix Server Health Checker"
    >
      <h1 className="modix-title">Modix Health Dashboard</h1>
      <p className="modix-subtitle">
        Check status, errors, and details for each module.
      </p>

      <label htmlFor="modix-search" className="modix-search-label">
        Search modules:
      </label>
      <input
        id="modix-search"
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by module name or description..."
        className="modix-search-input"
        aria-describedby="modix-search-desc"
      />
      <p id="modix-search-desc" className="sr-only">
        Type to filter modules by their name or description.
      </p>

      <section
        className="modix-grid"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {filteredModules.length ? (
          filteredModules.map((mod, idx) => (
            <article
              key={mod.name}
              className={`modix-card ${mod.status}`}
              onClick={() => setActive(mod)}
              tabIndex={0}
              role="button"
              aria-pressed={active === mod}
              aria-label={`Check details for ${mod.name}, status: ${mod.status}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setActive(mod);
                }
              }}
            >
              <header className="modix-card-header">
                <h2>{mod.name}</h2>
                <span className={`modix-status ${mod.status}`}>
                  {statusLabels[mod.status]}
                </span>
              </header>
              <p className="modix-description-short">{mod.description}</p>
            </article>
          ))
        ) : (
          <p className="modix-no-results">No modules match your search.</p>
        )}
      </section>

      {active && <Modal active={active} onClose={() => setActive(null)} />}
    </main>
  );
}

function Modal({ active, onClose }) {
  return (
    <div
      className="modix-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modix-modal-title"
      onClick={onClose}
    >
      <div
        className="modix-modal"
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
      >
        <h2 id="modix-modal-title">{active.name}</h2>
        <p className="modix-description">{active.description}</p>

        <div className="modix-detail-grid">
          <Detail label="🕐 Uptime" value={active.uptime} />
          <Detail label="📦 Version" value={active.version} />
          <Detail label="📅 Last Updated" value={active.lastUpdated} />
        </div>

        <Section title="🧪 Tests" items={active.tests} />
        <Section
          title="🪲 Bugs"
          items={active.bugs}
          emptyText="No known bugs"
        />
        <Section title="✅ Patched" items={active.patched} emptyText="None" />
        <Section
          title="🕐 Awaiting Fix"
          items={active.waiting}
          emptyText="None"
        />

        <div className="modix-section">
          <h4>📄 Last Log Entry</h4>
          <p className="modix-log">{active.lastLog}</p>
        </div>

        <div className="modix-section">
          <h4>🛡 Security</h4>
          <p className="modix-security">{active.security}</p>
        </div>

        <div className="modix-section">
          <h4>💡 Tips & Warnings</h4>
          <p className="modix-tip">{active.tips?.join(", ")}</p>
        </div>

        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close details modal"
        >
          ✖ Close
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <h4>{label}</h4>
      <p>{value}</p>
    </div>
  );
}

function Section({ title, items, emptyText = "None" }) {
  return (
    <div className="modix-section">
      <h4>{title}</h4>
      <ul>
        {items.length ? (
          items.map((item, i) => <li key={i}>{item}</li>)
        ) : (
          <li>{emptyText}</li>
        )}
      </ul>
    </div>
  );
}
