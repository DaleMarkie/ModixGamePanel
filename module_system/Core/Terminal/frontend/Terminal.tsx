import React, { useState, useEffect, useRef } from "react";
import "./terminal.css";
import Performance from "src/app/tools/performance/Performance";

interface ServerStats {
  ramUsed?: number;
  ramTotal?: number;
  cpu?: number;
  status?: string;
  uptime?: string;
}

type TabType = "server" | "system" | "chat" | "connections";

const MAX_LOGS = 500;

// --- Helper to resolve API base per selected game ---
const getApiBase = () => {
  const selectedGame = localStorage.getItem("selectedGame") || "pz";
  switch (selectedGame) {
    case "rimworld":
      return "http://localhost:2010/api/rimworld";
    case "pz":
    default:
      return "http://localhost:2010/api/projectzomboid";
  }
};

// --- Error helpers ---
const ERROR_DETAILS: Record<number, string> = {
  1: "Unknown game selected. Check your config or the game argument.",
  2: "Missing dependency. SteamCMD or required files are not installed.",
  3: "Update failed. Could not update the server via SteamCMD.",
  4: "Launch failed. The server binary/script failed to start.",
  5: "Port already in use. Another process is bound to the required port.",
};

const getDetailedError = (msg: string): string => {
  if (msg.includes("Failed to fetch")) {
    return "[Error] Could not reach backend API (possible causes: backend not running, wrong port, firewall, or CORS misconfiguration).";
  }
  if (msg.includes("ECONNREFUSED")) {
    return "[Error] Connection refused. Backend service is offline or crashed.";
  }
  if (msg.includes("CORS")) {
    return "[Error] CORS policy blocked request. Check backend headers.";
  }
  if (msg.includes("timeout")) {
    return "[Error] Request timed out. Backend may be hung or overloaded.";
  }
  return `[Error] ${msg}`;
};

const Terminal: React.FC = () => {
  const [status, setStatus] = useState("Please start the server");
  const [logsByTab, setLogsByTab] = useState<Record<TabType, string[]>>(() => {
    const saved = localStorage.getItem("pz-logs-tabs");
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      server: parsed.server || ["[System] Server terminal ready."],
      system: parsed.system || ["[System] System terminal ready."],
      chat: parsed.chat || ["[System] Chat logs ready."],
      connections: parsed.connections || ["[System] Connections log ready."],
    };
  });
  const [activeTab, setActiveTab] = useState<TabType>("server");
  const [command, setCommand] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>(
    localStorage.getItem("selectedGame") || "pz"
  );

  const eventSourceRef = useRef<EventSource | null>(null);

  const API_BASE = getApiBase();

  // --- Helpers ---
  const saveLogs = (updated: Record<TabType, string[]>) => {
    localStorage.setItem("pz-logs-tabs", JSON.stringify(updated));
    return updated;
  };

  const addLog = (
    text: string,
    tab: TabType = "server",
    includeTimestamp = true
  ) => {
    const formatted = includeTimestamp
      ? `[${new Date().toLocaleTimeString()}] ${text}`
      : text;

    setLogsByTab((prev) => {
      const updated = {
        ...prev,
        [tab]: [...prev[tab], formatted].slice(-MAX_LOGS),
      };

      // Mirror errors into system
      if (tab === "server" && text.startsWith("[Error]")) {
        updated.system = [...prev.system, formatted].slice(-MAX_LOGS);
      }

      // Capture chat logs
      if (tab === "server" && text.includes("[CHAT]")) {
        updated.chat = [...prev.chat, formatted].slice(-MAX_LOGS);
      }

      // Capture connection logs
      if (tab === "server" && text.includes("[CONNECTION]")) {
        updated.connections = [...prev.connections, formatted].slice(-MAX_LOGS);
      }

      return saveLogs(updated);
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

  // --- API calls ---
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/server-stats`);
      const data = await res.json();
      setServerStats(data);
      setIsServerRunning(data.status === "running");
      setStatus(
        data.status === "running" ? "Server is running" : "Server stopped"
      );
    } catch (err: any) {
      addLog(
        getDetailedError(err.message || "Failed to fetch server stats"),
        "system",
        false
      );
    }
  };

  const testBackend = async () => {
    try {
      const res = await fetch(`${API_BASE}/ping`);
      if (res.ok) {
        addLog(
          `[System] Backend for ${selectedGame} is online.`,
          "system",
          false
        );
      } else {
        addLog("[Error] Backend responded but not OK.", "system", false);
      }
    } catch (err: any) {
      addLog(
        getDetailedError(err.message || "Could not reach backend API"),
        "system",
        false
      );
    }
  };

  useEffect(() => {
    setSelectedGame(localStorage.getItem("selectedGame") || "pz");
    testBackend();
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [API_BASE]);

  const submitCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    // @ts-ignore
    handleCommand(command.trim());
    setCommand("");
  };

  const handleClear = () => {
    setLogsByTab((prev) => saveLogs({ ...prev, [activeTab]: [] }));
  };

  const handleCopyLogs = () =>
    navigator.clipboard.writeText(logsByTab[activeTab].join("\n")).then(
      () => alert("Logs copied!"),
      () => alert("Failed to copy logs.")
    );

  const filteredLogs =
    logsByTab[activeTab]?.filter((log) =>
      log.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // --- Render ---
  return (
    <div className="terminal-layout">
      {/* Header */}
      <header className="terminal-header-box">
        <div className={`status ${status.toLowerCase().replace(/\s+/g, "-")}`}>
          ● {status} <strong>({selectedGame})</strong>
        </div>
        <div className="controls">
          <button disabled={isServerRunning}>Start</button>
          <button disabled={!isServerRunning}>Restart</button>
          <button disabled={!isServerRunning}>Stop</button>
          <button disabled={!isServerRunning}>Shutdown</button>
          <input
            className="log-search"
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Tabs */}
      <div className="terminal-tabs">
        {(["system", "server", "chat", "connections"] as TabType[]).map(
          (tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "server"
                ? "Server"
                : tab === "system"
                ? "System"
                : tab === "chat"
                ? "Chat Logs"
                : "Connections"}
            </button>
          )
        )}
      </div>

      {/* Logs */}
      <div className="terminal-logs">
        {filteredLogs.length ? (
          filteredLogs.map((log, index) => {
            const { timestamp, tag, rest } = parseLog(log);
            return (
              <pre key={index} className="terminal-log">
                {timestamp && <span className="log-default">{timestamp} </span>}
                {tag && <span className={getTagClass(tag)}>{tag}</span>}
                <span className="log-default">{rest}</span>
              </pre>
            );
          })
        ) : (
          <p className="terminal-log no-results">No matching logs found.</p>
        )}
      </div>

      {/* Command Input (hidden only on Chat & Connections tabs) */}
      {activeTab !== "chat" && activeTab !== "connections" && (
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
      )}

      {/* Performance always below */}
      <Performance />
    </div>
  );
};

export default Terminal;
