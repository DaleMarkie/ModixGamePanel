"use client";

import React, { useState, useEffect, useRef } from "react";
import "./terminal.css";

interface LogEntry {
  text: string;
  type: "info" | "error" | "system";
}

interface TerminalProps {
  gameId: string;
  os: string;
}

const Terminal: React.FC<TerminalProps> = ({ gameId, os }) => {
  const [status, setStatus] = useState("stopped");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [command, setCommand] = useState("");
  const eventSourceRef = useRef<EventSource | null>(null);

  const API_BASE = `/api/terminal/projectzomboid/${gameId}/${os}`;
  const isLinuxComingSoon = os === "linux";

  const appendLog = (text: string, type: LogEntry["type"] = "system") => {
    setLogs((prev) => [...prev, { text, type }].slice(-500));
  };

  const fetchStatus = async () => {
    if (isLinuxComingSoon) {
      setStatus("coming-soon");
      return;
    }
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
    if (isLinuxComingSoon) return;

    // SSE log stream
    const evtSource = new EventSource(`${API_BASE}/log-stream`);
    eventSourceRef.current = evtSource;

    evtSource.onmessage = (e) => {
      if (!e.data) return;
      appendLog(e.data, "info");
    };
    evtSource.onerror = () => {
      appendLog("[ERROR] Lost connection to log stream.", "error");
      evtSource.close();
    };
    return () => evtSource.close();
  }, [gameId, os]);

  const startServer = async () => {
    if (isLinuxComingSoon) {
      appendLog(`[INFO] Linux server is coming soon. Cannot start.`, "system");
      return;
    }
    appendLog(`[INFO] Attempting to start server...`);
    try {
      const res = await fetch(`${API_BASE}/start-server`, { method: "POST" });
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
    if (isLinuxComingSoon) {
      appendLog(`[INFO] Linux server is coming soon. Cannot stop.`, "system");
      return;
    }
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

  const sendCommand = async () => {
    if (isLinuxComingSoon) {
      appendLog(`[INFO] Linux server is coming soon. Commands are disabled.`, "system");
      setCommand("");
      return;
    }
    if (!command.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        appendLog(`[ERROR] Command failed: ${data.message}`, "error");
      } else {
        appendLog(`[CMD] ${command}`, "system");
      }
    } catch (err: any) {
      appendLog(`[ERROR] Exception sending command: ${err.message}`, "error");
    }

    setCommand("");
  };

  const filteredLogs = logs.filter((log) =>
    log.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="terminal-layout">
      <header className="terminal-header-box">
        <div className={`status ${status}`}>
          ● Server: {isLinuxComingSoon ? "Coming Soon 🚧" : status}
        </div>
        <div className="controls">
          <button disabled={status === "running" || isLinuxComingSoon} onClick={startServer}>
            Start Server
          </button>
          <button disabled={status !== "running" || isLinuxComingSoon} onClick={stopServer}>
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
          onKeyDown={(e) => e.key === "Enter" && sendCommand()}
          disabled={isLinuxComingSoon}
        />
        <button onClick={sendCommand} disabled={isLinuxComingSoon}>Send</button>
      </div>
    </div>
  );
};

export default Terminal;
