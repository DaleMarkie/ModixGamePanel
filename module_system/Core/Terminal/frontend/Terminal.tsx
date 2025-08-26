"use client";

import React, { useState, useEffect } from "react";
import "./terminal.css";

interface LogEntry {
  text: string;
  type: "info" | "error" | "system";
}

const Terminal: React.FC = () => {
  const [status, setStatus] = useState("stopped");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [command, setCommand] = useState("");

  const API_BASE = "http://localhost:2010/api/terminal/projectzomboid";

  const appendLog = (text: string, type: LogEntry["type"] = "system") => {
    setLogs((prev) => [...prev, { text, type }].slice(-500));
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/status`);
      const data = await res.json();
      setStatus(data.status);
    } catch (err: any) {
      appendLog(`[ERROR] Cannot reach backend: ${err.message}`, "error");
      setStatus("unknown");
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const evtSource = new EventSource(`${API_BASE}/log-stream`);
    evtSource.onmessage = (e) => {
      if (!e.data) return;
      appendLog(e.data, "info");
    };
    evtSource.onerror = () => {
      appendLog("[ERROR] Lost connection to log stream.", "error");
      evtSource.close();
    };
    return () => evtSource.close();
  }, []);

  const startServer = async () => {
    appendLog(`[INFO] Attempting to start server...`);
    try {
      const res = await fetch(`${API_BASE}/start-server`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        appendLog(`[ERROR] Failed to start server: ${data.message}`, "error");
      } else {
        appendLog(`[INFO] Server started successfully`, "info");
      }
      fetchStatus();
    } catch (err: any) {
      appendLog(`[ERROR] Exception starting server: ${err.message}`, "error");
    }
  };

  const stopServer = async () => {
    appendLog(`[INFO] Attempting to stop server...`);
    try {
      const res = await fetch(`${API_BASE}/stop-server`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        appendLog(`[ERROR] Failed to stop server: ${data.message}`, "error");
      } else {
        appendLog(`[INFO] Server stopped successfully`, "system");
      }
      fetchStatus();
    } catch (err: any) {
      appendLog(`[ERROR] Exception stopping server: ${err.message}`, "error");
    }
  };

  const filteredLogs = logs.filter((log) =>
    log.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="terminal-layout">
      <header className="terminal-header-box">
        <div className={`status ${status}`}>● Server: {status}</div>
        <div className="controls">
          <button disabled={status === "running"} onClick={startServer}>
            Start Server
          </button>
          <button disabled={status !== "running"} onClick={stopServer}>
            Stop Server
          </button>
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="terminal-logs">
        {filteredLogs.map((log, i) => (
          <pre key={i} className={`terminal-log ${log.type}`}>
            {log.text}
          </pre>
        ))}
      </div>

      <div className="command-form">
        <input
          type="text"
          placeholder="Enter command..."
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && console.log(command)}
        />
        <button onClick={() => console.log(command)}>Send</button>
      </div>
    </div>
  );
};

export default Terminal;
