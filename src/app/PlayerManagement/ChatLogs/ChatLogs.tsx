"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Search,
  MessageSquare,
  User,
  Slash,
  Globe,
  Pause,
  Play,
  Wifi,
  WifiOff,
} from "lucide-react";

interface ChatMessage {
  player: string;
  message: string;
  timestamp: string;
  chat_type: string;
}

interface ChatLogsProps {
  serverIdentifier?: string;
}

const ChatLogs: React.FC<ChatLogsProps> = ({
  serverIdentifier = "default-server",
}) => {
  const [logs, setLogs] = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState("");
  const [playerFilter, setPlayerFilter] = useState("");
  const [commandOnly, setCommandOnly] = useState(false);
  const [chatType, setChatType] = useState("");
  const [paused, setPaused] = useState(false);
  const [connected, setConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);

  // ----------------------------
  // CONNECT WEBSOCKET
  // ----------------------------
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:2010/ws/zomboid-chat");
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log("🔥 Zomboid chat connected");
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("❌ Zomboid chat disconnected");
    };

    ws.onerror = () => {
      setConnected(false);
    };

    ws.onmessage = (event) => {
      if (paused) return;

      try {
        const msg: ChatMessage = JSON.parse(event.data);

        setLogs((prev) => {
          // prevent duplicates
          const exists = prev.some(
            (l) => l.message === msg.message && l.player === msg.player
          );

          if (exists) return prev;

          return [...prev, msg];
        });
      } catch (e) {
        console.log("Bad WS message:", event.data);
      }
    };

    return () => ws.close();
  }, [paused]);

  // ----------------------------
  // AUTO SCROLL
  // ----------------------------
  useEffect(() => {
    if (!containerRef.current) return;

    if (atBottomRef.current && !paused) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, paused]);

  const onScroll = () => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;

    atBottomRef.current = isBottom;
  };

  // ----------------------------
  // FILTERS
  // ----------------------------
  const filteredLogs = logs.filter((log) => {
    const text = (log.player + log.message).toLowerCase();

    if (playerFilter && !log.player.includes(playerFilter)) return false;
    if (chatType && log.chat_type !== chatType) return false;
    if (commandOnly && !log.message.startsWith("/")) return false;

    return text.includes(search.toLowerCase());
  });

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <div className="p-4 space-y-4 bg-zinc-900 border border-green-600 rounded-xl">
      {/* HEADER */}
      <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />
        Project Zomboid Live Chat
        {connected ? (
          <Wifi className="w-5 h-5 text-green-400" />
        ) : (
          <WifiOff className="w-5 h-5 text-red-500" />
        )}
      </h2>

      {/* CONTROLS */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* search */}
        <div className="flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded">
          <Search className="w-4 h-4 text-green-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="bg-transparent outline-none text-green-300"
          />
        </div>

        {/* player */}
        <div className="flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded">
          <User className="w-4 h-4 text-green-400" />
          <input
            value={playerFilter}
            onChange={(e) => setPlayerFilter(e.target.value)}
            placeholder="Player"
            className="bg-transparent outline-none text-green-300"
          />
        </div>

        {/* commands */}
        <label className="flex items-center gap-2 text-green-300 bg-zinc-800 px-3 py-2 rounded">
          <Slash className="w-4 h-4" />
          <input
            type="checkbox"
            checked={commandOnly}
            onChange={() => setCommandOnly(!commandOnly)}
          />
          Commands
        </label>

        {/* chat type */}
        <div className="flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded">
          <Globe className="w-4 h-4 text-green-400" />
          <select
            value={chatType}
            onChange={(e) => setChatType(e.target.value)}
            className="bg-transparent text-green-300"
          >
            <option value="">All</option>
            <option value="Global">Global</option>
            <option value="Faction">Faction</option>
            <option value="Private">Private</option>
          </select>
        </div>

        {/* pause */}
        <button
          onClick={() => setPaused(!paused)}
          className="flex items-center gap-1 bg-zinc-800 px-3 py-2 rounded text-green-300"
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
          {paused ? "Resume" : "Pause"}
        </button>
      </div>

      {/* CHAT LOGS */}
      <div
        ref={containerRef}
        onScroll={onScroll}
        className="h-[500px] overflow-y-auto bg-zinc-800 p-2 rounded border border-green-700 space-y-2"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-green-400 text-center mt-10">
            Waiting for live chat...
          </div>
        ) : (
          filteredLogs.map((log, i) => (
            <div
              key={i}
              className="p-2 rounded border border-green-700 bg-zinc-900"
            >
              <div className="flex justify-between">
                <span className="text-green-300 font-bold">{log.player}</span>
                <span className="text-xs text-green-500">{log.chat_type}</span>
              </div>

              <div className="text-green-100">{log.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatLogs;
