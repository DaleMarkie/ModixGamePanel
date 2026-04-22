"use client";

import React, { useEffect, useRef, useState } from "react";
import "./terminal.css";

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

  useEffect(() => {
    callAPI("status");
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const onInputChange = (val: string) => {
    setInput(val);

    if (!val) return setFiltered([]);

    setFiltered(
      suggestions.filter((s) =>
        s.toLowerCase().includes(val.toLowerCase())
      )
    );
  };

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

  return (
    <div className="modern-terminal">
      {/* HEADER */}
      <div className="terminal-top">
        <div className="left">
          <FaTerminal />
          <span>Control Console</span>
        </div>

        <div className="right">
          <span className="dot green" />
          WS {connected ? "ONLINE" : "OFFLINE"}

          <span className="dot red" />
          SERVER {status}
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
      </div>

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
      <div className="terminal-input-bar">
        <span className="prompt">&gt;</span>

        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Enter command..."
        />

        <button onClick={sendCommand}>Send</button>
      </div>

      {/* AUTOCOMPLETE */}
      {filtered.length > 0 && (
        <ul className="autocomplete-dropdown">
          {filtered.map((s) => (
            <li key={s} onClick={() => setInput(s)}>
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}