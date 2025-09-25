"use client";

import React, { useEffect, useState, useRef } from "react";
import { RefreshCw, Search, MessageSquare, User, Pause, Play } from "lucide-react";

interface ChatMessage {
  player: string;
  message: string;
  timestamp: string;
  chat_type: string;
}

const ChatLogs: React.FC = () => {
  const [logs, setLogs] = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState("");
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const API_BASE = "http://localhost:2010/api/projectzomboid";

  // SSE connection
  useEffect(() => {
    const es = new EventSource(`${API_BASE}/chat-stream`);
    es.onmessage = (e) => {
      const msg: ChatMessage = JSON.parse(e.data);
      setLogs((prev) => [...prev, msg]);
    };
    es.onerror = () => {
      console.error("SSE connection lost");
      es.close();
    };
    return () => es.close();
  }, []);

  // Auto-scroll
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

  return (
    <div className="p-4 space-y-4 bg-zinc-900 border border-green-600 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-green-500" /> Live Chat
      </h2>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-zinc-800 border border-green-600 rounded-lg px-3 py-2 flex-1">
          <Search className="w-5 h-5 text-green-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-green-300 w-full"
          />
        </div>

        <button
          onClick={() => setPaused(!paused)}
          className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded-lg flex items-center gap-1"
        >
          {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          {paused ? "Resume" : "Pause"}
        </button>

        <button
          onClick={() => setLogs([])}
          className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded-lg"
        >
          Clear
        </button>
      </div>

      <div
        ref={containerRef}
        className="max-h-[500px] overflow-y-auto space-y-2 p-2 bg-zinc-800 border border-green-700 rounded-lg"
      >
        {filteredLogs.length === 0 ? (
          <p className="text-green-400 text-center mt-10">No chat logs found.</p>
        ) : (
          filteredLogs.map((log, i) => (
            <div key={i} className="bg-zinc-900 border border-green-700 rounded-xl p-2">
              <div className="flex justify-between items-center">
                <p className="text-green-300 font-semibold">{log.player}</p>
                <p className="text-xs text-green-500">
                  [{log.chat_type}] {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
              <p className="text-green-100">{log.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatLogs;
