"use client";

import React, { useEffect, useState } from "react";
import "./BackUp.css";

interface BackupItem {
  id: string;
  name: string;
  date: string;
  size: string;
}

export default function BackUp() {
  const API = "http://localhost:2010/api/zomboid/backup";

  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ---------------- LOAD ----------------
  const loadBackups = async () => {
    const res = await fetch(`${API}/list`);
    const data = await res.json();
    setBackups(data);
  };

  useEffect(() => {
    loadBackups();
  }, []);

  // ---------------- CREATE ----------------
  const createBackup = async () => {
    setLoading(true);
    setProgress("Creating backup...");

    const res = await fetch(`${API}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const data = await res.json();

    setBackups((prev) => [
      {
        id: data.id,
        name: data.label,
        date: data.date,
        size: `${data.size_mb} MB`,
      },
      ...prev,
    ]);

    setSuccess("Backup created");
    setLoading(false);
    setProgress(null);
  };

  // ---------------- DELETE ----------------
  const deleteBackup = async (id: string) => {
    await fetch(`${API}/delete/${id}`, { method: "DELETE" });

    setBackups((prev) => prev.filter((b) => b.id !== id));
  };

  // ---------------- RESTORE ----------------
  const restoreBackup = async (id: string) => {
    setLoading(true);
    setProgress("Restoring...");

    await fetch(`${API}/restore/${id}`, { method: "POST" });

    setLoading(false);
    setProgress(null);
    setSuccess("Restored backup");
  };

  // ---------------- RENAME ----------------
  const renameBackup = async (id: string, current: string) => {
    const newName = prompt("Enter new backup name:", current);
    if (!newName) return;

    await fetch(`${API}/rename/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newName }),
    });

    setBackups((prev) =>
      prev.map((b) => (b.id === id ? { ...b, name: newName } : b))
    );
  };

  // ---------------- FILTER ----------------
  const filtered = backups.filter((b) =>
    b.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="modix-page-wrapper">
      <header className="modix-page-header">
        <h1>💾 Backup Manager</h1>
      </header>

      <main className="modix-card">
        <button className="modix-button" onClick={createBackup}>
          Create Backup
        </button>

        {progress && <p>{progress}</p>}
        {success && <p>{success}</p>}
        {error && <p>{error}</p>}

        <input
          placeholder="Search..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <div className="backup-list">
          {filtered.map((b) => (
            <div key={b.id} className="backup-item">
              <div>
                <strong>{b.name}</strong>
                <span>
                  {b.date} • {b.size}
                </span>
              </div>

              <div className="backup-actions">
                <button onClick={() => restoreBackup(b.id)}>Restore</button>

                <button onClick={() => renameBackup(b.id, b.name)}>
                  Rename
                </button>

                <button onClick={() => deleteBackup(b.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
