"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  RefreshCw,
  Search,
  MessageSquare,
  User,
  Slash,
  Globe,
  Pause,
  Play,
} from "lucide-react";

interface ChatMessage {
  player: string;
  message: string;
  timestamp: string;
  chat_type: string;
}

interface ChatLogsProps {
  serverIdentifier?: string; // Made optional
}

const ChatLogs: React.FC<ChatLogsProps> = ({
  serverIdentifier = "default-server",
}) => {
  const [logs, setLogs] = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState("");
  const [playerFilter, setPlayerFilter] = useState("");
  const [commandOnly, setCommandOnly] = useState(false);
  const [chatType, setChatType] = useState(""); // Global, Faction, Private
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);

  const latestTimestampRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const API_BASE = "http://localhost:2010/api/projectzomboid";

  // Fetch chat logs with filters
  const fetchChatLogs = async () => {
    if (!serverIdentifier) return;

    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("player", playerFilter);
      if (commandOnly) params.append("commands_only", "true");
      if (chatType) params.append("chat_type", chatType);
      if (latestTimestampRef.current)
        params.append("since", latestTimestampRef.current);

      const res = await fetch(`${API_BASE}/chatlogs?${params.toString()}`);
      const data = await res.json();

      if (data.logs && data.logs.length > 0) {
        latestTimestampRef.current = data.logs[data.logs.length - 1].timestamp;
        setLogs((prev) => [...prev, ...data.logs]);
      }
    } catch (err) {
      console.error("Failed to fetch chat logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 3 seconds
  useEffect(() => {
    fetchChatLogs();
    const interval = setInterval(fetchChatLogs, 3000);
    return () => clearInterval(interval);
  }, [playerFilter, commandOnly, chatType, serverIdentifier]);

  // Auto-scroll if not paused
  useEffect(() => {
    if (!paused && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, paused]);

  const filteredLogs = logs.filter(
    (log) =>
      log.player.toLowerCase().includes(search.toLowerCase()) ||
      log.message.toLowerCase().includes(search.toLowerCase())
  );

  const highlightText = (text: string) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-green-600 text-white px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="p-4 space-y-4 bg-zinc-900 border border-green-600 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-green-500" /> Live Chat
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="flex items-center gap-2 bg-zinc-800 border border-green-600 rounded-lg px-3 py-2 shadow-inner flex-1 md:flex-none">
          <Search className="w-5 h-5 text-green-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-green-300 placeholder-green-500 w-full"
          />
        </div>

        {/* Player filter */}
        <div className="flex items-center gap-2 bg-zinc-800 border border-green-600 rounded-lg px-3 py-2 shadow-inner">
          <User className="w-5 h-5 text-green-400" />
          <input
            type="text"
            placeholder="Player..."
            value={playerFilter}
            onChange={(e) => setPlayerFilter(e.target.value)}
            className="bg-transparent outline-none text-green-300 placeholder-green-500 w-full"
          />
        </div>

        {/* Commands only */}
        <div className="flex items-center gap-2 bg-zinc-800 border border-green-600 rounded-lg px-3 py-2 shadow-inner cursor-pointer select-none">
          <Slash className="w-5 h-5 text-green-400" />
          <label className="text-green-300 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={commandOnly}
              onChange={() => setCommandOnly(!commandOnly)}
              className="mr-1"
            />
            Commands only
          </label>
        </div>

        {/* Chat type */}
        <div className="flex items-center gap-2 bg-zinc-800 border border-green-600 rounded-lg px-3 py-2 shadow-inner">
          <Globe className="w-5 h-5 text-green-400" />
          <select
            value={chatType}
            onChange={(e) => setChatType(e.target.value)}
            className="bg-transparent outline-none text-green-300 placeholder-green-500"
          >
            <option value="">All types</option>
            <option value="Global">Global</option>
            <option value="Faction">Faction</option>
            <option value="Private">Private</option>
          </select>
        </div>

        {/* Pause */}
        <div
          className="flex items-center gap-2 bg-zinc-800 border border-green-600 rounded-lg px-3 py-2 shadow-inner cursor-pointer select-none"
          onClick={() => setPaused(!paused)}
        >
          {paused ? (
            <Play className="w-5 h-5 text-green-400" />
          ) : (
            <Pause className="w-5 h-5 text-green-400" />
          )}
          <span className="text-green-300 text-sm">
            {paused ? "Resume" : "Pause"}
          </span>
        </div>

        {/* Refresh */}
        <button
          onClick={fetchChatLogs}
          disabled={loading}
          className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded-lg flex items-center gap-1 transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Chat logs */}
      <div
        ref={containerRef}
        className="max-h-[500px] overflow-y-auto space-y-2 p-2 bg-zinc-800 border border-green-700 rounded-lg"
      >
        {filteredLogs.length === 0 ? (
          <p className="text-green-400 text-center mt-10">
            No chat logs found.
          </p>
        ) : (
          filteredLogs
            .slice()
            .reverse()
            .map((log, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-green-700 rounded-xl p-2"
              >
                <div className="flex justify-between items-center">
                  <p className="text-green-300 font-semibold">
                    {highlightText(log.player)}
                  </p>
                  <p className="text-xs text-green-500">
                    [{log.chat_type}] {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
                <p className="text-green-100">{highlightText(log.message)}</p>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ChatLogs;
