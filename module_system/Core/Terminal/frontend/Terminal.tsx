"use client";

import React, { useEffect, useRef, useState } from "react";
import "./terminal.css";

import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlay,
  FaStop,
  FaRedo,
  FaTerminal,
  FaSearch,
  FaTrash,
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
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [followTail, setFollowTail] = useState(true);

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

  // ---------------- API ----------------
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

  // ---------------- SEND ----------------
  const sendCommand = () => {
    if (!input.trim()) return;

    push("command", `> ${input}`);

    setHistory((h) => [input, ...h].slice(0, 50));
    setHistoryIndex(-1);

    wsRef.current?.send(
      JSON.stringify({
        type: "rcon",
        command: input,
      })
    );

    setInput("");
    setFiltered([]);
  };

  // ---------------- CLEAR ----------------
  const clearLogs = async () => {
    await fetch(`${API_BASE}/api/terminal/clear`, {
      method: "POST",
    });

    setLogs([]);
  };

  // ---------------- SEARCH ----------------
  const searchLogs = async (q: string) => {
    setSearchQuery(q);

    if (!q.trim()) {
      setSearchMode(false);
      return;
    }

    setSearchMode(true);

    const res = await fetch(`${API_BASE}/api/terminal/search?q=${q}`);

    const data = await res.json();

    setLogs(
      data.results.map((r: string, i: number) => ({
        id: i,
        text: r,
        type: "output",
        time: "",
      }))
    );
  };

  // ---------------- WS ----------------
  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(`${API_BASE.replace("http", "ws")}/ws/terminal`);

      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        push("system", "Connected");
      };

      ws.onmessage = (e) => {
        if (e.data === "__CLEAR__") {
          setLogs([]);
          return;
        }

        push("output", e.data);
      };

      ws.onerror = () => setConnected(false);

      ws.onclose = () => {
        setConnected(false);
        setTimeout(connect, 3000);
      };
    };

    connect();
    return () => wsRef.current?.close();
  }, []);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    if (followTail) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // ---------------- KEY HANDLER ----------------
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.key === "k") {
      setSearchMode(!searchMode);
      return;
    }

    if (e.key === "Enter") {
      if (searchMode) {
        searchLogs(searchQuery);
        return;
      }
      sendCommand();
    }

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
  };

  // ---------------- UI ----------------
  return (
    <div className="modern-terminal">
      {/* HEADER */}
      <div className="terminal-top">
        <div className="left">
          <FaTerminal />
          Control Console
        </div>

        <div className="right">
          WS: {connected ? "ONLINE" : "OFFLINE"} | SERVER: {status}
        </div>
      </div>

      {/* CONTROLS */}
      <div className="terminal-controls">
        <button onClick={() => callAPI("start")}>
          <FaPlay /> Start
        </button>

        <button onClick={() => callAPI("stop")}>
          <FaStop /> Stop
        </button>

        <button onClick={() => callAPI("restart")}>
          <FaRedo /> Restart
        </button>

        <button onClick={clearLogs}>
          <FaTrash /> Clear
        </button>

        <button onClick={() => setFollowTail(!followTail)}>
          {followTail ? "Pause Scroll" : "Follow Scroll"}
        </button>
      </div>

      {/* SEARCH BAR */}
      {searchMode && (
        <div className="terminal-input-bar">
          <FaSearch />
          <input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => searchLogs(e.target.value)}
          />
        </div>
      )}

      {/* LOGS */}
      <div className="terminal-log">
        <AnimatePresence>
          {logs.map((l) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`log ${l.type}`}
            >
              <span className="time">[{l.time}]</span>
              {l.text}
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={endRef} />
      </div>

      {/* INPUT */}
      {!searchMode && (
        <div className="terminal-input-bar">
          <span className="prompt">&gt;</span>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Enter command..."
          />

          <button onClick={sendCommand}>Send</button>
        </div>
      )}
    </div>
  );
}
