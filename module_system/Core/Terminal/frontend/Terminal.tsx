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

type TabType = "system" | "server" | "install";

const Terminal: React.FC = () => {
  const [status, setStatus] = useState("Please start the server");
  const [logsByTab, setLogsByTab] = useState<Record<TabType, string[]>>(() => {
    const saved = localStorage.getItem("pz-logs-tabs");
    return saved
      ? JSON.parse(saved)
      : {
          system: ["[System] System terminal ready."],
          server: ["[System] Server terminal ready."],
          install: ["[System] Installer terminal ready."],
        };
  });
  const [activeTab, setActiveTab] = useState<TabType>("system");
  const [command, setCommand] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [serverCrashed, setServerCrashed] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // --- Add a log to a tab ---
  const addLog = (
    text: string,
    tab: TabType = "system",
    includeTimestamp = true
  ) => {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = includeTimestamp ? `[${timestamp}] ${text}` : text;

    setLogsByTab((prev) => {
      const updated = {
        ...prev,
        [tab]: [...prev[tab], formatted].slice(-500),
      };
      localStorage.setItem("pz-logs-tabs", JSON.stringify(updated));
      return updated;
    });
  };

  // --- Fetch server stats ---
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

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- Start server and stream logs ---
  const startServerStream = async () => {
    if (eventSourceRef.current) eventSourceRef.current.close();

    setStatus("Starting server...");
    addLog("[System] Starting Project Zomboid server...", "server");

    try {
      const response = await fetch(`${API_BASE}/start-server`, {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json();
        addLog(`[Error] ${errorData.error || "Server start failed"}`, "server");
        setStatus("Failed to start server.");
        return;
      }

      const es = new EventSource(`${API_BASE}/server-logs-stream`);
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        if (e.data === "[Process finished]") {
          addLog("[System] Server process finished.", "server");
          setStatus("Server stopped.");
          setIsServerRunning(false);
          setActiveTab("system");
          setServerCrashed(true);
          alert("❌ Server crashed or stopped unexpectedly!");
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
        setActiveTab("system");
        if (!serverCrashed) {
          setServerCrashed(true);
          alert("❌ Server crashed or lost connection!");
        }
        if (eventSourceRef.current) eventSourceRef.current.close();
        eventSourceRef.current = null;
      };

      setStatus("Server is running");
      setIsServerRunning(true);
      setActiveTab("server");
      setServerCrashed(false);
    } catch {
      addLog("[Error] Could not start server.", "server");
      setStatus("Failed to start server.");
    }
  };

  // --- Install server ---
  const installServer = async () => {
    if (installing) return;
    setInstalling(true);
    addLog(
      "[System] Installing Project Zomboid server (this may take several minutes)...",
      "install"
    );

    try {
      const res = await fetch(`${API_BASE}/install-server`, { method: "POST" });
      if (!res.ok) {
        addLog("[Error] Install failed to start.", "install");
        alert("❌ Install failed to start.");
        setInstalling(false);
        return;
      }

      const es = new EventSource(`${API_BASE}/install-logs`);
      es.onmessage = (e) => {
        addLog(e.data, "install", false);
        if (e.data.includes("[Install finished]")) {
          es.close();
          addLog(
            "[System] Install complete. Auto-starting server...",
            "install"
          );
          setInstalling(false);
          startServerStream();
        }
      };
      es.onerror = () => {
        addLog("[Error] Lost connection to installer logs.", "install");
        es.close();
        setInstalling(false);
      };
    } catch (err) {
      addLog("[Error] Install request failed.", "install");
      alert("❌ Could not reach backend installer.");
      setInstalling(false);
    }
  };

  // --- Command handler ---
  const handleCommand = async (cmd: string) => {
    const lc = cmd.toLowerCase();
    if (lc === "start") {
      if (isServerRunning)
        return addLog("[System] Server already running.", "system");
      return startServerStream();
    }
    if (lc === "stop") {
      if (!isServerRunning)
        return addLog("[System] Server is not running.", "system");
      if (eventSourceRef.current) eventSourceRef.current.close();
      try {
        await fetch(`${API_BASE}/shutdown-server`, { method: "POST" });
        addLog("[System] Server stopped.", "server");
        setStatus("Server stopped.");
        setIsServerRunning(false);
        setActiveTab("system");
      } catch {
        addLog("[Error] Failed to stop server.", "system");
      }
      return;
    }
    if (lc === "restart") {
      addLog("[System] Restarting server...", "system");
      setStatus("Restarting server...");
      if (eventSourceRef.current) eventSourceRef.current.close();
      try {
        await fetch(`${API_BASE}/shutdown-server`, { method: "POST" });
        addLog("[System] Server shutdown completed.", "system");
      } catch {
        addLog("[Error] Restart failed during shutdown.", "system");
      }
      setTimeout(startServerStream, 1500);
      return;
    }
    if (lc === "shutdown") {
      addLog("[System] Shutting down server...", "system");
      setStatus("Shutting down server...");
      if (eventSourceRef.current) eventSourceRef.current.close();
      try {
        await fetch(`${API_BASE}/shutdown-server`, { method: "POST" });
        addLog("[System] Server has been shut down.", "system");
        setStatus("Server has been shut down.");
        setIsServerRunning(false);
        setActiveTab("system");
      } catch {
        addLog("[Error] Failed to shut down server.", "system");
      }
      return;
    }
  };

  // --- Submit command from input ---
  const submitCommand = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!command.trim()) return;
    addLog(`> ${command}`, "system");
    handleCommand(command.trim());
    setCommand("");
  };

  // --- Utility actions ---
  const handleClear = () => {
    setLogsByTab((prev) => {
      const updated = { ...prev, [activeTab]: [] };
      localStorage.setItem("pz-logs-tabs", JSON.stringify(updated));
      return updated;
    });
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logsByTab[activeTab].join("\n")).then(
      () => alert("Logs copied!"),
      () => alert("Failed to copy logs.")
    );
  };

  // --- Filter logs by search ---
  const filteredLogs = logsByTab[activeTab].filter((log) =>
    log.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Parse logs into parts ---
  const parseLog = (log: string) => {
    const match = log.match(/^(\[[0-9: ]+[APM]*\])?\s*(\[[^\]]+\])?(.*)$/i);
    if (match) {
      const [, timestamp, tag, rest] = match;
      return { timestamp: timestamp || "", tag: tag || "", rest: rest || "" };
    }
    return { timestamp: "", tag: "", rest: log };
  };

  // --- Color classes ---
  const getTagClass = (tag: string) => {
    if (!tag) return "log-default";
    if (tag.toLowerCase().includes("error")) return "log-error";
    if (tag.toLowerCase().includes("system")) return "log-system";
    if (tag.toLowerCase().includes("install")) return "log-install";
    if (tag.trim().startsWith(">")) return "log-command";
    return "log-default";
  };

  return (
    <div className="terminal-layout">
      {/* --- Header --- */}
      <header className="terminal-header-box">
        <div className={`status ${status.toLowerCase().replace(/\s+/g, "-")}`}>
          ● {status}
          {serverCrashed && <span className="crash-indicator"> ● CRASHED</span>}
        </div>
        <div className="controls">
          <button onClick={installServer} disabled={installing}>
            {installing ? "Installing..." : "Install Server"}
          </button>
          <button
            onClick={() => startServerStream()}
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

      {/* --- Tabs --- */}
      <div className="terminal-tabs">
        {(["system", "server", "install"] as TabType[]).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Logs
          </button>
        ))}
      </div>

      {/* --- Logs --- */}
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

      {/* --- Command Input --- */}
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
