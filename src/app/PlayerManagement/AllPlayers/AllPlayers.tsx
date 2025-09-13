"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, Users, Search } from "lucide-react";

interface Player {
  id: string;
  name: string;
  server: string;
  lastSeen: string;
}

const AllPlayers: React.FC = () => {
  const [connectedPlayers, setConnectedPlayers] = useState<Player[]>([]);
  const [historicalPlayers, setHistoricalPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:2010/api/projectzomboid/players"
      );
      const data = await res.json();

      setConnectedPlayers(data.connected || []);
      setHistoricalPlayers(data.historical || []);
    } catch (err) {
      console.error("Failed to fetch players:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // Filter function
  const filterPlayers = (players: Player[]) =>
    players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-green-400 flex items-center gap-2">
        <Users className="w-8 h-8 text-green-500" />
        All Players
      </h1>

      {/* Search + Refresh */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 bg-zinc-900 border border-green-600 rounded-lg px-3 py-2">
          <Search className="w-5 h-5 text-green-400" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-green-300 placeholder-green-500"
          />
        </div>
        <button
          onClick={fetchPlayers}
          disabled={loading}
          className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Connected Players */}
      <div>
        <h2 className="text-xl font-semibold text-green-300 mb-2">
          Connected Players
        </h2>
        {filterPlayers(connectedPlayers).length === 0 ? (
          <div className="bg-zinc-900 text-green-400 border border-green-600 rounded-xl p-6 text-center">
            <p>No players currently connected.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterPlayers(connectedPlayers).map((player) => (
              <div
                key={player.id}
                className="bg-zinc-900 text-green-400 border border-green-600 rounded-2xl shadow-md p-4 space-y-2"
              >
                <p className="text-xl font-semibold">{player.name}</p>
                <p className="text-sm text-green-300">
                  Server: {player.server}
                </p>
                <p className="text-sm text-green-500">
                  Last Seen: {new Date(player.lastSeen).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Players */}
      <div>
        <h2 className="text-xl font-semibold text-green-300 mb-2">
          Historical Players
        </h2>
        {filterPlayers(historicalPlayers).length === 0 ? (
          <div className="bg-zinc-900 text-green-400 border border-green-600 rounded-xl p-6 text-center">
            <p>No historical player records.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterPlayers(historicalPlayers).map((player) => (
              <div
                key={player.id}
                className={`bg-zinc-900 text-green-400 border border-green-600 rounded-2xl shadow-md p-4 space-y-2 ${
                  connectedPlayers.some((p) => p.id === player.id)
                    ? "border-green-400" // highlight if connected
                    : ""
                }`}
              >
                <p className="text-xl font-semibold">{player.name}</p>
                <p className="text-sm text-green-300">
                  Server: {player.server || "N/A"}
                </p>
                <p className="text-sm text-green-500">
                  Last Seen: {new Date(player.lastSeen).toLocaleString()}
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
