"use client";

import React, { useState, useEffect } from "react";
import "./Debugger.css";

const mockContainers = [
  { id: "pz_server_1", name: "Project Zomboid - Server 1" },
  { id: "pz_server_2", name: "Project Zomboid - Server 2" },
];

const defaultModData = {
  ModdedVehiclesPlus: {
    status: "broken",
    priority: "High",
    log: "Mod ModdedVehiclesPlus failed to load due to missing dependency.",
    notes: [],
  },
  RealisticZombies: {
    status: "fixed",
    priority: "Low",
    log: "Previously broken mod now loads correctly.",
    notes: [],
  },
  BetterUI: {
    status: "needs_update",
    priority: "Medium",
    log: "Incompatible with current game version.",
    notes: [],
  },
  MilitaryGearPack: {
    status: "incompatible",
    priority: "Critical",
    log: "Game crash due to outdated version.",
    notes: [],
  },
};

const TAGS = [
  { key: "", label: "All", emoji: "📦" },
  { key: "broken", label: "Broken", emoji: "🔴" },
  { key: "fixed", label: "Fixed", emoji: "🟢" },
  { key: "needs_update", label: "Needs Update", emoji: "🟡" },
  { key: "incompatible", label: "Incompatible", emoji: "🟣" },
];

const PRIORITIES = [
  { key: "", label: "All" },
  { key: "Low", label: "Low" },
  { key: "Medium", label: "Medium" },
  { key: "High", label: "High" },
  { key: "Critical", label: "Critical" },
];

