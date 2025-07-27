"use client";

import React, { useState, useEffect } from "react";
import "./Debugger.css";

const mockContainers = [
  { id: "pz_server_1", name: "Project Zomboid - Server 1" },
  { id: "pz_server_2", name: "Project Zomboid - Server 2" },
];

const mockModData = {
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
  const [mods, setMods] = useState<typeof mockModData>({});
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  // Load saved mods on container change or fallback to mock
  useEffect(() => {
    if (!selectedContainer) {
      setMods({});
      setNoteInputs({});
      setStatusFilter("");
      setPriorityFilter("");
      return;
    }
    const savedData = localStorage.getItem(`mods_${selectedContainer}`);
    if (savedData) {
      setMods(JSON.parse(savedData));
    } else {
      setMods(mockModData);
    }
    setNoteInputs({});
    setStatusFilter("");
    setPriorityFilter("");
  }, [selectedContainer]);

  // Save mods to localStorage on mods or container change
  useEffect(() => {
    if (selectedContainer) {
      localStorage.setItem(`mods_${selectedContainer}`, JSON.stringify(mods));
    }
  }, [mods, selectedContainer]);

  const handleContainerSelect = (id: string) => {
    setSelectedContainer(id);
  };

  const handleTagUpdate = (modName: string, newTag: string) => {
    setMods((prev) => ({
      ...prev,
      [modName]: {
        ...prev[modName],
        status: newTag,
      },
    }));
  };

  const handlePriorityUpdate = (modName: string, newPriority: string) => {
    setMods((prev) => ({
      ...prev,
      [modName]: {
        ...prev[modName],
        priority: newPriority,
      },
    }));
  };

  const handleNoteInputChange = (modName: string, text: string) => {
    setNoteInputs((prev) => ({ ...prev, [modName]: text }));
  };

  const handleAddNote = (modName: string) => {
    const noteText = noteInputs[modName]?.trim();
    if (!noteText) return;

    const newNote = {
      id: Date.now(),
      text: noteText,
      date: new Date().toLocaleString(),
      author: "Staff",
    };

    setMods((prev) => ({
      ...prev,
      [modName]: {
        ...prev[modName],
        notes: [newNote, ...(prev[modName].notes || [])],
      },
    }));

    setNoteInputs((prev) => ({ ...prev, [modName]: "" }));
  };

  const filteredMods = Object.entries(mods).filter(([_, info]) => {
    const statusMatch = statusFilter ? info.status === statusFilter : true;
    const priorityMatch = priorityFilter
      ? info.priority === priorityFilter
      : true;
    return statusMatch && priorityMatch;
  });

  return (
    <main className="debugger">
      <header className="debugger-header">
        <h1 className="debugger-title">🛠️ Mod Debugger</h1>
        <p className="debugger-subtitle">
          Select a server container and review mod issues, tags, priorities, and
          notes.
        </p>
      </header>

      <section className="debugger-panel">
        <label htmlFor="container-select" className="input-label">
          🎮 Select Container
        </label>
        <select
          id="container-select"
          value={selectedContainer}
          onChange={(e) => handleContainerSelect(e.target.value)}
          className="select-dropdown"
        >
          <option value="">-- Choose a server --</option>
          {mockContainers.map((container) => (
            <option key={container.id} value={container.id}>
              {container.name}
            </option>
          ))}
        </select>
      </section>

      {selectedContainer && (
        <>
          {/* Status Filter Buttons */}
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

          {/* Priority Filter Buttons */}
          <div className="mod-filter-buttons" style={{ marginTop: "0.5rem" }}>
            {PRIORITIES.map((priority) => (
              <button
                key={priority.key}
                className={`filter-button ${
                  priorityFilter === priority.key ? "active" : ""
                }`}
                onClick={() => setPriorityFilter(priority.key)}
              >
                {priority.label}
              </button>
            ))}
          </div>

          <h2 className="section-heading">
            🧩 {statusFilter || priorityFilter ? `Filtered Mods` : "All Mods"}
          </h2>

          {filteredMods.length === 0 ? (
            <p className="mod-log empty">No mods match the selected filters.</p>
          ) : (
            <ul className="mod-list">
              {filteredMods.map(([mod, info]) => {
                let priorityColor = "gray";
                switch (info.priority) {
                  case "Low":
                    priorityColor = "gray";
                    break;
                  case "Medium":
                    priorityColor = "yellow";
                    break;
                  case "High":
                    priorityColor = "orange";
                    break;
                  case "Critical":
                    priorityColor = "red";
                    break;
                }
                return (
                  <li key={mod} className={`mod-card tag-${info.status}`}>
                    <div className="mod-card-header">
                      <h3 className="mod-name">{mod}</h3>
                      <select
                        value={info.status}
                        onChange={(e) => handleTagUpdate(mod, e.target.value)}
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
                      <label
                        htmlFor={`priority-${mod}`}
                        className="priority-label"
                      >
                        Priority:
                      </label>
                      <select
                        id={`priority-${mod}`}
                        value={info.priority}
                        onChange={(e) =>
                          handlePriorityUpdate(mod, e.target.value)
                        }
                        className={`priority-select priority-${priorityColor}`}
                      >
                        {PRIORITIES.filter((p) => p.key).map((p) => (
                          <option key={p.key} value={p.key}>
                            {p.label}
                          </option>
                        ))}
                      </select>

                      <span
                        className={`priority-badge priority-${priorityColor}`}
                      >
                        {info.priority}
                      </span>
                    </div>

                    <p className="mod-log">{info.log}</p>

                    {/* Notes Section */}
                    <div className="notes-section">
                      <h4>Notes</h4>
                      <textarea
                        rows={3}
                        placeholder="Add a new note..."
                        value={noteInputs[mod] || ""}
                        onChange={(e) =>
                          handleNoteInputChange(mod, e.target.value)
                        }
                        className="note-input"
                      />
                      <button
                        className="btn-add-note"
                        onClick={() => handleAddNote(mod)}
                      >
                        Add Note
                      </button>

                      <div className="notes-list">
                        {info.notes?.length === 0 ? (
                          <p className="empty">No notes yet.</p>
                        ) : (
                          info.notes.map((note) => (
                            <div key={note.id} className="note-item">
                              <div className="note-meta">
                                <span>{note.author}</span> —{" "}
                                <small>{note.date}</small>
                              </div>
                              <p>{note.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
