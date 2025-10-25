"use client";

import React, { useState } from "react";
import { Cloud, CheckCircle, AlertTriangle, Loader } from "lucide-react";
import axios from "axios";
import "./BackUp.css";

export default function BackupPage() {
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const handleBackup = async () => {
    setStatus("running");
    setMessage("Initializing backup...");
    try {
      const res = await axios.post("/api/backup");
      if (res.status === 200 && res.data.success) {
        setStatus("success");
        setMessage(`Backup completed! Saved to: ${res.data.backupPath}`);
        setLastBackup(new Date().toLocaleString());
      } else {
        throw new Error(res.data?.message || "Backup failed");
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage(err?.message || "An unexpected error occurred during backup.");
    } finally {
      setTimeout(() => setStatus("idle"), 5000); // Reset status after 5s
    }
  };

  return (
    <div className="backup-container">
      <h1>💾 Project Zomboid Backup</h1>
      <p className="backup-desc">
        Create a complete backup of your server including saves, mods, and configuration files. 
        Your server can stay running while performing the backup.
      </p>

      <div className="backup-actions">
        <button
          onClick={handleBackup}
          disabled={status === "running"}
          className={`backup-btn ${status}`}
        >
          {status === "running" ? (
            <>
              <Loader className="spin" size={18} /> Backing up...
            </>
          ) : (
            <>
              <Cloud size={18} /> Start Backup
            </>
          )}
        </button>

        {lastBackup && <p className="last-backup">Last backup: {lastBackup}</p>}
      </div>

      {status !== "idle" && (
        <div className={`backup-status ${status}`}>
          {status === "success" && <CheckCircle size={16} />}
          {status === "error" && <AlertTriangle size={16} />}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
