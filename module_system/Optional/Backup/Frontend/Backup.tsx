"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
// ✅ Fixed imports for React icons
import { IconType } from "react-icons";
import { FaDiscord as FaDiscordIcon, FaCoffee as FaCoffeeIcon } from "react-icons/fa";

// Explicitly type them for JSX
const FaDiscord: IconType = FaDiscordIcon;
const FaCoffee: IconType = FaCoffeeIcon;

interface Backup {
  id: number;
  name: string;
  date: string;
  size: string;
}

export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setBackups([
        { id: 1, name: "Backup_2025_06_01", date: "01/06/2025", size: "150MB" },
        { id: 2, name: "Backup_2025_05_25", date: "25/05/2025", size: "140MB" },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleCreateBackup = () => {
    alert("Creating backup... (connect to API here)");
  };

  const handleRestore = (id: number) => {
    const backup = backups.find((b) => b.id === id);
    if (!backup) return;
    if (
      window.confirm(
        `Are you sure you want to restore "${backup.name}"? This will overwrite the current server state.`
      )
    ) {
      alert(`Restoring ${backup.name}...`);
    }
  };

  const handleDelete = (id: number) => {
    const backup = backups.find((b) => b.id === id);
    if (!backup) return;
    if (window.confirm(`Delete backup "${backup.name}"? This cannot be undone.`)) {
      setBackups(backups.filter((b) => b.id !== id));
    }
  };

  return (
    <div style={{ backgroundColor: "#121212", color: "#fff", minHeight: "100vh", padding: "20px" }}>
      <header
        style={{
          backgroundColor: "#1f1f1f",
          padding: "16px 24px",
          borderRadius: "12px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>💾 Server Backups</h1>
        <nav style={{ display: "flex", gap: "12px" }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/settings">Settings</Link>
          <Link href="/backup">Backups</Link>
        </nav>
      </header>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleCreateBackup}
          style={{
            backgroundColor: "#1db954",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 18px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          ➕ Create Backup
        </button>
      </div>

      {loading ? (
        <p>Loading backups...</p>
      ) : backups.length === 0 ? (
        <p>No backups found.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "16px",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {backups.map((backup) => (
            <div
              key={backup.id}
              style={{
                backgroundColor: "#1e1e1e",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #2a2a2a",
              }}
            >
              <h3 style={{ fontSize: "1.2rem" }}>{backup.name}</h3>
              <p>Date: {backup.date}</p>
              <p>Size: {backup.size}</p>
              <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
                <button
                  onClick={() => handleRestore(backup.id)}
                  style={{
                    backgroundColor: "#7289da",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Restore
                </button>
                <button
                  onClick={() => handleDelete(backup.id)}
                  style={{
                    backgroundColor: "#e74c3c",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <footer
        style={{
          marginTop: 40,
          padding: "16px 24px",
          backgroundColor: "#1f1f1f",
          color: "#eee",
          borderRadius: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.9rem",
        }}
      >
        <div>
          <span>© 2025 MODIX</span> | <span>Backup Manager</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <a
            href="https://discord.gg/EwWZUSR9tM"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#444",
              color: "#eee",
              padding: "8px 14px",
              borderRadius: 12,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            <FaDiscord size={20} />
            Discord
          </a>

          <a
            href="https://ko-fi.com/modixgamepanel"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#444",
              color: "#eee",
              padding: "8px 14px",
              borderRadius: 12,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            <FaCoffee size={20} />
            Ko-fi
          </a>
        </div>
      </footer>
    </div>
  );
}
