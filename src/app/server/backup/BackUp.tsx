"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import "./BackUp.css";

const formatDate = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return isoString;
  }
};

const Modal: React.FC<{
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmClass?: string;
}> = React.memo(
  ({
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Yes",
    cancelText = "Cancel",
    confirmClass = "",
  }) => {
    useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onCancel();
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [onCancel]);

    return (
      <div
        className="modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={onCancel}
      >
        <div
          className="modal"
          onClick={(e) => e.stopPropagation()}
          tabIndex={0}
          aria-describedby="modal-desc"
        >
          <h2 id="modal-title">{title}</h2>
          <p id="modal-desc">{message}</p>
          <div className="modal-buttons">
            <button
              onClick={onConfirm}
              className={`modal-confirm-btn ${confirmClass}`}
              aria-label={confirmText}
            >
              {confirmText}
            </button>
            <button onClick={onCancel} aria-label={cancelText}>
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

interface Backup {
  id: string;
  name: string;
  date: string;
}

const BackUp: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "restore" | "delete" | null;
    backup: Backup | null;
  }>({
    isOpen: false,
    type: null,
    backup: null,
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBackups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/docker/backups");
      if (!res.ok) throw new Error("Failed to fetch backups");
      const data: Backup[] = await res.json();
      setBackups(data);
    } catch (err: any) {
      alert("Error loading backups: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const createBackup = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/docker/backups/create", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create backup");
      const newBackup: Backup = await res.json();
      setBackups((prev) => [newBackup, ...prev]);
      alert("Backup created successfully!");
    } catch (err: any) {
      alert("Error creating backup: " + err.message);
    } finally {
      setLoading(false);
      setModal({ isOpen: false, type: null, backup: null });
    }
  }, [loading]);

  const openModal = useCallback(
    (type: "restore" | "delete", backup: Backup) => {
      setModal({ isOpen: true, type, backup });
    },
    []
  );

  const closeModal = useCallback(() => {
    setModal({ isOpen: false, type: null, backup: null });
  }, []);

  const handleRestore = useCallback(async () => {
    if (!modal.backup) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/docker/backups/restore/${modal.backup.id}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to restore backup");
      alert(`Restored from backup: ${modal.backup.name}`);
    } catch (err: any) {
      alert("Error restoring backup: " + err.message);
    } finally {
      setLoading(false);
      closeModal();
    }
  }, [modal.backup, closeModal]);

  const handleDelete = useCallback(async () => {
    if (!modal.backup) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/docker/backups/delete/${modal.backup.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete backup");
      setBackups((prev) => prev.filter((b) => b.id !== modal.backup!.id));
      alert(`Deleted backup: ${modal.backup.name}`);
    } catch (err: any) {
      alert("Error deleting backup: " + err.message);
    } finally {
      setLoading(false);
      closeModal();
    }
  }, [modal.backup, closeModal]);

  const filteredBackups = useMemo(() => {
    if (!searchTerm.trim()) return backups;
    const lower = searchTerm.toLowerCase();
    return backups.filter(
      (b) =>
        b.name.toLowerCase().includes(lower) ||
        b.date.toLowerCase().includes(lower)
    );
  }, [backups, searchTerm]);

  return (
    <main className="backup-page" role="main" aria-labelledby="page-title">
      <h1 id="page-title">Server Backups</h1>
      <p className="backup-description">
        Manage your server backups. Backups are created, restored, and deleted
        via your Docker containers.
      </p>

      <input
        type="search"
        aria-label="Search backups"
        placeholder="Search backups by name or date..."
        className="backup-search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        disabled={loading}
      />

      <button
        type="button"
        onClick={createBackup}
        className="create-backup-btn"
        aria-label="Create a new backup"
        disabled={loading}
      >
        {loading ? "Working..." : "➕ Create New Backup"}
      </button>

      {loading && backups.length === 0 ? (
        <p>Loading backups...</p>
      ) : filteredBackups.length === 0 ? (
        <p>No backups found. Adjust search or create a new backup!</p>
      ) : (
        <ul className="backup-list" aria-live="polite">
          {filteredBackups.map((backup) => (
            <li key={backup.id} className="backup-item">
              <span className="backup-name">{backup.name}</span>
              <time className="backup-date" dateTime={backup.date}>
                {formatDate(backup.date)}
              </time>
              <div className="backup-actions">
                <button
                  onClick={() => openModal("restore", backup)}
                  disabled={loading}
                >
                  🔄 Restore
                </button>
                <button
                  onClick={() => alert("Export not implemented")}
                  className="export-btn"
                  disabled={loading}
                >
                  📤 Export
                </button>
                <button
                  onClick={() => openModal("delete", backup)}
                  className="delete-btn"
                  disabled={loading}
                >
                  🗑️ Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal.isOpen && modal.backup && (
        <Modal
          title={
            modal.type === "restore" ? "Restore Backup?" : "Delete Backup?"
          }
          message={`Are you sure you want to ${
            modal.type === "restore" ? "restore from" : "delete"
          } backup "${modal.backup.name}"?`}
          onConfirm={modal.type === "restore" ? handleRestore : handleDelete}
          onCancel={closeModal}
          confirmClass={modal.type === "delete" ? "delete-btn" : ""}
          confirmText="Yes"
          cancelText="Cancel"
        />
      )}
    </main>
  );
};

export default BackUp;
