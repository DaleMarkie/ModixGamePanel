import React, { useState, useEffect, useRef } from "react";
import "./terminal.css";

interface ServerStats {
  ramUsed?: number;
  ramTotal?: number;
  cpu?: number;
  status?: string;
  uptime?: string;
}

type TabType = "server" | "system";

interface ServerOptions {
  os: "linux" | "windows";
  customPath?: string;
}

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

const Terminal: React.FC = () => {
  const [status, setStatus] = useState("Please start the server");
  const [logsByTab, setLogsByTab] = useState<Record<TabType, string[]>>(() => {
    const saved = localStorage.getItem("pz-logs-tabs");
    return saved
      ? JSON.parse(saved)
      : {
          server: ["[System] Server terminal ready."],
          system: ["[System] System terminal ready."],
        };
  });
  const [activeTab, setActiveTab] = useState<TabType>("server");
  const [command, setCommand] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [serverOptions, setServerOptions] = useState<ServerOptions>({
    os: "linux",
    customPath: "",
  });
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

      if (tab === "server" && text.startsWith("[Error]")) {
        updated.system = [...prev.system, formatted].slice(-MAX_LOGS);
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
    } catch {
      addLog("[Error] Failed to fetch server stats", "system", false);
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
    } catch {
      addLog("[Error] Could not reach backend API.", "system", false);
    }
  };

  useEffect(() => {
    setSelectedGame(localStorage.getItem("selectedGame") || "pz");
    testBackend();
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [API_BASE]);

  const startServerStream = async () => {
    eventSourceRef.current?.close();

    setStatus("Starting server...");
    addLog(`[System] Starting ${selectedGame} server...`, "server");

    try {
      const response = await fetch(`${API_BASE}/start-server`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serverOptions),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = `[Error] ${
          errorData.error || errorData.detail || "Could not start server."
        }`;
        addLog(msg, "server");
        addLog(msg, "system");
        setStatus("Failed to start server.");
        setIsServerRunning(false);
        return;
      }

      const es = new EventSource(`${API_BASE}/server-logs-stream`);
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        if (e.data === "[Process finished]") {
          addLog("[System] Server process finished.", "server");
          setStatus("Server stopped.");
          setIsServerRunning(false);
          es.close();
          eventSourceRef.current = null;
        } else {
          addLog(e.data, "server", false);
        }
      };

      es.onerror = () => {
        addLog("[Error] Server stream error or lost.", "server");
        setStatus("Connection lost.");
        setIsServerRunning(false);
        eventSourceRef.current?.close();
        eventSourceRef.current = null;
      };

      setStatus("Server is running");
      setIsServerRunning(true);
    } catch (err) {
      const msg = `[Error] Failed to contact backend: ${String(err)}`;
      addLog(msg, "server");
      addLog(msg, "system");
      setStatus("Failed to start server.");
    }
  };

  const sendBackendCommand = async (cmd: string) => {
    try {
      const res = await fetch(`${API_BASE}/send-command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        addLog(`[Error] ${err.error || "Command failed"}`, "system");
        return;
      }

      const data = await res.json();
      if (data.output) addLog(data.output, "system", false);
    } catch {
      addLog("[Error] Failed to send command to server.", "system");
    }
  };

  // --- Commands ---
  const handleCommand = async (cmd: string) => {
    const lc = cmd.toLowerCase();
    addLog(`> ${cmd}`, "system", true);

    switch (lc) {
      case "start":
        return isServerRunning
          ? addLog("[System] Server already running.", "system")
          : startServerStream();
      case "stop":
      case "shutdown":
        if (!isServerRunning)
          return addLog("[System] Server is not running.", "system");
        eventSourceRef.current?.close();
        try {
          await fetch(`${API_BASE}/shutdown-server`, { method: "POST" });
          addLog(`[System] Server ${lc}ped.`, "server");
          setStatus(`Server ${lc}ped.`);
          setIsServerRunning(false);
        } catch {
          addLog(`[Error] Failed to ${lc} server.`, "system");
        }
        return;
      case "restart":
        addLog("[System] Restarting server...", "system");
        setStatus("Restarting server...");
        eventSourceRef.current?.close();
        try {
          await fetch(`${API_BASE}/shutdown-server`, { method: "POST" });
          addLog("[System] Server shutdown completed.", "system");
        } catch {
          addLog("[Error] Restart failed during shutdown.", "system");
        }
        setTimeout(startServerStream, 1500);
        return;
      default:
        return sendBackendCommand(cmd);
    }
  };

  const submitCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
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

  const filteredLogs = logsByTab[activeTab].filter((log) =>
    log.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Render ---
  return (
    <div className="terminal-layout">
      {/* Header */}
      <header className="terminal-header-box">
        <div className={`status ${status.toLowerCase().replace(/\s+/g, "-")}`}>
          ● {status} <strong>({selectedGame})</strong>
        </div>
        <div className="controls">
          <select
            value={serverOptions.os}
            onChange={(e) =>
              setServerOptions({
                ...serverOptions,
                os: e.target.value as "linux" | "windows",
              })
            }
          >
            <option value="linux">Linux</option>
            <option value="windows">Windows</option>
          </select>
          <input
            type="text"
            placeholder="Custom server path (optional)"
            value={serverOptions.customPath}
            onChange={(e) =>
              setServerOptions({
                ...serverOptions,
                customPath: e.target.value,
              })
            }
          />

          {/* --- Controls --- */}
          <button onClick={startServerStream} disabled={isServerRunning}>
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

      {/* Tabs */}
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

      {/* Command Input */}
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
  );
};

export default Terminal;
