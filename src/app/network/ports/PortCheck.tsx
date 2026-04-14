"use client";
import React, { useEffect, useState, useCallback } from "react";

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
  const [host, setHost] = useState("127.0.0.1");
  const [customPorts, setCustomPorts] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPorts = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        host,
        custom_ports: customPorts,
      }).toString();

      const res = await fetch(`/api/server/game-ports?${query}`);
      if (!res.ok) throw new Error();

      const data: ApiResponse = await res.json();
      setServers(data.servers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [host, customPorts]);

  useEffect(() => {
    fetchPorts();
  }, [fetchPorts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f1a] to-[#05070d] text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            🎮 Port Checker
          </h1>
          <p className="text-zinc-400">
            Instantly check if your game server ports are open and reachable.
          </p>
        </div>

        {/* CONTROL PANEL */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 shadow-xl">
          <div className="grid md:grid-cols-3 gap-3">
            <input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="Host (e.g. 192.168.0.10)"
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              value={customPorts}
              onChange={(e) => setCustomPorts(e.target.value)}
              placeholder="Custom ports (e.g. 8080,27015)"
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              onClick={fetchPorts}
              className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-4 py-2 font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              Check Ports
            </button>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-10 text-zinc-400 animate-pulse">
            Checking ports...
          </div>
        )}

        {/* RESULTS */}
        {!loading && (
          <div className="grid gap-4">
            {servers.map(({ name, port, status }) => (
              <div
                key={`${name}-${port}`}
                className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition"
              >
                <div>
                  <div className="font-semibold text-lg">{name}</div>
                  <div className="text-zinc-400 text-sm">Port {port}</div>
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    status === "open"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {status === "open" ? "OPEN" : "CLOSED"}
                </div>
              </div>
            ))}

            {servers.length === 0 && (
              <div className="text-center text-zinc-500 py-10">
                No data yet.
              </div>
            )}
          </div>
        )}

        {/* FOOTER TIP */}
        <div className="mt-8 text-sm text-zinc-500">
          ⚠️ Closed ports usually mean firewall or router forwarding issues.
        </div>
      </div>
    </div>
  );
}
