"use client";

import React, { useState, useEffect, useRef } from "react";
import Performance from "@/app/tools/performance/Performance";
import "./terminal.css";

type TabType = "server" | "system";
type OS = "windows" | "linux";

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
const MAX_RECENT_BATCHES = 3;

const Terminal: React.FC = () => {
  const [os, setOS] = useState<OS>("windows"); // Current OS
  const [status, setStatus] = useState("stopped");
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [logsByTab, setLogsByTab] = useState<Record<TabType, string[]>>({
    server: ["[System] Terminal ready."],
    system: ["[System] System ready."],
  });
  const [activeTab, setActiveTab] = useState<TabType>("server");
  const [command, setCommand] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFile, setBatchFile] = useState("");
  const [showBatchPrompt, setShowBatchPrompt] = useState(false);
  const [recentBatches, setRecentBatches] = useState<string[]>([]);
  const [pendingPasswordPrompt, setPendingPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const eventSourceRef = useRef<EventSource | null>(null);

  const API_BASE = "http://localhost:2010/api/projectzomboid";
  const RECENT_KEY = `recentPZBatches_${os}`;
  const SELECTED_KEY = `selectedPZBatch_${os}`;

  // --- Initialize recent batches & last selected ---
  useEffect(() => {
    const recent = localStorage.getItem(RECENT_KEY);
    if (recent) setRecentBatches(JSON.parse(recent));
    const selected = localStorage.getItem(SELECTED_KEY);
    if (selected) setBatchFile(selected);
    if (!selected) setShowBatchPrompt(true);
  }, [os]);

  // --- Logs ---
  const addLog = (text: string, tab: TabType = "server", timestamp = true) => {
    const line = timestamp
      ? `[${new Date().toLocaleTimeString()}] ${text}`
      : text;
    setLogsByTab((prev) => {
      const updated = { ...prev, [tab]: [...prev[tab], line].slice(-MAX_LOGS) };
      if (tab === "server" && text.toLowerCase().includes("error")) {
        updated.system = [...prev.system, line].slice(-MAX_LOGS);
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
    if (tag.startsWith(">")) return "log-command";
    return "log-default";
  };

  // --- Batch management ---
  const addRecentBatch = (file: string) => {
    const updated = [file, ...recentBatches.filter((f) => f !== file)].slice(
      0,
      MAX_RECENT_BATCHES
    );
    setRecentBatches(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const validateBatch = async (file: string) => {
    if (!file) return false;
    try {
      const res = await fetch(`${API_BASE}/validate-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchFile: file, os }),
      });
      const data = await res.json();
      return data.valid;
    } catch {
      return false;
    }
  };

  // --- Server start/stop ---
  const startServer = async (file?: string) => {
    const batchToUse = file || batchFile;
    if (!batchToUse) return alert("Please enter your batch/sh file path!");
    addLog(`[System] Validating batch file...`);
    const valid = await validateBatch(batchToUse);
    if (!valid) {
      addLog(`[Error] Invalid batch/sh file: ${batchToUse}`, "server");
      return;
    }

    addRecentBatch(batchToUse);
    localStorage.setItem(SELECTED_KEY, batchToUse);
    setBatchFile(batchToUse);
    setStatus("Starting...");

    try {
      const res = await fetch(`${API_BASE}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchFile: batchToUse, os }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        addLog(`[Error] Failed to start server: ${data.error || data.detail}`);
        setStatus("stopped");
        return;
      }

      setIsServerRunning(true);
      setStatus("Server running");

      eventSourceRef.current?.close();
      const es = new EventSource(`${API_BASE}/terminal/log-stream`);
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        const msg = e.data;
        addLog(msg, "server", false);

        if (msg.includes("Enter new administrator password:"))
          setPendingPasswordPrompt(true);
        if (msg === "[SYSTEM] Server stopped") {
          setIsServerRunning(false);
          setStatus("stopped");
          setPendingPasswordPrompt(false);
          eventSourceRef.current = null;
          es.close();
        }
      };

      es.onerror = () => {
        addLog("[Error] Lost log stream connection", "server");
        setIsServerRunning(false);
        setStatus("connection lost");
        eventSourceRef.current?.close();
        eventSourceRef.current = null;
      };
    } catch (err: any) {
      addLog(`[Error] Exception starting server: ${err.message}`);
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
      localStorage.removeItem(SELECTED_KEY);
      setShowBatchPrompt(true);
    } catch {
      addLog("[Error] Failed to stop server.", "system");
    }
  };

  const sendCommand = async (cmd: string) => {
    try {
      await fetch(`${API_BASE}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      addLog(`> ${cmd}`, "server");
    } catch {
      addLog("[Error] Command failed", "server");
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
      else addLog(`[System] Unknown command: ${cmd}`);
    } else sendCommand(cmd);
    setCommand("");
  };

  const handlePasswordSubmit = () => {
    if (!passwordInput) return;
    sendCommand(passwordInput);
    setPasswordInput("");
    setPendingPasswordPrompt(false);
  };

  const filteredLogs = logsByTab[activeTab].filter((l) =>
    l.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Modals ---
  if (showBatchPrompt)
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>
            Select Project Zomboid {os === "windows" ? ".bat" : ".sh"} File
          </h2>
          <div className="os-selector">
            <button
              className={os === "windows" ? "active" : ""}
              onClick={() => setOS("windows")}
            >
              Windows
            </button>
            <button
              className={os === "linux" ? "active" : ""}
              onClick={() => setOS("linux")}
            >
              Linux
            </button>
          </div>
          <input
            type="text"
            placeholder={
              os === "windows" ? "C:\\path\\server.bat" : "/path/server.sh"
            }
            value={batchFile}
            onChange={(e) => setBatchFile(e.target.value)}
          />
          {recentBatches.length > 0 && (
            <div className="recent-batches">
              <h4>Most Recent {os === "windows" ? "Batches" : "Scripts"}</h4>
              {recentBatches.map((f, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setBatchFile(f);
                    startServer(f);
                    setShowBatchPrompt(false);
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
          <button
            className="confirm-btn"
            onClick={() => {
              if (!batchFile) return alert("Batch/sh path required");
              localStorage.setItem(SELECTED_KEY, batchFile);
              setShowBatchPrompt(false);
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    );

  if (pendingPasswordPrompt)
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Set Admin Password</h2>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Enter password..."
          />
          <button className="confirm-btn" onClick={handlePasswordSubmit}>
            Submit
          </button>
        </div>
      </div>
    );

  // --- Main terminal UI ---
  return (
    <div className="terminal-layout">
      <header className="terminal-header">
        <div className={`status ${status.toLowerCase().replace(/\s/g, "-")}`}>
          ● {status}
        </div>
        <div className="header-controls">
          <button
            onClick={startServer}
            disabled={status === "Starting..." || isServerRunning}
          >
            Start
          </button>
          <button
            onClick={stopServer}
            disabled={!isServerRunning && status !== "Starting..."}
          >
            Stop
          </button>
          <button onClick={() => setShowBatchPrompt(true)}>Change Batch</button>
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="terminal-tabs">
        {(["system", "server"] as TabType[]).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "server" ? "Server" : "System"}
          </button>
        ))}
      </div>

      <div className="terminal-logs">
        {filteredLogs.length ? (
          filteredLogs.map((log, i) => {
            const { timestamp, tag, rest } = parseLog(log);
            return (
              <pre key={i}>
                {timestamp && <span className="log-default">{timestamp} </span>}
                {tag && <span className={getTagClass(tag)}>{tag}</span>}
                <span className="log-default">{rest}</span>
              </pre>
            );
          })
        ) : (
          <p>No matching logs</p>
        )}
      </div>

      <form className="command-form" onSubmit={submitCommand}>
        {activeTab === "server" && (
          <select
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                setCommand(val);
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
        )}
        <input
          type="text"
          placeholder={
            activeTab === "server" ? "Server command..." : "System command..."
          }
          value={command}
          onChange={(e) => setCommand(e.target.value)}
        />
        <button type="submit">Send</button>
        <button
          type="button"
          onClick={() => setLogsByTab((prev) => ({ ...prev, [activeTab]: [] }))}
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() =>
            navigator.clipboard.writeText(logsByTab[activeTab].join("\n"))
          }
        >
          Copy
        </button>
      </form>

      <Performance />
    </div>
  );
};

export default Terminal;
