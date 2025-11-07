"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaSteam,
  FaCheckCircle,
  FaExclamationCircle,
  FaRedo,
  FaTools,
  FaSync,
  FaDownload,
  FaTerminal,
} from "react-icons/fa";
import "./Validate.css";

const ValidatePage: React.FC = () => {
  const [steamLinked, setSteamLinked] = useState(true);
  const [validating, setValidating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState("Idle");
  const logsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    logsRef.current?.scrollTo({
      top: logsRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [logs]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const simulateValidate = (type: string) => {
    if (validating) return;
    setValidating(true);
    setProgress(0);
    setStatus(`${type} in progress...`);
    setLogs([]);
    addLog(`Starting ${type.toLowerCase()} process via SteamCMD...`);

    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.floor(Math.random() * 10 + 5);
      if (prog > 100) prog = 100;

      setProgress(prog);
      addLog(`${type} progress: ${prog}%`);

      if (prog === 100) {
        clearInterval(interval);
        addLog(`${type} complete. All files verified successfully.`);
        setStatus("Up to Date");
        setValidating(false);
      }
    }, 600);
  };

  return (
    <main className="validate-page">
      <header className="validate-header">
        <h1>🛠️ Validate Project Zomboid Server Files</h1>
        <p>
          Ensure your Project Zomboid server is up-to-date and verified directly
          through Steam.
        </p>
      </header>

      <section className="steam-section">
        <div className="steam-status">
          <FaSteam className="steam-icon" />
          {steamLinked ? (
            <span>Steam account linked — game ownership confirmed.</span>
          ) : (
            <span className="warning">
              Steam account not linked. Please sign in to continue.
            </span>
          )}
        </div>
        <button
          className={`steam-btn ${steamLinked ? "linked" : "unlinked"}`}
          onClick={() => setSteamLinked(!steamLinked)}
        >
          {steamLinked ? "Unlink Steam" : "Link Steam Account"}
        </button>
      </section>

      <section className="status-card">
        <h2>Game Status</h2>
        <div className="status-display">
          <span
            className={`status-text ${status === "Up to Date" ? "ok" : ""}`}
          >
            {status}
          </span>
          {status === "Up to Date" ? (
            <FaCheckCircle className="status-icon ok" />
          ) : (
            <FaExclamationCircle className="status-icon warn" />
          )}
        </div>
      </section>

      <section className="control-buttons">
        <button
          className="btn dark-green"
          onClick={() => simulateValidate("Validation")}
        >
          <FaTools /> Validate Files
        </button>
        <button
          className="btn dark-green"
          onClick={() => simulateValidate("Repair")}
        >
          <FaSync /> Repair Game
        </button>
        <button
          className="btn dark-green"
          onClick={() => simulateValidate("Reinstall")}
        >
          <FaRedo /> Reinstall
        </button>
      </section>

      {validating && (
        <div className="progress-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      )}

      <section className="logs-section">
        <h2>
          <FaTerminal /> Logs
        </h2>
        <div className="logs-container" ref={logsRef}>
          {logs.length === 0 ? (
            <p className="no-logs">
              No logs yet — start validation to see details.
            </p>
          ) : (
            logs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>
      </section>
    </main>
  );
};

export default ValidatePage;
