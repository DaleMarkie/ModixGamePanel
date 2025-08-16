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

const Terminal: React.FC = () => {
  const [status, setStatus] = useState("Please start the server");
  const [logs, setLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem("pz-logs");
    return saved ? JSON.parse(saved) : ["[System] Terminal ready."];
  });
  const [command, setCommand] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [showFilePathPopup, setShowFilePathPopup] = useState(false); // <-- new
  const eventSourceRef = useRef<EventSource | null>(null);

  const addLog = (text: string, includeTimestamp = true) => {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = includeTimestamp ? `[${timestamp}] ${text}` : text;
    setLogs((prev) => {
      const updated = [...prev, formatted].slice(-500);
      localStorage.setItem("pz-logs", JSON.stringify(updated));
      return updated;
    });
  };

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
      addLog("ERROR: Failed to fetch server stats", false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const startServerStream = async () => {
    if (eventSourceRef.current) eventSourceRef.current.close();

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

        // Show popup if server start failed due to missing files
        if (
          errorData.error?.includes("path") ||
          errorData.error?.includes("files")
        ) {
          setShowFilePathPopup(true);
        }

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
    } catch {
      addLog("[Error] Could not start server.");
      setStatus("Failed to start server.");
      setShowFilePathPopup(true); // <-- show popup on catch error
    }
  };

  const handleCommand = async (cmd: string) => {
    switch (cmd.toLowerCase()) {
      case "start":
        if (isServerRunning) return addLog("[System] Server already running.");
        await startServerStream();
        break;
      case "stop":
        if (!isServerRunning) return addLog("[System] Server is not running.");
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
        setTimeout(startServerStream, 1500);
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
    if (!command.trim()) return;
    addLog(`> ${command}`);
    handleCommand(command.trim());
    setCommand("");
  };

  const handleClear = () => {
    localStorage.removeItem("pz-logs");
    setLogs([]);
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join("\n")).then(
      () => alert("Logs copied!"),
      () => alert("Failed to copy logs.")
    );
  };

  const filteredLogs = logs.filter((log) =>
    log.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="boxed-container">
      <div className="terminal-layout">
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
            {filteredLogs.length ? (
              filteredLogs.map((log, index) => (
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
            <button type="button" onClick={handleClear}>
              Clear
            </button>
            <button type="button" onClick={handleCopyLogs}>
              Copy Logs
            </button>
          </form>
        </div>
      </div>

      {/* --- File Path Popup --- */}
      {showFilePathPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>⚠ Project Zomboid Files Missing</h2>

            <p>
              The server cannot start because it cannot locate your Project
              Zomboid game files.
            </p>

            <div className="popup-section">
              <h3>For New Users:</h3>
              <ol>
                <li>
                  Ensure you have downloaded Project Zomboid and its server
                  files.
                </li>
                <li>
                  Verify that the files are placed in a folder accessible by the
                  server.
                </li>
                <li>
                  Default example path on Linux:
                  <br />
                  <strong>/home/user/ProjectZomboidServer/</strong>
                </li>
              </ol>
            </div>

            <div className="popup-section">
              <h3>For Advanced Users:</h3>
              <ul>
                <li>
                  Check file permissions — the server must have read/write
                  access.
                </li>
                <li>
                  If using Docker, ensure the host folder is mapped correctly
                  into the container.
                </li>
                <li>
                  Confirm that the `server.ini` or configuration points to the
                  correct path.
                </li>
                <li>Check server logs for any "file not found" errors.</li>
              </ul>
            </div>

            <button onClick={() => setShowFilePathPopup(false)}>Close</button>
          </div>
        </div>
      )}
      {/* --- File Path Popup --- */}
      {showFilePathPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>⚠ Project Zomboid Files Missing</h2>

            <p>
              The server cannot start because it cannot locate your Project
              Zomboid game files.
            </p>

            <div className="popup-section">
              <h3>For New Users:</h3>
              <ol>
                <li>
                  Ensure you have downloaded Project Zomboid and its server
                  files.
                </li>
                <li>
                  Verify that the files are placed in a folder accessible by the
                  server.
                </li>
                <li>
                  Default example path on Linux:
                  <br />
                  <strong>/home/user/ProjectZomboidServer/</strong>
                </li>
              </ol>
            </div>

            <div className="popup-section">
              <h3>For Advanced Users:</h3>
              <ul>
                <li>
                  Check file permissions — the server must have read/write
                  access.
                </li>
                <li>
                  Confirm that the `server.ini` or configuration points to the
                  correct path.
                </li>
                <li>Check server logs for any "file not found" errors.</li>
              </ul>
            </div>

            <button onClick={() => setShowFilePathPopup(false)}>Close</button>
          </div>
        </div>
      )}
      {/* --- File Path Popup --- */}
      {showFilePathPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>⚠ Project Zomboid Files Missing</h2>

            <p>
              The server cannot start because it cannot locate your Project
              Zomboid game files.
            </p>

            <div className="popup-section">
              <h3>For New Users:</h3>
              <ol>
                <li>
                  Ensure you have downloaded SteamCMD for Linux:{" "}
                  <code>https://developer.valvesoftware.com/wiki/SteamCMD</code>
                </li>
                <li>
                  Open a terminal and navigate to the folder where SteamCMD is
                  located:
                </li>
                <pre>
                  <code>cd ~/steamcmd</code>
                </pre>
                <li>Login anonymously to SteamCMD:</li>
                <pre>
                  <code>./steamcmd.sh +login anonymous</code>
                </pre>
                <li>
                  Install the Project Zomboid server files to your desired
                  folder:
                </li>
                <pre>
                  <code>force_install_dir ~/ProjectZomboidServer/</code>
                </pre>
                <pre>
                  <code>app_update 380870 validate</code>
                </pre>
                <li>Exit SteamCMD:</li>
                <pre>
                  <code>quit</code>
                </pre>
              </ol>
            </div>

            <div className="popup-section">
              <h3>For Advanced Users:</h3>
              <ul>
                <li>
                  Ensure the server folder has proper read/write permissions:{" "}
                  <code>chmod -R 755 ~/ProjectZomboidServer/</code>
                </li>
                <li>
                  Verify that your `server.ini` configuration points to the
                  correct installation path.
                </li>
                <li>Check server logs for any "file not found" errors.</li>
              </ul>
            </div>

            <button onClick={() => setShowFilePathPopup(false)}>Close</button>
          </div>
        </div>
      )}
      {/* --- Project Zomboid Files Missing Popup --- */}
      {showFilePathPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>⚠ Project Zomboid Files Missing</h2>

            <p>
              Your server cannot start because it cannot find the Project
              Zomboid game files. Please follow the instructions below to
              install them on Linux.
            </p>

            <div className="popup-section">
              <h3>💡 For New Users</h3>
              <p>Use SteamCMD to download and install the server files:</p>
              <ol>
                <li>
                  Download SteamCMD:{" "}
                  <a
                    href="https://developer.valvesoftware.com/wiki/SteamCMD"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    SteamCMD Linux
                  </a>
                </li>
                <li>
                  Open a terminal and navigate to SteamCMD folder:
                  <pre>
                    <code>cd ~/steamcmd</code>
                  </pre>
                </li>
                <li>
                  Login anonymously:
                  <pre>
                    <code>./steamcmd.sh +login anonymous</code>
                  </pre>
                </li>
                <li>
                  Set install directory:
                  <pre>
                    <code>force_install_dir ~/ProjectZomboidServer/</code>
                  </pre>
                </li>
                <li>
                  Download server files:
                  <pre>
                    <code>app_update 380870 validate</code>
                  </pre>
                </li>
                <li>
                  Exit SteamCMD:
                  <pre>
                    <code>quit</code>
                  </pre>
                </li>
              </ol>
            </div>

            <div className="popup-section">
              <h3>⚙ For Advanced Users</h3>
              <ul>
                <li>
                  Ensure the server folder has proper permissions:
                  <pre>
                    <code>chmod -R 755 ~/ProjectZomboidServer/</code>
                  </pre>
                </li>
                <li>
                  Double-check your <code>server.ini</code> configuration points
                  to the correct path.
                </li>
                <li>
                  Check logs for missing file errors and ensure the install path
                  is consistent.
                </li>
              </ul>
            </div>

            <button onClick={() => setShowFilePathPopup(false)}>Close</button>
          </div>
        </div>
      )}
      {/* --- Project Zomboid Files Missing Popup --- */}
      {showFilePathPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>⚠ Project Zomboid Files Missing</h2>

            <p>
              this popup only means that Modix cannot locate your Project
              Zomboid server files at the path it expects. Nothing else is
              broken yet; the server just won’t start until the files exist in
              the correct location.
            </p>

            <div className="popup-section">
              <h3>💡 For New Users</h3>
              <p>Use SteamCMD to download and install the server files:</p>
              <ol>
                <li>
                  Download SteamCMD:{" "}
                  <a
                    href="https://developer.valvesoftware.com/wiki/SteamCMD"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    SteamCMD Linux
                  </a>
                </li>
                <li>
                  Open a terminal and navigate to SteamCMD folder:
                  <pre>
                    <code>cd ~/steamcmd</code>
                  </pre>
                </li>
                <li>
                  Login anonymously:
                  <pre>
                    <code>./steamcmd.sh +login anonymous</code>
                  </pre>
                </li>
                <li>
                  Set install directory:
                  <pre>
                    <code>force_install_dir ~/ProjectZomboidServer/</code>
                  </pre>
                </li>
                <li>
                  Download server files:
                  <pre>
                    <code>app_update 380870 validate</code>
                  </pre>
                </li>
                <li>
                  Exit SteamCMD:
                  <pre>
                    <code>quit</code>
                  </pre>
                </li>
              </ol>
            </div>

            <div className="popup-section">
              <h3>⚙ For Advanced Users</h3>
              <ul>
                <li>
                  Ensure the server folder has proper permissions:
                  <pre>
                    <code>chmod -R 755 ~/ProjectZomboidServer/</code>
                  </pre>
                </li>
                <li>
                  Double-check your <code>server.ini</code> configuration points
                  to the correct path.
                </li>
                <li>
                  Check logs for missing file errors and ensure the install path
                  is consistent.
                </li>
              </ul>
            </div>

            <button onClick={() => setShowFilePathPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Terminal;
