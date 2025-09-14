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

export default function DebuggerPage() {
  const [activeServer, setActiveServer] = useState<string | null>(null);
  const [mods, setMods] = useState<ModData>({});
  const [statusFilter, setStatusFilter] = useState<ModStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<ModPriority | "">("");
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Collapsibles
  const [showMods, setShowMods] = useState(true);
  const [showLogs, setShowLogs] = useState(true);
  const [showNotes, setShowNotes] = useState(true);

  // Fetch active server
  useEffect(() => {
    async function fetchActiveServer() {
      try {
        const res = await fetch("/api/active-server");
        const data = await res.json();
        setActiveServer(data.server || null);
      } catch (err: any) {
        setError("Failed to detect active server");
      }
    }
    fetchActiveServer();
  }, []);

  // Auto-refresh mods every 5 seconds
  useEffect(() => {
    if (!activeServer) return;

    let isMounted = true;

    const fetchMods = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/servers/${activeServer}/mods`);
        if (!res.ok) throw new Error("Failed to fetch mods");
        const data: ModData = await res.json();
        if (isMounted) setMods(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Unknown error fetching mods");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMods();
    const interval = setInterval(fetchMods, 5000); // Refresh every 5 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeServer]);

  // Update mod status
  async function updateModStatus(modName: string, newStatus: ModStatus) {
    if (!activeServer) return;
    try {
      const updated = { ...mods[modName], status: newStatus };
      await fetch(
        `/api/servers/${activeServer}/mods/${encodeURIComponent(modName)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }
      );
      setMods((prev) => ({ ...prev, [modName]: updated }));
    } catch {
      alert("Error updating mod status");
    }
  }

  // Update mod priority
  async function updateModPriority(modName: string, newPriority: ModPriority) {
    if (!activeServer) return;
    try {
      const updated = { ...mods[modName], priority: newPriority };
      await fetch(
        `/api/servers/${activeServer}/mods/${encodeURIComponent(modName)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }
      );
      setMods((prev) => ({ ...prev, [modName]: updated }));
    } catch {
      alert("Error updating mod priority");
    }
  }

  // Add a quick note
  async function addNote(modName: string) {
    const text = noteInputs[modName]?.trim();
    if (!text || !activeServer) return;
    try {
      const res = await fetch(
        `/api/servers/${activeServer}/mods/${encodeURIComponent(
          modName
        )}/notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, author: "Staff" }),
        }
      );
      if (!res.ok) throw new Error();
      const savedNote: Note = await res.json();
      setMods((prev) => ({
        ...prev,
        [modName]: {
          ...prev[modName],
          notes: [savedNote, ...(prev[modName].notes || [])],
        },
      }));
      setNoteInputs((prev) => ({ ...prev, [modName]: "" }));
    } catch {
      alert("Error adding note");
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
        {activeServer ? (
          <p className="debugger-subtitle">
            Connected to <b>{activeServer}</b>
          </p>
        ) : (
          <p className="debugger-subtitle">⚠️ No active server running.</p>
        )}
      </header>

      {error && <p className="error-message">{error}</p>}
      {loading && <p className="loading-text">Loading mods...</p>}

      {activeServer && (
        <>
          {/* Collapsible Mods */}
          <section className="debugger-section">
            <h2
              className="section-title"
              onClick={() => setShowMods(!showMods)}
            >
              {showMods ? "▼" : "▶"} Mods
            </h2>
            {showMods && (
              <>
                {/* Filters */}
                <section className="filters">
                  <label>Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as ModStatus | "")
                    }
                  >
                    <option value="">All</option>
                    <option value="broken">🔴 Broken</option>
                    <option value="fixed">🟢 Fixed</option>
                    <option value="needs_update">🟡 Needs Update</option>
                    <option value="incompatible">🟣 Incompatible</option>
                  </select>

                  <label>Priority:</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) =>
                      setPriorityFilter(e.target.value as ModPriority | "")
                    }
                  >
                    <option value="">All</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </section>

                {/* Mods List */}
                <ul className="mod-list">
                  {filteredMods.length === 0 ? (
                    <p className="mod-log empty">No mods match filters.</p>
                  ) : (
                    filteredMods.map(([mod, info]) => (
                      <li key={mod} className={`mod-card tag-${info.status}`}>
                        <div className="mod-card-header">
                          <h3>{mod}</h3>
                          <div className="quick-actions">
                            <button
                              onClick={() => updateModStatus(mod, "fixed")}
                            >
                              🟢 Fixed
                            </button>
                            <button
                              onClick={() =>
                                updateModStatus(mod, "needs_update")
                              }
                            >
                              🟡 Needs Update
                            </button>
                            <button
                              onClick={() =>
                                updateModStatus(mod, "incompatible")
                              }
                            >
                              🟣 Incompatible
                            </button>
                          </div>
                        </div>

                        <p className="mod-log">{info.log}</p>

                        <div className="priority-row">
                          <label>Priority:</label>
                          <select
                            value={info.priority}
                            onChange={(e) =>
                              updateModPriority(
                                mod,
                                e.target.value as ModPriority
                              )
                            }
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>

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
                            placeholder="Add a quick note..."
                          />
                          <button onClick={() => addNote(mod)}>Add Note</button>
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
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </>
            )}
          </section>

          {/* Collapsible Logs */}
          <section className="debugger-section">
            <h2
              className="section-title"
              onClick={() => setShowLogs(!showLogs)}
            >
              {showLogs ? "▼" : "▶"} Logs
            </h2>
            {showLogs && (
              <div className="log-box">
                <p>[Auto-refresh every 5s]</p>
              </div>
            )}
          </section>

          {/* Collapsible Global Notes */}
          <section className="debugger-section">
            <h2
              className="section-title"
              onClick={() => setShowNotes(!showNotes)}
            >
              {showNotes ? "▼" : "▶"} Notes
            </h2>
            {showNotes && (
              <div className="notes-list global-notes">
                <div className="note-item">
                  <p>System-wide notes appear here.</p>
                  <small>— System, {new Date().toLocaleString()}</small>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
