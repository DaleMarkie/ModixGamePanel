"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, Search, User, Clock, Gamepad } from "lucide-react";

interface Player {
  name: string;
  lastSeen: string;
  totalHours: number;
  currentGame?: string; // which game player is connected to
}

interface AllPlayersProps {
  activeGame: string; // the game currently selected in Modix
}

const AllPlayers: React.FC<AllPlayersProps> = ({ activeGame }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [connected, setConnected] = useState(false);

  const API_BASE = "http://localhost:2010/api/projectzomboid";

  useEffect(() => {
    const es = new EventSource(`${API_BASE}/players-stream`);

    es.onmessage = (event) => {
      const data: Player[] = JSON.parse(event.data);
      setPlayers(data);
      setConnected(true);
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
    };

    return () => es.close();
  }, []);

  // Filter players for search + only those on active game
  const filteredPlayers = players.filter(
    (p) =>
      p.currentGame === activeGame &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.lastSeen.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-green-400 flex items-center gap-2">
        <User className="w-8 h-8 text-green-500" />
        Players on {activeGame} {connected ? "●" : "○"}
      </h1>

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
          onClick={() => setPlayers([...players])}
          className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-zinc-900 border border-green-600 rounded-xl p-4 max-h-[600px] overflow-y-auto shadow-lg">
        {filteredPlayers.length === 0 ? (
          <p className="text-green-400 text-center mt-10 text-lg">
            No players connected to {activeGame}.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers
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
                  <p className="text-sm text-green-400 flex items-center gap-1">
                    <Gamepad className="w-4 h-4" />
                    Playing: {player.currentGame || "Unknown"}
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
