"use client";

import React, { useState, useEffect, useRef } from "react";
import "./terminal.css";
import Performance from "@/app/monitoring/performance/Performance";

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
const MAX_RECENT_BATCHES = 5;
const AUTO_RESTART_DELAY = 5; // seconds

const Terminal: React.FC = () => {
  const [status, setStatus] = useState<"stopped" | "running" | "error">(
    "stopped"
  );
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [logsByTab, setLogsByTab] = useState<
    Record<"server" | "system", string[]>
  >({
    server: ["[System] Terminal ready."],
    system: ["[System] System ready."],
  });
  const [activeTab, setActiveTab] = useState<"server" | "system">("server");
  const [command, setCommand] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFile, setBatchFile] = useState("");
  const [showBatchPrompt, setShowBatchPrompt] = useState(false);
  const [recentBatches, setRecentBatches] = useState<string[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [autoRestart, setAutoRestart] = useState(true);
  const [uptime, setUptime] = useState<number>(0);
  const [restartCountdown, setRestartCountdown] = useState<number | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  const API_BASE = "http://localhost:2010/api/projectzomboid";
  const RECENT_KEY = `recentPZBatches_windows`;
  const SELECTED_KEY = `selectedPZBatch_windows`;

  // --- Init ---
  useEffect(() => {
    const recent = localStorage.getItem(RECENT_KEY);
    if (recent) setRecentBatches(JSON.parse(recent));

    const selected = localStorage.getItem(SELECTED_KEY);
    if (selected) setBatchFile(selected);
    if (!selected) setShowBatchPrompt(true);

    const savedLogs = localStorage.getItem("terminalLogs");
    if (savedLogs) setLogsByTab(JSON.parse(savedLogs));

    checkServerStatus();
  }, []);

  // --- Auto-scroll ---
  useEffect(() => {
    if (autoScroll) logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logsByTab, activeTab]);

  // --- Uptime ticker ---
  useEffect(() => {
    if (!isServerRunning) return;
    const interval = setInterval(() => setUptime((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isServerRunning]);

  // --- Restart countdown ticker ---
  useEffect(() => {
    if (restartCountdown === null) return;
    if (restartCountdown <= 0) {
      setRestartCountdown(null);
      startServer(); // auto-restart
      return;
    }
    const timer = setTimeout(
      () => setRestartCountdown((prev) => (prev !== null ? prev - 1 : null)),
      1000
    );
    return () => clearTimeout(timer);
  }, [restartCountdown]);

  // --- Logs helper ---
  const addLog = (
    text: string,
    tab: "server" | "system" = "server",
    timestamp = true
  ) => {
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
        body: JSON.stringify({ batchFile: file }),
      });
      const data = await res.json();
      return data.valid;
    } catch {
      return false;
    }
  };

  // --- Server status check ---
  const checkServerStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/status`);
      const data = await res.json();
      setIsServerRunning(data.running);
      setStatus(data.running ? "running" : "stopped");
      if (data.running) reconnectLogs();
    } catch {
      setIsServerRunning(false);
      setStatus("stopped");
    }
  };

  // --- Start server ---
  const startServer = async (file?: string) => {
    try {
      const batchToUse = file || batchFile;
      if (!batchToUse.trim()) {
        addLog("[Error] Please provide a valid batch file path!", "system");
        alert("Please enter your .bat file path!");
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
        body: JSON.stringify({ batchFile: batchToUse, autoRestart }),
      });
      const startData = await startRes.json();
      if (startData.error) {
        addLog(`[Error] ${startData.error}`, "server");
        setStatus("error");
        return;
      }

      setIsServerRunning(true);
      setUptime(0);
      setStatus("running");
      reconnectLogs();
    } catch (err: any) {
      console.error(err);
      addLog(`[Error] Failed to start server: ${err.message || err}`, "system");
      setIsServerRunning(false);
      setStatus("error");
    }
  };

  // --- Stop server ---
  const stopServer = async () => {
    try {
      const res = await fetch(`${API_BASE}/stop`, { method: "POST" });
      const data = await res.json();
      if (data.error) addLog(`[Error] ${data.error}`, "system");
      else addLog("[System] Server stopped manually.", "system");

      setIsServerRunning(false);
      setStatus("stopped");
      setUptime(0);

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
        setStatus("stopped");
        setUptime(0);

        if (autoRestart) setRestartCountdown(AUTO_RESTART_DELAY);

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
          <h2>Select Project Zomboid .bat File</h2>
          <input
            type="text"
            placeholder="C:\\path\\server.bat"
            value={batchFile}
            onChange={(e) => setBatchFile(e.target.value)}
          />
          {recentBatches.length > 0 && (
            <div className="recent-batches">
              <h4>Most Recent Batches</h4>
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
          <label>
            <input
              type="checkbox"
              checked={autoRestart}
              onChange={(e) => setAutoRestart(e.target.checked)}
            />{" "}
            Auto-Restart on Crash
          </label>
          <button
            className="confirm-btn"
            onClick={() => {
              if (!batchFile) return alert("Batch path required");
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
        <div className={`status ${status}`}>
          ● {status.charAt(0).toUpperCase() + status.slice(1)}
          {isServerRunning &&
            ` | Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor(
              (uptime % 3600) / 60
            )}m ${uptime % 60}s`}
          {restartCountdown !== null && ` | Restart in: ${restartCountdown}s`}
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
        {(["system", "server"] as const).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
        <select
          onChange={(e) => {
            if (e.target.value) {
              sendCommand(e.target.value);
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
          placeholder="Server command..."
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
