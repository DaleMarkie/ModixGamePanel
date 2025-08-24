"use client";

import React, { useState, useEffect } from "react";
import "./terminal.css";
import Performance from "src/app/tools/performance/Performance";

type TabType = "server" | "system" | "chat" | "connections";
const MAX_LOGS = 500;

const Terminal: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState("Please start the server");
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [logsByTab, setLogsByTab] = useState<Record<TabType, string[]>>({
    server: ["[System] Server terminal ready."],
    system: ["[System] System terminal ready."],
    chat: ["[System] Chat logs ready."],
    connections: ["[System] Connections log ready."],
  });
  const [activeTab, setActiveTab] = useState<TabType>("server");
  const [searchTerm, setSearchTerm] = useState("");
  const [command, setCommand] = useState("");
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const storedGame = localStorage.getItem("selectedGame");
    if (storedGame) setSelectedGameId(storedGame);
  }, []);

  const API_BASE =
    mounted && selectedGameId
      ? `http://localhost:2010/api/${selectedGameId}`
      : "";

  const saveLogs = (updated: Record<TabType, string[]>) => {
    if (mounted) localStorage.setItem("logs-tabs", JSON.stringify(updated));
    return updated;
  };

  const addLog = (text: string, tab: TabType = "server") => {
    const formatted = `[${new Date().toLocaleTimeString()}] ${text}`;
    setLogsByTab((prev) => {
      const updated = {
        ...prev,
        [tab]: [...prev[tab], formatted].slice(-MAX_LOGS),
      };
      return saveLogs(updated);
    });
  };

  const fetchStatus = async () => {
    if (!API_BASE) return;
    try {
      const res = await fetch(`${API_BASE}/server-status`);
      const data = await res.json();
      setIsServerRunning(data.status === "running");
      setStatus(
        data.status === "running" ? "Server is running" : "Server stopped"
      );
    } catch (err: any) {
      addLog(`[Error] Failed to fetch server status: ${err.message}`, "system");
      setIsServerRunning(false);
      setStatus("Server status unknown");
    }
  };

  useEffect(() => {
    if (!API_BASE) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [API_BASE]);

  const startServer = async () => {
    if (!API_BASE) return;
    try {
      const res = await fetch(`${API_BASE}/start`, { method: "POST" });
      const data = await res.json();
      if (data.error) addLog(`[Error] ${data.error}`, "system");
      if (data.message) addLog(`[Info] ${data.message}`, "system");
      fetchStatus();
    } catch (err: any) {
      addLog(`[Error] Failed to start server: ${err.message}`, "system");
    }
  };

  const stopServer = async () => {
    if (!API_BASE) return;
    try {
      const res = await fetch(`${API_BASE}/stop`, { method: "POST" });
      const data = await res.json();
      if (data.error) addLog(`[Error] ${data.error}`, "system");
      if (data.message) addLog(`[Info] ${data.message}`, "system");
      fetchStatus();
    } catch (err: any) {
      addLog(`[Error] Failed to stop server: ${err.message}`, "system");
    }
  };

  const sendCommand = async () => {
    if (!command.trim() || !API_BASE) return;
    try {
      const res = await fetch(`${API_BASE}/send-command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();
      if (data.error) addLog(`[Error] ${data.error}`, "system");
      if (data.message) addLog(`[Info] ${data.message}`, "system");
      setCommand("");
    } catch (err: any) {
      addLog(`[Error] Failed to send command: ${err.message}`, "system");
    }
  };

  const copyLogs = () => {
    const allLogs = logsByTab[activeTab].join("\n");
    navigator.clipboard
      .writeText(allLogs)
      .then(() => addLog("Logs copied to clipboard", "system"))
      .catch(() => addLog("Failed to copy logs", "system"));
  };

  const clearLogs = () => {
    setLogsByTab((prev) => {
      const updated = { ...prev, [activeTab]: [] };
      saveLogs(updated);
      return updated;
    });
    addLog("Logs cleared", "system");
  };

  if (!mounted || !selectedGameId) return <p>Loading terminal...</p>;

  const filteredLogs =
    logsByTab[activeTab]?.filter((log) =>
      log.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="terminal-layout">
      <header className="terminal-header-box">
        <div className={`status ${status.toLowerCase().replace(/\s+/g, "-")}`}>
          ● {status} <strong>({selectedGameId})</strong>
        </div>
        <div className="controls">
          <button disabled={isServerRunning} onClick={startServer}>
            Start
          </button>
          <button disabled={!isServerRunning} onClick={stopServer}>
            Stop
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

      <div className="terminal-tabs">
        {(["system", "server", "chat", "connections"] as TabType[]).map(
          (tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          )
        )}
      </div>

      <div className="log-controls">
        <button onClick={copyLogs}>Copy Logs</button>
        <button onClick={clearLogs}>Clear Logs</button>
      </div>

      <div className="terminal-logs">
        {filteredLogs.length ? (
          filteredLogs.map((log, i) => (
            <pre key={i} className="terminal-log">
              {log}
            </pre>
          ))
        ) : (
          <div className="terminal-log no-results">No logs found</div>
        )}
      </div>

      <div className="command-form">
        <input
          type="text"
          placeholder="Enter command..."
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendCommand()}
        />
        <button onClick={sendCommand}>Send</button>
      </div>

      <Performance />
    </div>
  );
};

export default Terminal;
