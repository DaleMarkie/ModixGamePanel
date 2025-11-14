"use client";

import React, { useEffect, useState, useCallback } from "react";
import "./PortCheck.css"; // <-- import your fancy CSS here

interface ServerPort {
  name: string;
  port: number;
  status: "open" | "closed";
}

interface ApiResponse {
  servers: ServerPort[];
}

export default function GamePortChecker(): JSX.Element {
  const [servers, setServers] = useState<ServerPort[]>([]);
  const [host, setHost] = useState<string>("127.0.0.1");
  const [customPorts, setCustomPorts] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPorts = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        host,
        custom_ports: customPorts,
      }).toString();

      const res = await fetch(`/api/server/game-ports?${query}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: ApiResponse = await res.json();
      setServers(data.servers);
    } catch (error) {
      console.error("Failed to fetch ports:", error);
    } finally {
      setLoading(false);
    }
  }, [host, customPorts]);

  useEffect(() => {
    fetchPorts();
  }, [fetchPorts]);

  return (
    <div className="game-port-checker p-6 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
      <h2>🎮 Game Server Ports Checker</h2>

      <p>
        This tool checks whether the default ports for popular game servers are
        open and reachable from your network. Currently supported games include:
        <strong> Project Zomboid, DayZ, RimWorld</strong>, and you can also test
        any custom ports.
      </p>
      <p>
        <strong>Tip:</strong> If a port shows as{" "}
        <span className="status-closed">CLOSED ❌</span>, you may need to:
      </p>
      <ul>
        <li>Open the port in your server&apos;s firewall.</li>
        <li>Forward the port on your router to the server machine.</li>
        <li>Ensure no other application is already using that port.</li>
      </ul>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="Server Host (default 127.0.0.1)"
        />
        <input
          type="text"
          value={customPorts}
          onChange={(e) => setCustomPorts(e.target.value)}
          placeholder="Custom Ports (comma-separated)"
        />
        <button onClick={fetchPorts}>Check Ports</button>
      </div>

      {loading ? (
        <div className="loading">Checking ports...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Game / Port</th>
              <th>Port</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {servers.map(({ name, port, status }) => (
              <tr key={`${name}-${port}`}>
                <td>{name}</td>
                <td>{port}</td>
                <td className={status === "open" ? "status-open" : "status-closed"}>
                  {status === "open" ? "✅ OPEN" : "❌ CLOSED"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
