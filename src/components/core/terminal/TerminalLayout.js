import React, { useState, useEffect, useRef } from "react";
import "./TerminalLayout.css";

const API_BASE = "http://localhost:2010/api";

const TerminalLayout = () => {
  const [status, setStatus] = useState("Please start the server");
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem("pz-logs");
    return saved ? JSON.parse(saved) : ["[System] Terminal ready."];
  });
  const [command, setCommand] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [memory, setMemory] = useState({ used: 2.5, total: 8 });
  const [lowMemoryWarning, setLowMemoryWarning] = useState(false);
  const [serverStats, setServerStats] = useState(null);
  const [isServerRunning, setIsServerRunning] = useState(false);
  const eventSourceRef = useRef(null);

  const addLog = (text, includeTimestamp = true) => {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = includeTimestamp ? `[${timestamp}] ${text}` : text;
    setLogs((prev) => {
      const updated = [...prev, formatted];
      localStorage.setItem("pz-logs", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    setLowMemoryWarning(memory.used / memory.total >= 0.8);
  }, [memory]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/server-stats`);
        const data = await res.json();
        setServerStats(data);
        setMemory({ used: data.ramUsed, total: data.ramTotal });
        setIsServerRunning(data.status === "running");
        setStatus(data.status === "running" ? "Server is running" : "Server stopped");
      } catch {
        addLog("ERROR [102] Your frontend is not connecting to the server... close and restart Modix or contact us on our discord for support.", false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const startServerStream = async () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStatus("Starting server...");
    addLog("[System] Starting Project Zomboid server...");

    try {
      const response = await fetch(`${API_BASE}/start-server`, { method: "POST" });

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
    } catch (err) {
      addLog("[Error] Could not start server.");
      setStatus("Failed to start server.");
    }
  };

  const handleCommand = async (cmd) => {
    switch (cmd.toLowerCase()) {
      case "start":
        if (isServerRunning) {
          addLog("[System] Server already running.");
          return;
        }
        await startServerStream();
        break;
      case "stop":
        if (!isServerRunning) {
          addLog("[System] Server is not running.");
          return;
        }
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
        setTimeout(() => {
          startServerStream();
        }, 1500);
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

  const submitCommand = (e) => {
    e.preventDefault();
    if (command.trim()) {
      addLog(`> ${command}`);
      handleCommand(command.trim());
      setCommand("");
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    localStorage.removeItem("pz-logs");
    setLogs([]);
  };

  const handleCopyLogs = (e) => {
    e.preventDefault();
    const text = logs.join("\n");
    navigator.clipboard.writeText(text)
      .then(() => alert("Logs copied!"))
      .catch(() => alert("Failed to copy logs."));
  };

  const filteredLogs = logs.filter((log) =>
    log.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="boxed-container">

      {lowMemoryWarning && (
        <div className="warning-banner">
          <p>⚠️ Warning: Low memory usage detected! Consider freeing up memory.</p>
        </div>
      )}

      <div className="terminal-layout">

        <div className="side-boxes left">
          <div className="info-box"><h3>🌐 IP</h3><p>{serverStats?.ip || "..."}</p></div>
          <div className="info-box"><h3>📦 Port</h3><p>{serverStats?.port || "..."}</p></div>
          <div className="info-box"><h3>📊 CPU</h3><p>{serverStats ? `${serverStats.cpu}%` : "..."}</p></div>
          <div className="info-box"><h3>🧠 RAM</h3><p>{serverStats ? `${serverStats.ramUsed} / ${serverStats.ramTotal} GB` : "..."}</p></div>
          <div className="info-box"><h3>💽 Storage</h3><p>{serverStats ? `${serverStats.storageUsed} / ${serverStats.storageTotal} GB` : "..."}</p></div>
        </div>

        {/* MAIN TERMINAL + CONTROLS SECTION */}
        <div className="terminal-wrapper">
          <header className="terminal-header-box">
            <div className={`status ${status.toLowerCase().replace(/\s+/g, "-")}`}>● {status}</div>
            <div className="controls">
              <button onClick={() => handleCommand("start")} disabled={isServerRunning}>Start</button>
              <button onClick={() => handleCommand("restart")} disabled={!isServerRunning}>Restart</button>
              <button onClick={() => handleCommand("stop")} disabled={!isServerRunning}>Stop</button>
              <button onClick={() => handleCommand("shutdown")} disabled={!isServerRunning}>Shutdown</button>
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
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <pre key={index} className="terminal-log">{log}</pre>
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
            <button onClick={handleClear}>Clear</button>
            <button onClick={handleCopyLogs}>Copy Logs</button>
          </form>
        </div>

        <div className="side-boxes right">
          <div className="info-box"><h3>📢 Alerts</h3><p>{serverStats?.serverAlerts || "..."}</p></div>
          
          <div className="info-box"><h3>🔧 Version</h3><p>{serverStats?.version || "..."}</p></div>
        </div>
      </div>

      {/* NEW SEPARATE SECTION BELOW terminal-layout */}
      <section className="server-health-section">
  <h2>🩺 Server Health Overview</h2>
  <div className="server-health-grid">
    <div className="health-item"><strong>Uptime:</strong> {serverStats?.uptime || "N/A"}</div>
    <div className="health-item"><strong>Downtime:</strong> {serverStats?.downtime || "N/A"}</div>
    <div className="health-item"><strong>Status:</strong> {serverStats?.healthStatus || "Unknown"}</div>
    <div className="health-item"><strong>CPU Load:</strong> {serverStats?.cpu ? `${serverStats.cpu.toFixed(1)}%` : "N/A"}</div>
    <div className="health-item">
      <strong>Memory Usage:</strong>{" "}
      {serverStats ? `${serverStats.ramUsed.toFixed(2)} / ${serverStats.ramTotal.toFixed(2)} GB` : "N/A"}
    </div>
    <div className="health-item">
      <strong>Storage Usage:</strong>{" "}
      {serverStats ? `${serverStats.storageUsed.toFixed(2)} / ${serverStats.storageTotal.toFixed(2)} GB` : "N/A"}
    </div>
  </div>
</section>
      
    </div>
  );
};

export default TerminalLayout;
