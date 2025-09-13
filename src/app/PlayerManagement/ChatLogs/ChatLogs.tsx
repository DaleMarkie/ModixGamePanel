"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, Search, MessageSquare } from "lucide-react";

interface ChatMessage {
  player: string;
  message: string;
  timestamp: string;
}

const ChatLogs: React.FC = () => {
  const [logs, setLogs] = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:2010/api/projectzomboid";

  // Fetch chat logs
  const fetchChatLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/chatlogs`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error("Failed to fetch chat logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatLogs();
  }, []);

  const filterLogs = (entries: ChatMessage[]) =>
    entries.filter(
      (log) =>
        log.player.toLowerCase().includes(search.toLowerCase()) ||
        log.message.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-green-400 flex items-center gap-2">
        <MessageSquare className="w-8 h-8 text-green-500" />
        Chat Logs
      </h1>

      {/* Search + Refresh */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 bg-zinc-900 border border-green-600 rounded-lg px-3 py-2 shadow-inner w-full md:w-auto">
          <Search className="w-5 h-5 text-green-400" />
          <input
            type="text"
            placeholder="Search chat logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-green-300 placeholder-green-500 w-full"
          />
        </div>
        <button
          onClick={fetchChatLogs}
          disabled={loading}
          className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Chat Logs List */}
      <div className="bg-zinc-900 border border-green-600 rounded-xl p-4 max-h-[600px] overflow-y-auto shadow-lg">
        {filterLogs(logs).length === 0 ? (
          <p className="text-green-400 text-center mt-10 text-lg">
            No chat logs found.
          </p>
        ) : (
          <div className="space-y-3">
            {filterLogs(logs)
              .slice()
              .reverse()
              .map((log, i) => (
                <div
                  key={i}
                  className="bg-zinc-800 border border-green-700 rounded-2xl shadow-md p-3 flex flex-col gap-1 hover:bg-zinc-700 transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold text-green-300">
                      {log.player}
                    </p>
                    <p className="text-xs text-green-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm text-green-100">{log.message}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLogs;