export default function DebuggerPage() {
  const [selectedContainer, setSelectedContainer] = useState("");
  const [mods, setMods] = useState<typeof defaultModData>({});
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [newModName, setNewModName] = useState("");

  useEffect(() => {
    if (!selectedContainer) {
      setMods({});
      return;
    }
    const saved = localStorage.getItem(`mods_${selectedContainer}`);
    setMods(saved ? JSON.parse(saved) : defaultModData);
  }, [selectedContainer]);

  useEffect(() => {
    if (selectedContainer) {
      localStorage.setItem(`mods_${selectedContainer}`, JSON.stringify(mods));
    }
  }, [mods, selectedContainer]);

  const updateModStatus = (modName: string, newStatus: string) => {
    setMods((prev) => ({
      ...prev,
      [modName]: { ...prev[modName], status: newStatus },
    }));
  };

  const updateModPriority = (modName: string, newPriority: string) => {
    setMods((prev) => ({
      ...prev,
      [modName]: { ...prev[modName], priority: newPriority },
    }));
  };

  const addNote = (modName: string) => {
    const text = noteInputs[modName]?.trim();
    if (!text) return;
    const note = {
      id: Date.now(),
      text,
      date: new Date().toLocaleString(),
      author: "Staff",
    };
    setMods((prev) => ({
      ...prev,
      [modName]: {
        ...prev[modName],
        notes: [note, ...(prev[modName].notes || [])],
      },
    }));
    setNoteInputs((prev) => ({ ...prev, [modName]: "" }));
  };

  const deleteNote = (modName: string, noteId: number) => {
    setMods((prev) => ({
      ...prev,
      [modName]: {
        ...prev[modName],
        notes: prev[modName].notes.filter((n: any) => n.id !== noteId),
      },
    }));
  };

  const handleAddMod = () => {
    const mod = newModName.trim();
    if (!mod || mods[mod]) return;
    setMods((prev) => ({
      ...prev,
      [mod]: {
        status: "broken",
        priority: "Medium",
        log: "Newly added mod — please review.",
        notes: [],
      },
    }));
    setNewModName("");
  };

  const filteredMods = Object.entries(mods).filter(([_, info]) => {
    return (
      (!statusFilter || info.status === statusFilter) &&
      (!priorityFilter || info.priority === priorityFilter)
    );
  });

  return (
    <main className="debugger">
      <header className="debugger-header">
        <h1 className="debugger-title">🛠️ Mod Debugger</h1>
        <p className="debugger-subtitle">
          Select a container, filter mods by status/priority, add notes, or
          manually track mods.
        </p>
      </header>

      <section className="debugger-panel">
        <label htmlFor="container-select" className="input-label">
          🎮 Select Container
        </label>
        <select
          id="container-select"
          value={selectedContainer}
          onChange={(e) => setSelectedContainer(e.target.value)}
          className="select-dropdown"
        >
          <option value="">-- Choose a server --</option>
          {mockContainers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </section>

      {selectedContainer && (
        <>
          <div className="debugger-panel">
            <input
              type="text"
              value={newModName}
              onChange={(e) => setNewModName(e.target.value)}
              placeholder="Enter new mod name..."
              className="input-new-mod"
            />
            <button className="btn-add-mod" onClick={handleAddMod}>
              ➕ Add Mod
            </button>
          </div>

          <div className="mod-filter-buttons">
            {TAGS.map((tag) => (
              <button
                key={tag.key}
                className={`filter-button ${
                  statusFilter === tag.key ? "active" : ""
                }`}
                onClick={() => setStatusFilter(tag.key)}
              >
                {tag.emoji} {tag.label}
              </button>
            ))}
          </div>

          <div className="mod-filter-buttons">
            {PRIORITIES.map((p) => (
              <button
                key={p.key}
                className={`filter-button ${
                  priorityFilter === p.key ? "active" : ""
                }`}
                onClick={() => setPriorityFilter(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <h2 className="section-heading">
            {statusFilter || priorityFilter ? "Filtered Mods" : "All Mods"}
          </h2>

          {filteredMods.length === 0 ? (
            <p className="mod-log empty">No mods match filters.</p>
          ) : (
            <ul className="mod-list">
              {filteredMods.map(([mod, info]) => (
                <li key={mod} className={`mod-card tag-${info.status}`}>
                  <div className="mod-card-header">
                    <h3 className="mod-name">{mod}</h3>
                    <select
                      value={info.status}
                      onChange={(e) => updateModStatus(mod, e.target.value)}
                      className="mod-tag-select"
                    >
                      {TAGS.filter((t) => t.key).map((tag) => (
                        <option key={tag.key} value={tag.key}>
                          {tag.emoji} {tag.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="priority-row">
                    <label className="priority-label">Priority:</label>
                    <select
                      value={info.priority}
                      onChange={(e) => updateModPriority(mod, e.target.value)}
                      className={`priority-select priority-${info.priority.toLowerCase()}`}
                    >
                      {PRIORITIES.filter((p) => p.key).map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <span
                      className={`priority-badge priority-${info.priority.toLowerCase()}`}
                    >
                      {info.priority}
                    </span>
                  </div>

                  <p className="mod-log">{info.log}</p>

                  <div className="notes-section">
                    <h4>Notes</h4>
                    <textarea
                      rows={3}
                      value={noteInputs[mod] || ""}
                      onChange={(e) =>
                        setNoteInputs((prev) => ({
                          ...prev,
                          [mod]: e.target.value,
                        }))
                      }
                      placeholder="Add a note..."
                      className="note-input"
                    />
                    <button
                      onClick={() => addNote(mod)}
                      className="btn-add-note"
                    >
                      Add Note
                    </button>

                    <div className="notes-list">
                      {info.notes.length === 0 ? (
                        <p className="empty">No notes yet.</p>
                      ) : (
                        info.notes.map((note: any) => (
                          <div key={note.id} className="note-item">
                            <div className="note-meta">
                              <span>{note.author}</span> —{" "}
                              <small>{note.date}</small>
                              <button
                                className="btn-delete-note"
                                onClick={() => deleteNote(mod, note.id)}
                              >
                                🗑️
                              </button>
                            </div>
                            <p>{note.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
