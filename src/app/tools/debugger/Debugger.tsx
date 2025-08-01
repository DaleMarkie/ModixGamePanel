"use client";

import React, { useState, useEffect } from "react";
import "./Debugger.css";

type ModStatus = "broken" | "fixed" | "needs_update" | "incompatible";
type ModPriority = "Low" | "Medium" | "High" | "Critical";

interface Note {
  id: number;
  text: string;
  date: string;
  author: string;
}

interface ModInfo {
  status: ModStatus;
  priority: ModPriority;
  log: string;
  notes: Note[];
}

type ModData = Record<string, ModInfo>;

interface Container {
  id: string;
  name: string;
}

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
  const [containers, setContainers] = useState<Container[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string>("");
  const [mods, setMods] = useState<ModData>({});
  const [statusFilter, setStatusFilter] = useState<ModStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<ModPriority | "">("");
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [newModName, setNewModName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load containers from API on mount
  useEffect(() => {
    async function fetchContainers() {
      try {
        setError(null);
        const res = await fetch("/api/containers");
        if (!res.ok) throw new Error("Failed to fetch containers");
        const data: Container[] = await res.json();
        setContainers(data);
      } catch (err: any) {
        setError(err.message || "Unknown error fetching containers");
      }
    }
    fetchContainers();
  }, []);

  // Load mods for selected container
  useEffect(() => {
    if (!selectedContainer) {
      setMods({});
      return;
    }

    async function fetchMods() {
      try {
        setError(null);
        setLoading(true);
        const res = await fetch(`/api/containers/${selectedContainer}/mods`);
        if (!res.ok) throw new Error("Failed to fetch mods");
        const data: ModData = await res.json();
        setMods(data);
      } catch (err: any) {
        setError(err.message || "Unknown error fetching mods");
        setMods({});
      } finally {
        setLoading(false);
      }
    }
    fetchMods();
  }, [selectedContainer]);

  // Update mod status
  async function updateModStatus(modName: string, newStatus: ModStatus) {
    if (!selectedContainer) return;
    try {
      const mod = mods[modName];
      const updatedMod = { ...mod, status: newStatus };
      const res = await fetch(
        `/api/containers/${selectedContainer}/mods/${encodeURIComponent(
          modName
        )}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedMod),
        }
      );
      if (!res.ok) throw new Error("Failed to update mod status");
      setMods((prev) => ({ ...prev, [modName]: updatedMod }));
    } catch (err: any) {
      alert(err.message || "Error updating mod status");
    }
  }

  // Update mod priority
  async function updateModPriority(modName: string, newPriority: ModPriority) {
    if (!selectedContainer) return;
    try {
      const mod = mods[modName];
      const updatedMod = { ...mod, priority: newPriority };
      const res = await fetch(
        `/api/containers/${selectedContainer}/mods/${encodeURIComponent(
          modName
        )}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedMod),
        }
      );
      if (!res.ok) throw new Error("Failed to update mod priority");
      setMods((prev) => ({ ...prev, [modName]: updatedMod }));
    } catch (err: any) {
      alert(err.message || "Error updating mod priority");
    }
  }

  // Add note
  async function addNote(modName: string) {
    const text = noteInputs[modName]?.trim();
    if (!text || !selectedContainer) return;
    try {
      const newNote = {
        text,
        author: "Staff",
      };
      const res = await fetch(
        `/api/containers/${selectedContainer}/mods/${encodeURIComponent(
          modName
        )}/notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newNote),
        }
      );
      if (!res.ok) throw new Error("Failed to add note");
      const savedNote: Note = await res.json();
      setMods((prev) => ({
        ...prev,
        [modName]: {
          ...prev[modName],
          notes: [savedNote, ...(prev[modName].notes || [])],
        },
      }));
      setNoteInputs((prev) => ({ ...prev, [modName]: "" }));
    } catch (err: any) {
      alert(err.message || "Error adding note");
    }
  }

  // Delete note
  async function deleteNote(modName: string, noteId: number) {
    if (!selectedContainer) return;
    try {
      const res = await fetch(
        `/api/containers/${selectedContainer}/mods/${encodeURIComponent(
          modName
        )}/notes/${noteId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete note");
      setMods((prev) => ({
        ...prev,
        [modName]: {
          ...prev[modName],
          notes: prev[modName].notes.filter((n) => n.id !== noteId),
        },
      }));
    } catch (err: any) {
      alert(err.message || "Error deleting note");
    }
  }

  // Add new mod
  async function handleAddMod() {
    const mod = newModName.trim();
    if (!mod || mods[mod]) return;
    if (!selectedContainer) return;
    try {
      const newMod: ModInfo = {
        status: "broken",
        priority: "Medium",
        log: "Newly added mod — please review.",
        notes: [],
      };
      const res = await fetch(`/api/containers/${selectedContainer}/mods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modName: mod, modInfo: newMod }),
      });
      if (!res.ok) throw new Error("Failed to add mod");
      setMods((prev) => ({ ...prev, [mod]: newMod }));
      setNewModName("");
    } catch (err: any) {
      alert(err.message || "Error adding mod");
    }
  }

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

      {error && <p className="error-message">{error}</p>}

      <section className="debugger-panel">
        <label htmlFor="container-select" className="input-label">
          🎮 Select Container
        </label>
        <select
          id="container-select"
          value={selectedContainer}
          onChange={(e) => setSelectedContainer(e.target.value)}
          className="select-dropdown"
          disabled={containers.length === 0}
        >
          <option value="">-- Choose a server --</option>
          {containers.map((c) => (
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
            <button
              className="btn-add-mod"
              onClick={handleAddMod}
              disabled={loading}
            >
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
                onClick={() => setStatusFilter(tag.key as ModStatus | "")}
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
                onClick={() => setPriorityFilter(p.key as ModPriority | "")}
              >
                {p.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p>Loading mods...</p>
          ) : filteredMods.length === 0 ? (
            <p className="mod-log empty">No mods match filters.</p>
          ) : (
            <>
              <h2 className="section-heading">
                {statusFilter || priorityFilter ? "Filtered Mods" : "All Mods"}
              </h2>
              <ul className="mod-list">
                {filteredMods.map(([mod, info]) => (
                  <li key={mod} className={`mod-card tag-${info.status}`}>
                    <div className="mod-card-header">
                      <h3 className="mod-name">{mod}</h3>
                      <select
                        value={info.status}
                        onChange={(e) =>
                          updateModStatus(mod, e.target.value as ModStatus)
                        }
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
                        onChange={(e) =>
                          updateModPriority(mod, e.target.value as ModPriority)
                        }
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
                        disabled={loading}
                      >
                        Add Note
                      </button>

                      <div className="notes-list">
                        {info.notes.length === 0 ? (
                          <p className="empty">No notes yet.</p>
                        ) : (
                          info.notes.map((note) => (
                            <div key={note.id} className="note-item">
                              <p>{note.text}</p>
                              <small>
                                — {note.author},{" "}
                                {new Date(note.date).toLocaleString()}
                              </small>
                              <button
                                onClick={() => deleteNote(mod, note.id)}
                                className="btn-delete-note"
                              >
                                🗑️
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </main>
  );
}
