"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import "./terminal.css";

const API_BASE = "http://localhost:2010/api";

interface ServerStats {
  ramUsed?: number;
  ramTotal?: number;
  cpu?: number;
  swapUsed?: number;
  storageUsed?: number;
  storageTotal?: number;
  ip?: string;
  port?: string | number;
  status?: string;
  uptime?: string;
  downtime?: string;
  healthStatus?: string;
  serverPid?: string | number;
  timezone?: string;
  location?: string;
  lastCheck?: string;
  serverAlerts?: string;
  version?: string;
  diskRead?: string | number;
  diskWrite?: string | number;
  fsHealth?: string;
  netIn?: string | number;
  netOut?: string | number;
  ping?: string | number;
  firewallStatus?: string;
  processCount?: string | number;
  topProcess?: string;
  loadAvg?: string | number;
  dockerRunning?: boolean;
  serviceStatus?: string;
}

const Terminal = () => {
  const [status, setStatus] = useState("Please start the server");
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem("pz-logs");
    return saved ? JSON.parse(saved) : ["[System] Terminal ready."];
  });
  const [command, setCommand] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [memory, setMemory] = useState({ used: 2.5, total: 8 });
  const [lowMemoryWarning, setLowMemoryWarning] = useState(false);
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [isServerRunning, setIsServerRunning] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const addLog = (text: string, includeTimestamp: boolean = true) => {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = includeTimestamp ? `[${timestamp}] ${text}` : text;
    setLogs((prev: string[]) => {
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
        setStatus(
          data.status === "running" ? "Server is running" : "Server stopped"
        );
      } catch {
        addLog("ERROR", false);
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
    } catch (err) {
      addLog("[Error] Could not start server.");
      setStatus("Failed to start server.");
    }
  };

  const handleCommand = async (cmd: string) => {
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

  const submitCommand = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (command.trim()) {
      addLog(`> ${command}`);
      handleCommand(command.trim());
      setCommand("");
    }
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    localStorage.removeItem("pz-logs");
    setLogs([]);
  };

  const handleCopyLogs = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const text = logs.join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Logs copied!"))
      .catch(() => alert("Failed to copy logs."));
  };

  const filteredLogs = logs.filter((log: string) =>
    log.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="boxed-container">
      {lowMemoryWarning && (
        <div className="warning-banner">
          <p>
            ⚠️ Warning: Low memory usage detected! Consider freeing up memory.
          </p>
        </div>
      )}

      <div className="terminal-layout">
        <div className="side-boxes left">
          <div className="info-box">
            <h3>🌐 IP</h3>
            <p>{serverStats?.ip || "..."}</p>
          </div>
          <div className="info-box">
            <h3>📦 Port</h3>
            <p>{serverStats?.port || "..."}</p>
          </div>
          <div className="info-box">
            <h3>📊 CPU</h3>
            <p>{
              typeof serverStats?.cpu === "number"
                ? `${serverStats.cpu.toFixed(1)}%`
                : serverStats?.cpu
                ? `${serverStats.cpu}`
                : "..."
            }</p>
          </div>
          <div className="info-box">
            <h3>🧠 RAM</h3>
            <p>
              {typeof serverStats?.ramUsed === "number" && typeof serverStats?.ramTotal === "number"
                ? `${serverStats.ramUsed.toFixed(2)} / ${serverStats.ramTotal.toFixed(2)} GB`
                : serverStats?.ramUsed && serverStats?.ramTotal
                ? `${serverStats.ramUsed} / ${serverStats.ramTotal} GB`
                : "..."}
            </p>
          </div>
          <div className="info-box">
            <h3>💽 Storage</h3>
            <p>
              {typeof serverStats?.storageUsed === "number" && typeof serverStats?.storageTotal === "number"
                ? `${serverStats.storageUsed.toFixed(2)} / ${serverStats.storageTotal.toFixed(2)} GB`
                : serverStats?.storageUsed && serverStats?.storageTotal
                ? `${serverStats.storageUsed} / ${serverStats.storageTotal} GB`
                : "..."}
            </p>
          </div>
        </div>

        {/* MAIN TERMINAL + CONTROLS SECTION */}
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
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log: string, index: number) => (
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
            <button onClick={handleClear}>Clear</button>
            <button onClick={handleCopyLogs}>Copy Logs</button>
          </form>
        </div>

        <div className="side-boxes right">
          <div className="info-box">
            <h3>📢 Alerts</h3>
            <p>{serverStats?.serverAlerts || "..."}</p>
          </div>

          <div className="info-box">
            <h3>🔧 Version</h3>
            <p>{serverStats?.version || "..."}</p>
          </div>
        </div>
      </div>

      {/* NEW SEPARATE SECTION BELOW terminal-layout */}
      <section className="server-health-section">
        <h2>
          <span>🩺</span> System Overview
        </h2>

        <div className="server-health-grid">
          {/* System Metrics */}
          <div className="health-category system-metrics">
            <h3 className="flex items-center gap-2 text-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L15 12m0 0l-5.25-5m5.25 5H3"
                />
              </svg>
              System Metrics
            </h3>
            <div>
              <strong>Uptime:</strong> {serverStats?.uptime || "N/A"}
            </div>
            <div>
              <strong>Downtime:</strong> {serverStats?.downtime || "N/A"}
            </div>
            <div>
              <strong>Status:</strong>{" "}
              <span
                className={`font-bold ${
                  serverStats?.healthStatus === "Healthy"
                    ? "text-green-400"
                    : "text-red-500"
                }`}
              >
                {serverStats?.healthStatus || "Unknown"}
              </span>
            </div>
            <div>
              <strong>CPU Load:</strong>{" "}
              {typeof serverStats?.cpu === "number"
                ? `${serverStats.cpu.toFixed(1)}%`
                : serverStats?.cpu
                ? `${serverStats.cpu}`
                : "N/A"}
            </div>
            <div>
              <strong>Memory Usage:</strong>{" "}
              {typeof serverStats?.ramUsed === "number" && typeof serverStats?.ramTotal === "number"
                ? `${serverStats.ramUsed.toFixed(2)} / ${serverStats.ramTotal.toFixed(2)} GB`
                : serverStats?.ramUsed && serverStats?.ramTotal
                ? `${serverStats.ramUsed} / ${serverStats.ramTotal} GB`
                : "N/A"}
            </div>
            <div>
              <strong>Swap Usage:</strong>{" "}
              {serverStats?.swapUsed ? `${serverStats.swapUsed} MB` : "N/A"}
            </div>
          </div>

          {/* Storage & Disk */}
          <div className="health-category">
            <h3 className="flex items-center gap-2 text-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v4a4 4 0 004 4h10a4 4 0 004-4V7M5 3v2m14-2v2m-7 10v2m-4-2v2m12-2v2"
                />
              </svg>
              Storage & Disk
            </h3>
            <div>
              <strong>Storage Usage:</strong>{" "}
              {typeof serverStats?.storageUsed === "number" && typeof serverStats?.storageTotal === "number"
                ? `${serverStats.storageUsed.toFixed(2)} / ${serverStats.storageTotal.toFixed(2)} GB`
                : serverStats?.storageUsed && serverStats?.storageTotal
                ? `${serverStats.storageUsed} / ${serverStats.storageTotal} GB`
                : "N/A"}
            </div>
            <div>
              <strong>Disk I/O Read:</strong> {serverStats?.diskRead || "N/A"}
            </div>
            <div>
              <strong>Disk I/O Write:</strong> {serverStats?.diskWrite || "N/A"}
            </div>
            <div>
              <strong>Filesystem Health:</strong>{" "}
              {serverStats?.fsHealth || "OK"}
            </div>
          </div>

          {/* Network */}
          <div className="health-category">
            <h3 className="flex items-center gap-2 text-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Network
            </h3>
            <div>
              <strong>Inbound Traffic:</strong> {serverStats?.netIn || "N/A"}
            </div>
            <div>
              <strong>Outbound Traffic:</strong> {serverStats?.netOut || "N/A"}
            </div>
            <div>
              <strong>Ping (ms):</strong> {serverStats?.ping || "N/A"}
            </div>
            <div>
              <strong>Firewall Status:</strong>{" "}
              {serverStats?.firewallStatus || "Unknown"}
            </div>
          </div>

          {/* Processes */}
          <div className="health-category">
            <h3 className="flex items-center gap-2 text-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 01-8 0m0 0v1a4 4 0 008 0V7zM12 14a4 4 0 01-4 4m0 0a4 4 0 008 0m-8 0v-1a4 4 0 008 0v1"
                />
              </svg>
              Processes
            </h3>
            <div>
              <strong>Active Processes:</strong>{" "}
              {serverStats?.processCount || "N/A"}
            </div>
            <div>
              <strong>Top Process:</strong> {serverStats?.topProcess || "N/A"}
            </div>
            <div>
              <strong>Load Average:</strong> {serverStats?.loadAvg || "N/A"}
            </div>
          </div>

          {/* Services & Platform */}
          <div className="health-category">
            <h3 className="flex items-center gap-2 text-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L15 12m0 0l-5.25-5m5.25 5H3"
                />
              </svg>
              Services & Platform
            </h3>
            <div>
              <strong>Docker Running:</strong>{" "}
              {serverStats?.dockerRunning ? (
                <span className="text-green-400 font-semibold">Yes</span>
              ) : (
                <span className="text-red-500 font-semibold">No</span>
              )}
            </div>
            <div>
              <strong>Service Status:</strong>{" "}
              {serverStats?.serviceStatus || "N/A"}
            </div>
            <div>
              <strong>Game Server PID:</strong>{" "}
              {serverStats?.serverPid || "N/A"}
            </div>
          </div>

          {/* Miscellaneous */}
          <div className="health-category">
            <h3 className="flex items-center gap-2 text-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Miscellaneous
            </h3>
            <div>
              <strong>Timezone:</strong> {serverStats?.timezone || "N/A"}
            </div>
            <div>
              <strong>Server Location:</strong>{" "}
              {serverStats?.location || "Unknown"}
            </div>
            <div>
              <strong>Last Checked:</strong> {serverStats?.lastCheck || "N/A"}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terminal;
