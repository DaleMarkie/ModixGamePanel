"use client";

import React, { useEffect, useState } from "react";
import {
  FaSteam,
  FaPlay,
  FaRedo,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTerminal,
} from "react-icons/fa";

import "./SteamInstall.css";

interface InstallState {
  running: boolean;
  logs: string[];
  success: boolean;
  error: string | null;
}

export default function SteamInstaller() {
  const [state, setState] = useState<InstallState>({
    running: false,
    logs: [],
    success: false,
    error: null,
  });

  const [loading, setLoading] = useState(false);

  // ---------------- FETCH STATUS ----------------
  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/steam/status");
      const data = await res.json();
      setState(data);
    } catch (err) {
      console.error("Failed to fetch status", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1500);
    return () => clearInterval(interval);
  }, []);

  // ---------------- START INSTALL ----------------
  const startInstall = async () => {
    setLoading(true);
    try {
      await fetch("/api/steam/install", {
        method: "POST",
      });
      fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RESET ----------------
  const reset = async () => {
    await fetch("/api/steam/reset", {
      method: "POST",
    });
    fetchStatus();
  };

  return (
    <div className="steam-page">
      {/* HEADER */}
      <div className="steam-header">
        <div className="title">
          <FaSteam className="icon" />
          <h1>Steam Installer</h1>
        </div>
        <p>Install Steam automatically on Linux / ChromeOS (Crostini)</p>
      </div>

      {/* STATUS CARD */}
      <div className="status-card">
        {state.running && (
          <div className="status running">
            <FaTerminal /> Installing Steam...
          </div>
        )}

        {state.success && (
          <div className="status success">
            <FaCheckCircle /> Installation Complete
          </div>
        )}

        {state.error && (
          <div className="status error">
            <FaExclamationTriangle /> {state.error}
          </div>
        )}

        {!state.running && !state.success && !state.error && (
          <div className="status idle">Ready to install Steam</div>
        )}
      </div>

      {/* BUTTONS */}
      <div className="actions">
        <button
          onClick={startInstall}
          disabled={state.running || loading}
          className="btn primary"
        >
          <FaPlay /> {state.running ? "Installing..." : "Install Steam"}
        </button>

        <button onClick={reset} className="btn secondary">
          <FaRedo /> Reset
        </button>
      </div>

      {/* LOGS */}
      <div className="log-box">
        <div className="log-header">Live Logs</div>

        <div className="logs">
          {state.logs.length === 0 ? (
            <p className="empty">No logs yet...</p>
          ) : (
            state.logs.map((line, i) => (
              <div key={i} className="log-line">
                {line}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default InstallPage;
