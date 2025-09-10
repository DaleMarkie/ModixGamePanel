"use client";
import React, { useEffect, useState } from "react";

interface ServerPort {
  name: string;
  port: number;
  status: "open" | "closed";
}

export default function GamePortChecker() {
  const [servers, setServers] = useState<ServerPort[]>([]);
  const [host, setHost] = useState("127.0.0.1");
  const [customPorts, setCustomPorts] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPorts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        host,
        custom_ports: customPorts,
      }).toString();
      const res = await fetch(`/api/server/game-ports?${query}`);
      const data = await res.json();
      setServers(data.servers);
    } catch (error) {
      console.error("Failed to fetch ports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPorts();
  }, []);

  return (
    <div className="p-6 bg-zinc-900 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-white">🎮 Game Server Ports Checker</h2>

      <p className="mb-4 text-zinc-300">
        This tool checks whether the default ports for popular game servers are open and reachable from your network. Currently supported games include:
        <strong> Project Zomboid, DayZ, RimWorld</strong>, and you can also test any custom ports.
      </p>
      <p className="mb-4 text-zinc-300">
        <strong>Tip:</strong> If a port shows as <span className="font-bold text-red-400">CLOSED ❌</span>, you may need to:
      </p>
      <ul className="mb-4 list-disc list-inside text-zinc-300">
        <li>Open the port in your server's firewall.</li>
        <li>Forward the port on your router to the server machine.</li>
        <li>Ensure no other application is already using that port.</li>
      </ul>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="Server Host (default 127.0.0.1)"
          className="flex-1 p-2 rounded bg-zinc-800 text-white border border-zinc-700"
        />
        <input
          type="text"
          value={customPorts}
          onChange={(e) => setCustomPorts(e.target.value)}
          placeholder="Custom Ports (comma-separated)"
          className="flex-1 p-2 rounded bg-zinc-800 text-white border border-zinc-700"
        />
        <button
          onClick={fetchPorts}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-white font-bold"
        >
          Check Ports
        </button>
      </div>

      {loading ? (
        <p className="text-white">Checking ports...</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-700 text-white">
              <th className="p-2">Game / Port</th>
              <th className="p-2">Port</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {servers.map(({ name, port, status }) => (
              <tr key={`${name}-${port}`} className="border-t border-zinc-800">
                <td className="p-2 text-white">{name}</td>
                <td className="p-2 text-white">{port}</td>
                <td className="p-2 font-bold text-white">
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
