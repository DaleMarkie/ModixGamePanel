"use client";

import React, { useEffect, useRef, useState } from "react";
import { RefreshCw, Search, User, Clock, Wifi, WifiOff } from "lucide-react";

interface Player {
  name: string;
  lastSeen: string;
  totalHours: number;
}

const API_BASE = "http://localhost:2010/api/projectzomboid";

const AllPlayers: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const esRef = useRef<EventSource | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    setLoading(true);

    if (esRef.current) {
      esRef.current.close();
    }

    const es = new EventSource(`${API_BASE}/players-stream`);
    esRef.current = es;

    es.onopen = () => {
      setConnected(true);
      setLoading(false);
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          setPlayers(data);
        }
      } catch (err) {
        console.error("Invalid player data:", err);
      }
    };

    es.onerror = () => {
      setConnected(false);
      setLoading(false);

      es.close();

      // auto-reconnect (prevents dead UI)
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);

      reconnectTimeout.current = setTimeout(() => {
        connect();
      }, 3000);
    };
  };

  useEffect(() => {
    connect();

    return () => {
      esRef.current?.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, []);

  const filteredPlayers = players.filter((p) =>
    `${p.name} ${p.lastSeen}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-400 flex items-center gap-2">
          <User className="w-8 h-8 text-green-500" />
          All Players
        </h1>

        <div className="flex items-center gap-2 text-sm">
          {loading ? (
            <span className="text-yellow-400">Connecting...</span>
          ) : connected ? (
            <span className="text-green-400 flex items-center gap-1">
              <Wifi className="w-4 h-4" /> Live
            </span>
          ) : (
            <span className="text-red-400 flex items-center gap-1">
              <WifiOff className="w-4 h-4" /> Disconnected
            </span>
          )}
        </div>
      </div>

      {/* SEARCH + REFRESH */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 bg-zinc-900 border border-green-600 rounded-lg px-3 py-2 w-full md:w-auto">
          <Search className="w-5 h-5 text-green-400" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-green-300 placeholder-green-500 w-full"
          />
        </div>

        <button
          onClick={connect}
          className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Reconnect
        </button>
      </div>

      {/* BODY */}
      <div className="bg-zinc-900 border border-green-600 rounded-xl p-4 max-h-[600px] overflow-y-auto shadow-lg">
        {loading ? (
          <p className="text-center text-green-400">Connecting to server...</p>
        ) : filteredPlayers.length === 0 ? (
          <p className="text-green-400 text-center mt-10 text-lg">
            No players connected.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers
              .slice()
              .reverse()
              .map((player, i) => (
                <div
                  key={i}
                  className="bg-zinc-800 border border-green-700 rounded-2xl p-4 flex flex-col gap-2 hover:bg-zinc-700 transition"
                >
                  <p className="text-xl font-semibold text-green-300">
                    {player.name}
                  </p>

                  <p className="text-sm text-zinc-400 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-green-400" />
                    Last seen: {player.lastSeen}
                  </p>

                  <p className="text-sm text-green-500">
                    Total hours: {player.totalHours}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPlayers;