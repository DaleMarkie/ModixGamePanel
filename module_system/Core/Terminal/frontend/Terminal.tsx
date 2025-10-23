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
  const [os, setOS] = useState<OS>("windows");
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
  const [autoScroll, setAutoScroll] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const logsEndRef = useRef<HTMLDivElement | null>(null);

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

    // Restore logs
    const savedLogs = localStorage.getItem("terminalLogs");
    if (savedLogs) setLogsByTab(JSON.parse(savedLogs));

    // Reconnect logs automatically if server is running
    reconnectLogs();
  }, [os]);

  // --- Auto-scroll ---
  const scrollToBottom = () => {
    if (autoScroll) logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logsByTab, activeTab]);

  // --- Logs helper ---
  const addLog = (text: string, tab: TabType = "server", timestamp = true) => {
    const line = timestamp
      ? `[${new Date().toLocaleTimeString()}] ${text}`
      : text;
    setLogsByTab((prev) => {
      const updated = { ...prev, [tab]: [...prev[tab], line].slice(-MAX_LOGS) };
      if (tab === "server" && text.toLowerCase().includes("error")) {
        updated.system = [...prev.system, line].slice(-MAX_LOGS);
      }
      localStorage.setItem("terminalLogs", JSON.stringify(updated));
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

  // --- Server start ---
  const startServer = async (file?: string) => {
    try {
      const batchToUse = file || batchFile;
      if (!batchToUse || !batchToUse.trim()) {
        addLog("[Error] Please provide a valid batch file path!", "system");
        alert("Please enter your .bat or .sh file path!");
        return;
      }

      addLog(`[System] Validating batch file: ${batchToUse}`);
      const valid = await validateBatch(batchToUse);
      if (!valid) {
        addLog(
          `[Error] Invalid or missing batch file: ${batchToUse}`,
          "system"
        );
        return;
      }

      localStorage.setItem(SELECTED_KEY, batchToUse);
      setBatchFile(batchToUse);
      addRecentBatch(batchToUse);

      addLog("[System] Starting Project Zomboid server...");
      const startRes = await fetch(`${API_BASE}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchFile: batchToUse }),
      });
      const startData = await startRes.json();
      if (startData.error) {
        addLog(`[Error] ${startData.error}`, "server");
        setStatus("Error");
        return;
      }

      setIsServerRunning(true);
      setStatus("Running");
      reconnectLogs();
    } catch (err: any) {
      console.error(err);
      addLog(`[Error] Failed to start server: ${err.message || err}`, "system");
      setIsServerRunning(false);
      setStatus("Error");
    }
  };

  // --- Stop server ---
  const stopServer = async () => {
    try {
      const res = await fetch(`${API_BASE}/stop`, { method: "POST" });
      const data = await res.json();
      if (data.error) {
        addLog(`[Error] ${data.error}`, "system");
        return;
      }

      addLog("[System] Server stopped manually.", "system");
      setIsServerRunning(false);
      setStatus("Stopped");

      eventSourceRef.current?.close();
      eventSourceRef.current = null;

      localStorage.removeItem(SELECTED_KEY);
      setShowBatchPrompt(true);
    } catch {
      addLog("[Error] Failed to stop server.", "system");
    }
  };

  // --- Send command ---
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
    sendCommand(command.trim());
    setCommand("");
  };

  // --- Reconnect logs ---
  const reconnectLogs = () => {
    if (eventSourceRef.current) eventSourceRef.current.close();
    const es = new EventSource(`${API_BASE}/terminal/log-stream`);
    eventSourceRef.current = es;
    es.onopen = () =>
      addLog("[System] Connected to live log stream.", "system");
    es.onerror = () =>
      addLog("[Warning] Lost connection to log stream.", "system");
    es.onmessage = (e) => {
      const msg = e.data.trim();
      if (!msg) return;
      addLog(msg, "server", false);
      if (
        msg.includes("Server stopped") ||
        msg.includes("[SYSTEM] Server stopped")
      ) {
        addLog("[System] Server has stopped.", "system");
        setIsServerRunning(false);
        setStatus("Stopped");
        es.close();
        eventSourceRef.current = null;
      }
    };
  };

  const filteredLogs = logsByTab[activeTab].filter((l) =>
    l.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Batch modal ---
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

  // --- Main terminal UI ---
  return (
    <div className="terminal-layout">
      <header className="terminal-header">
        <div className={`status ${status.toLowerCase().replace(/\s/g, "-")}`}>
          ● {status}
        </div>
        <div className="header-controls">
          <button onClick={() => startServer()} disabled={isServerRunning}>
            Start
          </button>
          <button onClick={stopServer} disabled={!isServerRunning}>
            Stop
          </button>
          <button onClick={() => setShowBatchPrompt(true)}>Change Batch</button>
          <button onClick={reconnectLogs} disabled={!isServerRunning}>
            Reconnect Logs
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
        <div ref={logsEndRef} />
      </div>

      <form className="command-form" onSubmit={submitCommand}>
        {activeTab === "server" && (
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
