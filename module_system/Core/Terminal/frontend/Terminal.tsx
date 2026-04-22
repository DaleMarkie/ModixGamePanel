"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlay,
  FaStop,
  FaRedo,
  FaTerminal,
  FaCircle,
  FaBolt,
} from "react-icons/fa";

interface Log {
  id: number;
  text: string;
  type: "system" | "error" | "output" | "command";
  time: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2010";

const suggestions = [
  "players",
  "save",
  "quit",
  "help",
  "ping",
  "kick",
  "ban",
  "status",
];

export default function Terminal() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<"RUNNING" | "STOPPED">("STOPPED");

  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [filtered, setFiltered] = useState<string[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // ---------------- LOG ----------------
  const push = (type: Log["type"], text: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        type,
        text,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // ---------------- API (SERVER CONTROL ONLY) ----------------
  const callAPI = async (action: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/terminal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      if (data.output) push("output", data.output);

      if (action === "start") setStatus("RUNNING");
      if (action === "stop") setStatus("STOPPED");
      if (action === "restart") setStatus("RUNNING");
    } catch (err: any) {
      push("error", err.message);
    }
  };

  // ---------------- SEND RCON VIA WS ----------------
  const sendCommand = () => {
    if (!input.trim()) return;

    push("command", `> ${input}`);

    setHistory((h) => [input, ...h].slice(0, 50));
    setHistoryIndex(-1);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "rcon",
          command: input,
        })
      );
    } else {
      push("error", "WebSocket not connected");
    }

    setInput("");
    setFiltered([]);
  };

  // ---------------- WEBSOCKET ----------------
  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(
        `${API_BASE.replace("http", "ws")}/ws/terminal`
      );

      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        push("system", "WebSocket connected");
      };

      ws.onmessage = (e) => {
        push("output", e.data);
      };

      ws.onerror = () => {
        setConnected(false);
        push("error", "WebSocket error");
      };

      ws.onclose = () => {
        setConnected(false);
        push("error", "Disconnected — reconnecting...");
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => wsRef.current?.close();
  }, []);

  // ---------------- INIT STATUS ----------------
  useEffect(() => {
    callAPI("status");
  }, []);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // ---------------- AUTOCOMPLETE ----------------
  const onInputChange = (val: string) => {
    setInput(val);

    if (!val) return setFiltered([]);

    setFiltered(
      suggestions.filter((s) =>
        s.toLowerCase().includes(val.toLowerCase())
      )
    );
  };

  // ---------------- HISTORY ----------------
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      const next = history[historyIndex + 1];
      if (next) {
        setHistoryIndex(historyIndex + 1);
        setInput(next);
      }
    }

    if (e.key === "ArrowDown") {
      const prev = history[historyIndex - 1] || "";
      setHistoryIndex(Math.max(historyIndex - 1, -1));
      setInput(prev);
    }

    if (e.key === "Enter") sendCommand();
  };

  // ---------------- UI ----------------
  return (
    <div className="h-screen w-full bg-gradient-to-br from-black via-[#050505] to-black text-green-300 font-mono flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-green-900/40 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-lg font-semibold">
          <FaTerminal className="text-green-400" />
          Zomboid Control Console
        </div>

        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <FaCircle className={connected ? "text-green-400" : "text-red-500"} />
            WS {connected ? "ONLINE" : "OFFLINE"}
          </div>

          <div className="flex items-center gap-2">
            <FaBolt className={status === "RUNNING" ? "text-green-400" : "text-red-500"} />
            SERVER {status}
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="px-6 py-3 flex gap-3 bg-black/30 border-b border-green-900/30">
        <button onClick={() => callAPI("start")} className="px-4 py-2 rounded bg-green-700/80 hover:bg-green-600">
          <FaPlay className="inline mr-2" /> Start
        </button>

        <button onClick={() => callAPI("stop")} className="px-4 py-2 rounded bg-red-700/80 hover:bg-red-600">
          <FaStop className="inline mr-2" /> Stop
        </button>

        <button onClick={() => callAPI("restart")} className="px-4 py-2 rounded bg-yellow-600/80 hover:bg-yellow-500">
          <FaRedo className="inline mr-2" /> Restart
        </button>
      </div>

      {/* TERMINAL */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full rounded-2xl border border-green-900/40 bg-black/70 flex flex-col">
          
          {/* LOGS */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 text-sm">
            <AnimatePresence>
              {logs.map((l) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={
                    l.type === "error"
                      ? "text-red-400"
                      : l.type === "system"
                      ? "text-blue-400"
                      : l.type === "command"
                      ? "text-yellow-300"
                      : "text-green-300"
                  }
                >
                  <span className="text-gray-500">[{l.time}]</span> {l.text}
                </motion.div>
              ))}
            </AnimatePresence>

            <div ref={endRef} />
          </div>

          {/* INPUT */}
          <div className="border-t border-green-900/30 p-3 relative">
            {filtered.length > 0 && (
              <div className="absolute bottom-14 left-4 bg-black border border-green-800 rounded p-2 text-xs">
                {filtered.map((s) => (
                  <div
                    key={s}
                    onClick={() => setInput(s)}
                    className="cursor-pointer hover:text-green-400"
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <span className="text-green-500">{">"}</span>

              <input
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Enter command..."
                className="flex-1 bg-transparent outline-none text-green-300"
              />

              <button onClick={sendCommand} className="px-4 py-1 bg-green-700 rounded hover:bg-green-600">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}