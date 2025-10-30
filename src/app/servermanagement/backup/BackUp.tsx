"use client";

import React, { useState, useEffect } from "react";
import "./BackUp.css";

interface BackupItem {
  name: string;
  date: string;
  size: string;
}

export default function BackUpRestore() {
  const [backupPath, setBackupPath] = useState("/home/modix/backups");
  const [backups, setBackups] = useState<BackupItem[]>([
    {
      name: "backup_2025-10-30_12-00",
      date: "30 Oct 2025, 12:00",
      size: "1.2 GB",
    },
    {
      name: "backup_2025-10-29_18-30",
      date: "29 Oct 2025, 18:30",
      size: "1.1 GB",
    },
  ]);
  const [filter, setFilter] = useState("");
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [warning, setWarning] = useState<{
    show: boolean;
    backup?: BackupItem;
    action?: "delete" | "restore";
  }>({ show: false });

  // Work-in-progress popup state
  const [wipPopup, setWipPopup] = useState(true);

  const handleBackupPathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBackupPath(e.target.value);
  };

  const handleBackup = () => {
    if (!backupPath) {
      setError("Please specify a folder to save the backup.");
      return;
    }
    setSaving(true);
    setProgress("Creating backup...");
    setError(null);
    setSuccess(null);

    setTimeout(() => setProgress("Backing up server files..."), 500);
    setTimeout(() => {
      const newBackup: BackupItem = {
        name: `backup_${new Date().toISOString().replace(/[:.]/g, "-")}`,
        date: new Date().toLocaleString(),
        size: `${(Math.random() * 1.5 + 0.5).toFixed(1)} GB`,
      };
      setBackups((prev) => [newBackup, ...prev]);
      setProgress(null);
      setSaving(false);
      setSuccess("Backup completed successfully!");
    }, 2000);
  };

  const confirmAction = (backup: BackupItem, action: "delete" | "restore") => {
    setWarning({ show: true, backup, action });
  };

  const handleWarningConfirm = () => {
    if (!warning.backup || !warning.action) return;
    const backup = warning.backup;

    if (warning.action === "delete") {
      setBackups((prev) => prev.filter((b) => b.name !== backup.name));
      setSuccess(`Backup "${backup.name}" deleted successfully!`);
    } else if (warning.action === "restore") {
      setProgress(`Restoring backup "${backup.name}"...`);
      setSaving(true);
      setTimeout(() => {
        setProgress(null);
        setSaving(false);
        setSuccess(`Backup "${backup.name}" restored successfully!`);
      }, 2000);
    }

    setWarning({ show: false });
  };

  const handleWarningCancel = () => {
    setWarning({ show: false });
  };

  const handleRename = (backup: BackupItem) => {
    const newName = prompt("Enter new backup name:", backup.name);
    if (!newName) return;
    setBackups((prev) =>
      prev.map((b) => (b.name === backup.name ? { ...b, name: newName } : b))
    );
    setSuccess(`Backup renamed to "${newName}"!`);
  };

  const filteredBackups = backups.filter((b) =>
    b.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="modix-page-wrapper">
      <header className="modix-page-header">
        <h1>💾 Backup & Restore</h1>
        <p>
          Manage your Project Zomboid server backups. Create, restore, rename,
          or delete backups safely.
        </p>
      </header>

      <main className="modix-card">
        <div className="modix-form-group">
          <label htmlFor="backup-path">Backup Folder Path</label>
          <input
            id="backup-path"
            type="text"
            value={backupPath}
            onChange={handleBackupPathChange}
            placeholder="/home/modix/backups"
          />
        </div>

        <button
          className="modix-button"
          onClick={handleBackup}
          disabled={saving}
        >
          {saving ? "Backing up..." : "Create Backup"}
        </button>

        {progress && <p className="modix-progress-text">{progress}</p>}
        {error && <p className="modix-error-text">{error}</p>}
        {success && <p className="modix-success-text">{success}</p>}

        <h2 style={{ marginTop: "24px", color: "#3b82f6" }}>
          Existing Backups
        </h2>

        <input
          type="text"
          placeholder="Search backups..."
          className="modix-search-input"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        {filteredBackups.length === 0 ? (
          <p>No backups found.</p>
        ) : (
          <div className="backup-list">
            {filteredBackups.map((b) => (
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
                    onClick={() => handleRename(b)}
                    disabled={saving}
                  >
                    Rename
                  </button>
                  <button
                    className="modix-button small red"
                    onClick={() => confirmAction(b, "delete")}
                    disabled={saving}
                  >
                    Delete
                  </button>
                  <button
                    className="modix-button small"
                    onClick={() => confirmAction(b, "restore")}
                    disabled={saving}
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Backup warning modal */}
      {warning.show && warning.backup && (
        <div className="modix-warning-overlay">
          <div className="modix-warning-card">
            <h3>⚠️ Warning</h3>
            <p>
              {warning.action === "delete"
                ? `This will permanently delete backup "${warning.backup.name}". Are you sure?`
                : `This will restore backup "${warning.backup.name}" and overwrite current server data. Continue?`}
            </p>
            <div className="modix-warning-buttons">
              <button
                className="modix-button red"
                onClick={handleWarningConfirm}
              >
                Confirm
              </button>
              <button className="modix-button" onClick={handleWarningCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Work-in-progress popup */}
      {wipPopup && (
        <div className="warning-popup">
          <div className="warning-card">
            <div className="warning-glow" />
            <div className="warning-icon">⚠️</div>
            <h2>Page In Development</h2>
            <p>
              This page is not fully developed yet, but we're working on it.
            </p>
            <p>
              Request features or provide feedback on our{" "}
              <a href="https://discord.gg/EwWZUSR9tM" target="_blank">
                Discord
              </a>
              .
            </p>
            <button className="warning-btn" onClick={() => setWipPopup(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
