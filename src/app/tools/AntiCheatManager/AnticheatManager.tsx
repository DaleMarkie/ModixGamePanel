"use client";

import React, { useEffect, useState } from "react";
import "./AnticheatManager.css";

interface Note {
  id: number;
  text: string;
  date: string;
  author: string;
}

interface SecurityModule {
  enabled: boolean;
  log: string;
  notes: Note[];
}

type ModuleData = Record<string, SecurityModule>;

const mockContainers = [
  { id: "pz1", name: "Project Zomboid - EU Server" },
  { id: "pz2", name: "Project Zomboid - US Server" },
];

const defaultSecurityModules: ModuleData = {
  "Auto Ban Engine": {
    enabled: true,
    log: "Active: Auto-banned 3 cheaters in the last 24h.",
    notes: [],
  },
  "Suspicious Behavior Monitor": {
    enabled: false,
    log: "Disabled. Enable to track wall hacks & speed glitches.",
    notes: [],
  },
  "VPN Blocker": {
    enabled: true,
    log: "All traffic filtered through known VPN IPs blocked.",
    notes: [],
  },
  "Realtime Cheat Signatures": {
    enabled: true,
    log: "Detected 2 outdated cheats; signatures auto-updated.",
    notes: [],
  },
};

export default function AntiCheatManager() {
  const [selectedContainer, setSelectedContainer] = useState("");
  const [modules, setModules] = useState<ModuleData>({});
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!selectedContainer) {
      setModules({});
      return;
    }
    const saved = localStorage.getItem(`security_${selectedContainer}`);
    setModules(saved ? JSON.parse(saved) : defaultSecurityModules);
  }, [selectedContainer]);

  useEffect(() => {
    if (selectedContainer) {
      localStorage.setItem(
        `security_${selectedContainer}`,
        JSON.stringify(modules)
      );
    }
  }, [modules, selectedContainer]);

  const toggleModule = (modName: string) => {
    setModules((prev) => ({
      ...prev,
      [modName]: {
        ...prev[modName],
        enabled: !prev[modName].enabled,
        log: prev[modName].enabled
          ? "Manually disabled by admin."
          : "Module enabled and monitoring...",
      },
    }));
  };

  const addNote = (modName: string) => {
    const text = noteInputs[modName]?.trim();
    if (!text) return;
    const note: Note = {
      id: Date.now(),
      text,
      date: new Date().toLocaleString(),
      author: "Admin",
    };
    setModules((prev) => ({
      ...prev,
      [modName]: {
        ...prev[modName],
        notes: [note, ...(prev[modName].notes || [])],
      },
    }));
    setNoteInputs((prev) => ({ ...prev, [modName]: "" }));
  };

  const deleteNote = (modName: string, noteId: number) => {
    setModules((prev) => ({
      ...prev,
      [modName]: {
        ...prev[modName],
        notes: prev[modName].notes.filter((n) => n.id !== noteId),
      },
    }));
  };

  return (
    <main className="anti-cheat">
      <header className="anti-cheat-header">
        <h1>🛡️ Anti-Cheat & Security Suite</h1>
        <p>No config, no code. Just toggle to protect your servers.</p>
      </header>

      <section className="anti-cheat-panel">
        <label>Select Game Server</label>
        <select
          value={selectedContainer}
          onChange={(e) => setSelectedContainer(e.target.value)}
          className="select-dropdown"
        >
          <option value="">-- Select Container --</option>
          {mockContainers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </section>

      {selectedContainer && (
        <>
          <h2 className="section-heading">Modules</h2>
          <ul className="module-list">
            {Object.entries(modules).map(([mod, data]) => (
              <li
                key={mod}
                className={`module-card ${
                  data.enabled ? "enabled" : "disabled"
                }`}
              >
                <div className="module-header">
                  <h3>{mod}</h3>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={data.enabled}
                      onChange={() => toggleModule(mod)}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <p className="module-log">{data.log}</p>

                <div className="notes-section">
                  <textarea
                    rows={2}
                    value={noteInputs[mod] || ""}
                    onChange={(e) =>
                      setNoteInputs((prev) => ({
                        ...prev,
                        [mod]: e.target.value,
                      }))
                    }
                    placeholder="Add a note…"
                  />
                  <button onClick={() => addNote(mod)} className="btn-note">
                    ➕ Add Note
                  </button>

                  {data.notes.length > 0 ? (
                    <div className="notes-list">
                      {data.notes.map((n) => (
                        <div key={n.id} className="note-item">
                          <div className="note-meta">
                            <strong>{n.author}</strong> — {n.date}
                            <button onClick={() => deleteNote(mod, n.id)}>
                              🗑️
                            </button>
                          </div>
                          <p>{n.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-notes">No notes yet.</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
