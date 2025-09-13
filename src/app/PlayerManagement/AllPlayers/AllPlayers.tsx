"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, Search, User, Clock } from "lucide-react";

interface Player {
  name: string;
  lastSeen: string;
  totalHours: number;
}

const AllPlayers: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:2010/api/projectzomboid";

  // Fetch players list
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/players`);
      const data = await res.json();
      setPlayers(data.players || []);
    } catch (err) {
      console.error("Failed to fetch players:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const filterPlayers = (players: Player[]) =>
    players.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.lastSeen.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-green-400 flex items-center gap-2">
        <User className="w-8 h-8 text-green-500" />
        All Players
      </h1>

      {/* Search + Refresh */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 bg-zinc-900 border border-green-600 rounded-lg px-3 py-2 shadow-inner w-full md:w-auto">
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
          onClick={fetchPlayers}
          disabled={loading}
          className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Players List */}
      <div className="bg-zinc-900 border border-green-600 rounded-xl p-4 max-h-[600px] overflow-y-auto shadow-lg">
        {filterPlayers(players).length === 0 ? (
          <p className="text-green-400 text-center mt-10 text-lg">
            No players found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterPlayers(players)
              .slice()
              .reverse()
              .map((player, i) => (
                <div
                  key={i}
                  className="bg-zinc-800 border border-green-700 rounded-2xl shadow-md p-4 flex flex-col gap-2 hover:bg-zinc-700 transition-all duration-200"
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
