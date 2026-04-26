"use client";

import React, { useEffect, useState } from "react";
import "./BackUp.css";

interface BackupItem {
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

  // ---------------- LOAD BACKUPS ----------------
  const loadBackups = async () => {
    try {
      const res = await fetch(`${API}/list`);
      const data = await res.json();
      setBackups(data);
    } catch {
      setError("Failed to load backups");
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  // ---------------- CREATE BACKUP ----------------
  const createBackup = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setProgress("Creating backup...");

    try {
      const res = await fetch(`${API}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Backup failed");

      const newBackup: BackupItem = {
        name: data.name,
        date: data.date,
        size: `${data.size_mb} MB`,
      };

      setBackups((prev) => [newBackup, ...prev]);
      setSuccess("Backup created successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  // ---------------- DELETE BACKUP ----------------
  const deleteBackup = async (name: string) => {
    try {
      await fetch(`${API}/delete/${name}`, {
        method: "DELETE",
      });

      setBackups((prev) => prev.filter((b) => b.name !== name));
      setSuccess(`Deleted ${name}`);
    } catch {
      setError("Failed to delete backup");
    }
  };

  // ---------------- RESTORE BACKUP ----------------
  const restoreBackup = async (name: string) => {
    setLoading(true);
    setProgress(`Restoring ${name}...`);

    try {
      const res = await fetch(`${API}/restore/${name}`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Restore failed");

      setSuccess(`Restored ${name} successfully`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  // ---------------- FILTER ----------------
  const filteredBackups = backups.filter((b) =>
    b.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="modix-page-wrapper">
      <header className="modix-page-header">
        <h1>💾 Zomboid Backup Manager</h1>
        <p>Create, restore, and manage your server backups</p>
      </header>

      <main className="modix-card">
        {/* CREATE BUTTON */}
        <button
          className="modix-button"
          onClick={createBackup}
          disabled={loading}
        >
          {loading ? "Processing..." : "Create Backup"}
        </button>

        {/* STATUS */}
        {progress && <p className="modix-progress-text">{progress}</p>}
        {error && <p className="modix-error-text">{error}</p>}
        {success && <p className="modix-success-text">{success}</p>}

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search backups..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="modix-search-input"
        />

        {/* LIST */}
        <div className="backup-list">
          {filteredBackups.length === 0 ? (
            <p>No backups found.</p>
          ) : (
            filteredBackups.map((b) => (
              <div key={b.name} className="backup-item">
                <div>
                  <strong>{b.name}</strong>
                  <span>
                    {b.date} • {b.size}
                  </span>
                </div>

                <div className="backup-actions">
                  <button
                    className="modix-button small"
                    onClick={() => restoreBackup(b.name)}
                    disabled={loading}
                  >
                    Restore
                  </button>

                  <button
                    className="modix-button small red"
                    onClick={() => deleteBackup(b.name)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
