"use client";

import React, { useState, useEffect, useRef } from "react";
import "./terminal.css";
import Performance from "@/app/monitoring/performance/Performance";

interface TerminalProps {
  batchFile: string; // Path to batch/sh file
  os?: "windows" | "linux";
  title?: string; // Optional session name
}

interface ServerCommand {
  cmd: string;
  label: string;
}

const SERVER_COMMANDS: ServerCommand[] = [
  { cmd: "save", label: "Save world" },
  { cmd: "players", label: "List online players" },
  { cmd: "kick <username>", label: "Kick player" },
  { cmd: "ban <username>", label: "Ban player" },
  { cmd: "reloadlua", label: "Reload Lua scripts" },
  { cmd: "quit", label: "Shutdown server" },
];

const MAX_LOGS = 500;

const Terminal: React.FC<TerminalProps> = ({
  batchFile,
  os = "windows",
  title,
}) => {
  const [status, setStatus] = useState("stopped");
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>(["[System] Terminal ready."]);
  const [command, setCommand] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  const API_BASE = "http://localhost:2010/api/projectzomboid";

  // --- Auto-scroll ---
  const scrollToBottom = () => {
    if (autoScroll) logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const addLog = (text: string, timestamp = true) => {
    const line = timestamp
      ? `[${new Date().toLocaleTimeString()}] ${text}`
      : text;
    setLogs((prev) => [...prev.slice(-MAX_LOGS), line]);
  };

  const startServer = async () => {
    if (!batchFile) {
      addLog("[Error] No batch file provided!", false);
      return alert("Batch/sh file path required!");
    }

    try {
      addLog(`[System] Starting server with: ${batchFile}`);
      const res = await fetch(`${API_BASE}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchFile, os }),
      });
      const data = await res.json();
      if (data.error) {
        addLog(`[Error] ${data.error}`);
        setStatus("Error");
        return;
      }

      setIsServerRunning(true);
      setStatus("Running");
      connectLogStream();
    } catch (err: any) {
      addLog(`[Error] Failed to start server: ${err.message || err}`, false);
    }
  };

  const stopServer = async () => {
    try {
      const res = await fetch(`${API_BASE}/stop`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.error) {
        addLog(`[Error] ${data.error}`);
        return;
      }
      addLog("[System] Server stopped.");
      setIsServerRunning(false);
      setStatus("Stopped");
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    } catch {
      addLog("[Error] Failed to stop server.");
    }
  };

  const sendCommand = async (cmd: string) => {
    if (!cmd) return;
    try {
      await fetch(`${API_BASE}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      addLog(`> ${cmd}`);
    } catch {
      addLog("[Error] Command failed.");
    }
  };

  const submitCommand = (e: React.FormEvent) => {
    e.preventDefault();
    sendCommand(command);
    setCommand("");
  };

  const connectLogStream = () => {
    if (eventSourceRef.current) eventSourceRef.current.close();
    const es = new EventSource(`${API_BASE}/terminal/log-stream`);
    eventSourceRef.current = es;

    es.onopen = () => addLog("[System] Connected to live log stream.");
    es.onerror = () => addLog("[Warning] Lost connection to log stream.");

    es.onmessage = (e) => {
      const msg = e.data.trim();
      if (!msg) return;
      addLog(msg, false);

      if (msg.includes("Server stopped")) {
        addLog("[System] Server has stopped.");
        setIsServerRunning(false);
        setStatus("Stopped");
        es.close();
        eventSourceRef.current = null;
      }
    };
  };

  const filteredLogs = logs.filter((l) =>
    l.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="terminal-instance">
      {title && <h3 className="terminal-title">{title}</h3>}

      <header className={`terminal-header ${status.toLowerCase()}`}>
        <div className={`status-indicator ${status.toLowerCase()}`}>
          ● {status}
        </div>
        <div className="header-controls">
          <button onClick={startServer} disabled={isServerRunning}>
            Start
          </button>
          <button onClick={stopServer} disabled={!isServerRunning}>
            Stop
          </button>
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => setAutoScroll(!autoScroll)}>
            {autoScroll ? "🔒 Auto-scroll" : "🔓 Auto-scroll"}
          </button>
        </div>
      </header>

      <div className="terminal-logs">
        {filteredLogs.length ? (
          filteredLogs.map((log, i) => <pre key={i}>{log}</pre>)
        ) : (
          <p>No logs available</p>
        )}
        <div ref={logsEndRef} />
      </div>

      <form className="command-form" onSubmit={submitCommand}>
        <select
          onChange={(e) => {
            const val = e.target.value;
            if (val) {
              sendCommand(val);
              e.target.value = "";
            }
          }}
          defaultValue=""
        >
          <option disabled value="">
            Select command...
          </option>
          {SERVER_COMMANDS.map((c) => (
            <option key={c.cmd} value={c.cmd}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Enter command..."
          value={command}
          onChange={(e) => setCommand(e.target.value)}
        />
        <button type="submit">Send</button>
        <button type="button" onClick={() => setLogs([])}>
          Clear
        </button>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(logs.join("\n"))}
        >
          Copy
        </button>
      </form>

      <Performance />
    </div>
  );
};

export default Terminal;
