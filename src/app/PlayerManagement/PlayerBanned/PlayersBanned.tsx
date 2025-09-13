"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, UserX, Search, X, Plus } from "lucide-react";

interface BannedPlayer {
  player: string;
  message: string; // ban reason
  timestamp: string;
}

const PlayersBanned: React.FC = () => {
  const [bannedPlayers, setBannedPlayers] = useState<BannedPlayer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [newBanPlayer, setNewBanPlayer] = useState("");
  const [newBanReason, setNewBanReason] = useState("");

  const API_BASE = "http://localhost:2010/api/projectzomboid";

  // Fetch current ban list
  const fetchBannedPlayers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/banned`);
      const data = await res.json();
      setBannedPlayers(data.banned || []);
    } catch (err) {
      console.error("Failed to fetch banned players:", err);
    } finally {
      setLoading(false);
    }
  };

  // Unban a player
  const unbanPlayer = async (player: string) => {
    try {
      setLoading(true);
      await fetch(`${API_BASE}/unban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player }),
      });
      setBannedPlayers((prev) => prev.filter((p) => p.player !== player));
    } catch (err) {
      console.error("Failed to unban player:", err);
    } finally {
      setLoading(false);
    }
  };

  // Ban a new player
  const banPlayer = async () => {
    if (!newBanPlayer.trim()) return alert("Enter a player name to ban");
    try {
      setLoading(true);
      await fetch(`${API_BASE}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: newBanPlayer, reason: newBanReason }),
      });
      // Refresh the ban list after banning
      fetchBannedPlayers();
      setNewBanPlayer("");
      setNewBanReason("");
    } catch (err) {
      console.error("Failed to ban player:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannedPlayers();
  }, []);

  const filterPlayers = (players: BannedPlayer[]) =>
    players.filter(
      (p) =>
        p.player.toLowerCase().includes(search.toLowerCase()) ||
        p.message.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-green-400 flex items-center gap-2">
        <UserX className="w-8 h-8 text-green-500" />
        Banned Players
      </h1>

      {/* Search + Refresh */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 bg-zinc-900 border border-green-600 rounded-lg px-3 py-2 shadow-inner w-full md:w-auto">
          <Search className="w-5 h-5 text-green-400" />
          <input
            type="text"
            placeholder="Search banned players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-green-300 placeholder-green-500 w-full"
          />
        </div>
        <button
          onClick={fetchBannedPlayers}
          disabled={loading}
          className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Ban Player Form */}
      <div className="bg-zinc-900 border border-green-600 rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-center gap-4">
        <input
          type="text"
          placeholder="Player name..."
          value={newBanPlayer}
          onChange={(e) => setNewBanPlayer(e.target.value)}
          className="bg-zinc-800 border border-green-700 rounded-lg px-3 py-2 text-green-300 w-full md:w-1/3"
        />
        <input
          type="text"
          placeholder="Reason (optional)"
          value={newBanReason}
          onChange={(e) => setNewBanReason(e.target.value)}
          className="bg-zinc-800 border border-green-700 rounded-lg px-3 py-2 text-green-300 w-full md:w-1/3"
        />
        <button
          onClick={banPlayer}
          disabled={loading}
          className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> Ban Player
        </button>
      </div>

      {/* Banned Players List */}
      <div className="bg-zinc-900 border border-green-600 rounded-xl p-4 max-h-[600px] overflow-y-auto shadow-lg">
        {filterPlayers(bannedPlayers).length === 0 ? (
          <p className="text-green-400 text-center mt-10 text-lg">
            No banned players found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterPlayers(bannedPlayers)
              .slice()
              .reverse()
              .map((player, i) => (
                <div
                  key={i}
                  className="bg-zinc-800 border border-green-700 rounded-2xl shadow-md p-4 flex flex-col gap-2 hover:bg-zinc-700 transition-all duration-200"
                >
                  <p className="text-xl font-semibold text-green-300">
                    {player.player}
                  </p>
                  <p className="text-sm text-red-500 font-medium">
                    {player.message || "No reason provided"}
                  </p>
                  <p className="text-xs text-green-500">
                    {new Date(player.timestamp).toLocaleString()}
                  </p>
                  <button
                    onClick={() => unbanPlayer(player.player)}
                    className="mt-2 px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded-lg flex items-center gap-1 text-sm transition-all duration-200"
                  >
                    <X className="w-4 h-4" /> Unban
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayersBanned;
