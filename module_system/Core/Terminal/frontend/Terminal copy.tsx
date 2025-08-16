"use client";

import React, { useState, useEffect, useRef } from "react";
import "./terminal.css";

const API_BASE = "http://localhost:2010/api";

interface ServerStats {
  ramUsed?: number;
  ramTotal?: number;
  cpu?: number;
  status?: string;
  uptime?: string;
}

const Terminal = () => {
  const [status, setStatus] = useState("Please start the server");
  const [logs, setLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem("pz-logs");
    return saved ? JSON.parse(saved) : ["[System] Terminal ready."];
  });
  const [command, setCommand] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [isServerRunning, setIsServerRunning] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const addLog = (text: string, includeTimestamp = true) => {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = includeTimestamp ? `[${timestamp}] ${text}` : text;
    setLogs((prev) => {
      const updated = [...prev, formatted].slice(-500); // keep last 500 logs
      localStorage.setItem("pz-logs", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/server-stats`);
        const data = await res.json();
        setServerStats(data);
        setIsServerRunning(data.status === "running");
        setStatus(
          data.status === "running" ? "Server is running" : "Server stopped"
        );
      } catch {
        addLog("ERROR: Failed to fetch server stats", false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const startServerStream = async () => {
    if (eventSourceRef.current) eventSourceRef.current.close();

    setStatus("Starting server...");
    addLog("[System] Starting Project Zomboid server...");

    try {
      const response = await fetch(`${API_BASE}/start-server`, {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json();
        addLog(`[Error] ${errorData.error || "Server start failed"}`);
        setStatus("Failed to start server.");
        return;
      }

      const es = new EventSource(`${API_BASE}/server-logs-stream`);
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        if (e.data === "[Process finished]") {
          addLog("[System] Server process finished.");
          setStatus("Server stopped.");
          setIsServerRunning(false);
          es.close();
          eventSourceRef.current = null;
        } else {
          addLog(e.data, false);
        }
      };

      es.onerror = () => {
        addLog("[Error] Server stream error or lost.");
        setStatus("Connection lost.");
        setIsServerRunning(false);
        if (eventSourceRef.current) eventSourceRef.current.close();
        eventSourceRef.current = null;
      };

      setStatus("Server is running");
      setIsServerRunning(true);
    } catch {
      addLog("[Error] Could not start server.");
      setStatus("Failed to start server.");
    }
  };

  const handleCommand = async (cmd: string) => {
    switch (cmd.toLowerCase()) {
      case "start":
        if (isServerRunning) return addLog("[System] Server already running.");
        await startServerStream();
        break;
      case "stop":
        if (!isServerRunning) return addLog("[System] Server is not running.");
        if (eventSourceRef.current) eventSourceRef.current.close();
        try {
          await fetch(`${API_BASE}/shutdown-server`, { method: "POST" });
          addLog("[System] Server stopped.");
          setStatus("Server stopped.");
          setIsServerRunning(false);
        } catch {
          addLog("[Error] Failed to stop server.");
        }
        break;
      case "restart":
        addLog("[System] Restarting server...");
        setStatus("Restarting server...");
        if (eventSourceRef.current) eventSourceRef.current.close();
        try {
          await fetch(`${API_BASE}/shutdown-server`, { method: "POST" });
          addLog("[System] Server shutdown completed.");
        } catch {
          addLog("[Error] Restart failed during shutdown.");
        }
        setTimeout(startServerStream, 1500);
        break;
      case "shutdown":
        addLog("[System] Shutting down server...");
        setStatus("Shutting down server...");
        if (eventSourceRef.current) eventSourceRef.current.close();
        try {
          await fetch(`${API_BASE}/shutdown-server`, { method: "POST" });
          addLog("[System] Server has been shut down.");
          setStatus("Server has been shut down.");
          setIsServerRunning(false);
        } catch {
          addLog("[Error] Failed to shut down server.");
        }
        break;
      default:
        addLog(`[Warning] Unknown command: ${cmd}`);
    }
  };

  const submitCommand = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!command.trim()) return;
    addLog(`> ${command}`);
    handleCommand(command.trim());
    setCommand("");
  };

  const handleClear = () => {
    localStorage.removeItem("pz-logs");
    setLogs([]);
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join("\n")).then(
      () => alert("Logs copied!"),
      () => alert("Failed to copy logs.")
    );
  };

  const filteredLogs = logs.filter((log) =>
    log.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="boxed-container">
      <div className="terminal-layout">
        <div className="terminal-wrapper">
          <header className="terminal-header-box">
            <div
              className={`status ${status.toLowerCase().replace(/\s+/g, "-")}`}
            >
              ● {status}
            </div>
            <div className="controls">
              <button
                onClick={() => handleCommand("start")}
                disabled={isServerRunning}
              >
                Start
              </button>
              <button
                onClick={() => handleCommand("restart")}
                disabled={!isServerRunning}
              >
                Restart
              </button>
              <button
                onClick={() => handleCommand("stop")}
                disabled={!isServerRunning}
              >
                Stop
              </button>
              <button
                onClick={() => handleCommand("shutdown")}
                disabled={!isServerRunning}
              >
                Shutdown
              </button>
              <input
                className="log-search"
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </header>

          <div className="terminal-logs">
            {filteredLogs.length ? (
              filteredLogs.map((log, index) => (
                <pre key={index} className="terminal-log">
                  {log}
                </pre>
              ))
            ) : (
              <p className="terminal-log no-results">No matching logs found.</p>
            )}
          </div>

          <form onSubmit={submitCommand} className="command-form">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Type command here..."
            />
            <button type="submit">Send</button>
            <button type="button" onClick={handleClear}>
              Clear
            </button>
            <button type="button" onClick={handleCopyLogs}>
              Copy Logs
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
