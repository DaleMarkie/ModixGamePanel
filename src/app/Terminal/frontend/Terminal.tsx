"use client";

import React, { useState, useEffect, useRef } from "react";
import Performance from "@/app/tools/performance/Performance";
import ServerSettingsPage from "@/app/server/ServerSettings/page";
import "./terminal.css";

type TabType = "server" | "system";

const MAX_LOGS = 500;
const MAX_RECENT_BATCHES = 3;
const RECENT_BATCHES_KEY = "recentPZBatches";
const SELECTED_BATCH_KEY = "selectedPZBatch";

const SERVER_COMMANDS = [
  { cmd: "save", label: "Save world" },
  { cmd: "players", label: "List online players" },
  { cmd: "kick <username>", label: "Kick player" },
  { cmd: "ban <username>", label: "Ban player" },
  { cmd: "reloadlua", label: "Reload Lua scripts" },
  { cmd: "quit", label: "Shutdown server" },
];

const Terminal: React.FC = () => {
  const [status, setStatus] = useState("stopped");
  const [logsByTab, setLogsByTab] = useState<Record<TabType, string[]>>({
    server: ["[System] Server terminal ready."],
    system: ["[System] System terminal ready."],
  });
  const [activeTab, setActiveTab] = useState<TabType>("server");
  const [command, setCommand] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFile, setBatchFile] = useState("");
  const [showBatchPrompt, setShowBatchPrompt] = useState(false);
  const [recentBatches, setRecentBatches] = useState<string[]>([]);
  const [pendingPasswordPrompt, setPendingPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isServerRunning, setIsServerRunning] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const API_BASE = "http://localhost:2010/api/projectzomboid";

  useEffect(() => {
    const storedBatches = localStorage.getItem(RECENT_BATCHES_KEY);
    if (storedBatches) setRecentBatches(JSON.parse(storedBatches));
    const storedBatch = localStorage.getItem(SELECTED_BATCH_KEY);
    if (storedBatch) setBatchFile(storedBatch);
    if (!storedBatch) setShowBatchPrompt(true);
  }, []);

  const addRecentBatch = (file: string) => {
    const updated = [file, ...recentBatches.filter(f => f !== file)].slice(0, MAX_RECENT_BATCHES);
    setRecentBatches(updated);
    localStorage.setItem(RECENT_BATCHES_KEY, JSON.stringify(updated));
  };

  const addLog = (text: string, tab: TabType = "server", timestamp = true) => {
    const formatted = timestamp ? `[${new Date().toLocaleTimeString()}] ${text}` : text;
    setLogsByTab(prev => {
      const updated = { ...prev, [tab]: [...prev[tab], formatted].slice(-MAX_LOGS) };
      if (tab === "server" && text.toLowerCase().includes("error")) {
        updated.system = [...prev.system, formatted].slice(-MAX_LOGS);
      }
      return updated;
    });
  };

  const parseLog = (log: string) => {
    const match = log.match(/^(\[[0-9: ]+[APM]*\])?\s*(\[[^\]]+\])?(.*)$/i);
    if (!match) return { timestamp: "", tag: "", rest: log };
    const [, timestamp, tag, rest] = match;
    return { timestamp: timestamp || "", tag: tag || "", rest: rest || "" };
  };

  const getTagClass = (tag: string) => {
    const t = tag.toLowerCase();
    if (!t) return "log-default";
    if (t.includes("error")) return "log-error";
    if (t.includes("system")) return "log-system";
    if (tag.trim().startsWith(">")) return "log-command";
    return "log-default";
  };

  const validateBatch = async (file: string) => {
    try {
      const res = await fetch(`${API_BASE}/validate-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchFile: file }),
      });
      const data = await res.json();
      return data.valid;
    } catch {
      return false;
    }
  };

  const startServer = async () => {
    if (!batchFile) return alert("Please enter your batch file path");
    addLog(`[System] Validating batch file path...`);
    const valid = await validateBatch(batchFile);
    if (!valid) {
      addLog(`[Error] Batch file invalid or missing: ${batchFile}`, "server");
      return;
    }

    addLog(`[System] Attempting to start server using ${batchFile}...`);
    addRecentBatch(batchFile);
    localStorage.setItem(SELECTED_BATCH_KEY, batchFile);
    setStatus("Starting...");

    try {
      const res = await fetch(`${API_BASE}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchFile }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        addLog(`[Error] Failed to start server: ${data.error || data.detail}`, "server");
        setStatus("stopped");
        return;
      }

      setIsServerRunning(true);
      setStatus("Server running");

      eventSourceRef.current?.close();
      const es = new EventSource(`${API_BASE}/terminal/log-stream`);
      eventSourceRef.current = es;

      es.onmessage = e => {
        const msg = e.data;
        addLog(msg, "server", false);

        if (msg.includes("Enter new administrator password:")) {
          setPendingPasswordPrompt(true);
        } else if (msg === "[SYSTEM] Server stopped") {
          setIsServerRunning(false);
          setStatus("stopped");
          setPendingPasswordPrompt(false);
          eventSourceRef.current = null;
          es.close();
        }
      };

      es.onerror = () => {
        addLog("[Error] Lost connection to log stream.", "server");
        setIsServerRunning(false);
        setStatus("connection lost");
        eventSourceRef.current?.close();
        eventSourceRef.current = null;
      };
    } catch (err: any) {
      addLog(`[Error] Exception starting server: ${err.message}`, "server");
      setStatus("stopped");
    }
  };

  const stopServer = async () => {
    try {
      await fetch(`${API_BASE}/stop`, { method: "POST" });
      addLog("[System] Server stopped manually.", "system");
      setIsServerRunning(false);
      setStatus("stopped");
      setPendingPasswordPrompt(false);
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      localStorage.removeItem(SELECTED_BATCH_KEY);
      setShowBatchPrompt(true);
    } catch {
      addLog("[Error] Failed to stop server.", "system");
    }
  };

  const sendServerCommand = async (cmd: string) => {
    try {
      await fetch(`${API_BASE}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      addLog(`> ${cmd}`, "server");
    } catch {
      addLog("[Error] Failed to send command.", "server");
    }
  };

  const submitCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    const cmd = command.trim();

    if (activeTab === "system") {
      addLog(`> ${cmd}`, "system");
      if (cmd.toLowerCase() === "start") startServer();
      else if (["stop", "shutdown"].includes(cmd.toLowerCase())) stopServer();
      else addLog(`[System] Unknown command: ${cmd}`, "system");
    } else if (activeTab === "server") {
      sendServerCommand(cmd);
    }

    setCommand("");
  };

  const handlePasswordSubmit = () => {
    if (!passwordInput) return;
    sendServerCommand(passwordInput);
    setPasswordInput("");
    setPendingPasswordPrompt(false);
  };

  const handleClear = () => setLogsByTab(prev => ({ ...prev, [activeTab]: [] }));
  const handleCopyLogs = () => navigator.clipboard.writeText(logsByTab[activeTab].join("\n"));
  const filteredLogs = logsByTab[activeTab].filter(log =>
    log.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Batch Prompt Modal ---
  if (showBatchPrompt) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Enter Project Zomboid .bat File</h2>
  
          {/* Show currently selected batch if exists */}
          {batchFile && (
            <p className="current-batch">
              <strong>Current Batch:</strong> {batchFile}
            </p>
          )}
  
          <input
            type="text"
            placeholder="C:\\Steam\\steamapps\\common\\Project Zomboid Dedicated Server\\ProjectZomboid64.bat"
            value={batchFile}
            onChange={(e) => setBatchFile(e.target.value)}
          />
  
          {recentBatches.length > 0 && (
            <div className="recent-batches">
              <p>Recent Batches:</p>
              {recentBatches.map((file, idx) => (
                <button
                  key={file}
                  className={`recent-btn ${idx === 0 ? "recent-btn-most-recent" : ""}`}
                  onClick={() => setBatchFile(file)}
                >
                  {file}
                </button>
              ))}
            </div>
          )}
  
          <button
            className="confirm-btn"
            onClick={() => {
              if (!batchFile) return alert("Batch file path required");
              setShowBatchPrompt(false);
              localStorage.setItem(SELECTED_BATCH_KEY, batchFile);
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    );
  }


  // --- Password Prompt Modal ---
  if (pendingPasswordPrompt) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Set Administrator Password</h2>
          <input
            type="password"
            value={passwordInput}
            placeholder="Enter admin password..."
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          <button className="confirm-btn" onClick={handlePasswordSubmit}>Submit</button>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-layout">
      {/* Terminal Header */}
      <header className="terminal-header-box">
  <div className={`status ${status.toLowerCase().replace(/\s+/g, "-")}`}>● {status}</div>
  <div className="controls">
    <button onClick={startServer} disabled={status === "Starting..." || isServerRunning}>Start</button>
    <button onClick={stopServer} disabled={!isServerRunning && status !== "Starting..."}>Stop</button>
    <button onClick={() => setShowBatchPrompt(true)}>Change Batch</button> {/* NEW BUTTON */}
    <input
      type="text"
      placeholder="Search logs..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
</header>

      {/* Tabs */}
      <div className="terminal-tabs">
        {(["system", "server"] as TabType[]).map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
            {tab === "server" ? "Server" : "System"}
          </button>
        ))}
      </div>

      {/* Logs */}
      <div className="terminal-logs">
        {filteredLogs.length ? filteredLogs.map((log, idx) => {
          const { timestamp, tag, rest } = parseLog(log);
          return (
            <pre key={idx} className="terminal-log">
              {timestamp && <span className="log-default">{timestamp} </span>}
              {tag && <span className={getTagClass(tag)}>{tag}</span>}
              <span className="log-default">{rest}</span>
            </pre>
          );
        }) : <p className="terminal-log no-results">No matching logs found.</p>}
      </div>

      {/* Command Input */}
      <form className="command-form" onSubmit={submitCommand}>
        {activeTab === "server" && (
          <select onChange={(e) => {
            const value = e.target.value;
            if (value) {
              setCommand(value);
              sendServerCommand(value);
              e.target.value = "";
            }
          }} defaultValue="">
            <option value="" disabled>Select common command...</option>
            {SERVER_COMMANDS.map(c => <option key={c.cmd} value={c.cmd}>{c.label}</option>)}
          </select>
        )}
        <input type="text" value={command} onChange={(e) => setCommand(e.target.value)} placeholder={activeTab === "server" ? "Enter server command..." : "Enter system command..."} />
        <button type="submit">Send</button>
        <button type="button" onClick={handleClear}>Clear</button>
        <button type="button" onClick={handleCopyLogs}>Copy Logs</button>
      </form>

      {/* Server Settings and Performance */}
      <Performance />
    </div>
  );
};

export default Terminal;
