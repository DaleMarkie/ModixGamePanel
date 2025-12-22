"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FaPlay,
  FaStop,
  FaRedo,
  FaTerminal,
  FaCircle,
  FaFile,
  FaArrowsAltV,
} from "react-icons/fa";
import "./terminal.css";

import CommandInput from "./CommandInput";
import BatchSelector from "./BatchSelector";

interface TerminalMessage {
  id: number;
  type: "system" | "command" | "output" | "error";
  text: string;
  time: string;
}

export default function Terminal() {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [input, setInput] = useState("");
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [status, setStatus] = useState<"RUNNING" | "STOPPED">("STOPPED");
  const [autoScroll, setAutoScroll] = useState(true);
  const [batchPath, setBatchPath] = useState<string | null>(null);
  const [favoriteBatches, setFavoriteBatches] = useState<string[]>([]);
  const [savedCommands, setSavedCommands] = useState<string[]>([]);
  const [showBatchSelector, setShowBatchSelector] = useState(false);
  const [osName, setOsName] = useState<string>("Unknown OS");
  const endRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (autoScroll) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, autoScroll]);

  // Detect OS
  useEffect(() => {
    const platform = navigator.platform.toLowerCase();
    setOsName(platform.includes("win") ? "windows" : "linux");
  }, []);

  // Load saved data and connect WS
  useEffect(() => {
    const game = localStorage.getItem("activeGameId");
    setActiveGame(game);

    const savedBatch = localStorage.getItem(`batchPath_${game}`);
    setBatchPath(savedBatch);

    const favorites = JSON.parse(
      localStorage.getItem("favoriteBatches") || "[]"
    );
    setFavoriteBatches(favorites);

    const persistedLogs = JSON.parse(
      localStorage.getItem(`terminalLogs_${game}`) || "[]"
    );
    setMessages(persistedLogs);

    const saved = JSON.parse(localStorage.getItem(`commands_${game}`) || "[]");
    const defaultCommands = [
      "start",
      "stop",
      "restart",
      "save",
      "backup",
      "kick PlayerName",
      "ban PlayerName",
      "status",
      "whitelist add PlayerName",
      "whitelist remove PlayerName",
    ];
    setSavedCommands(Array.from(new Set([...saved, ...defaultCommands])));

    // If no logs, push welcome messages
    if (!persistedLogs.length) {
      push("system", "👋 Welcome to the Modern Terminal!");
      push("system", "Select a batch (.bat or .sh) to run your server.");
      push("system", "Use buttons above to Start, Stop, Restart.");
      push("system", "Type commands below and press Enter to execute them.");
      push(
        "system",
        "Favorites help you quickly select commonly used batches."
      );
    }

    // Setup WebSocket
    if (game) {
      const ws = new WebSocket(`ws://localhost:8000/api/terminal/ws/${game}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        push(data.type === "error" ? "error" : "output", data.text);
      };

      ws.onclose = () => console.log("WebSocket closed.");

      return () => ws.close();
    }
  }, []);

  // Push message and persist
  const push = (type: TerminalMessage["type"], text: string) => {
    setMessages((prev) => {
      const newLogs = [
        ...prev,
        {
          id: Date.now() + Math.random(),
          type,
          text,
          time: new Date().toLocaleTimeString(),
        },
      ];
      if (activeGame)
        localStorage.setItem(
          `terminalLogs_${activeGame}`,
          JSON.stringify(newLogs)
        );
      return newLogs;
    });
  };

  const executeCommand = async (command?: string) => {
    if (!activeGame) return;
    const cmd = command || input;
    if (!cmd.trim()) return;

    push("command", cmd);
    setInput("");

    if (!savedCommands.includes(cmd)) {
      const updated = [...savedCommands, cmd];
      setSavedCommands(updated);
      localStorage.setItem(`commands_${activeGame}`, JSON.stringify(updated));
    }

    try {
      const res = await fetch("/api/terminal/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: activeGame, command: cmd, batchPath }),
      });
      const data = await res.json();
      if (data.output) push("output", data.output);
      if (data.error) push("error", data.error);
    } catch {
      push("error", "Server unreachable.");
    }
  };

  const controlServer = async (action: "start" | "stop" | "restart") => {
    if (!activeGame || !batchPath) {
      push("error", "No batch file selected.");
      return;
    }
    push("system", `Server ${action.toUpperCase()} issued`);
    await executeCommand(action);
    setStatus(
      action === "start" ? "RUNNING" : action === "stop" ? "STOPPED" : status
    );
  };

  const openBatchSelector = () => setShowBatchSelector(true);

  const handleAddFavorite = (path: string) => {
    const trimmed = path.trim();
    if (!trimmed) return push("error", "Cannot add empty path.");
    const valid =
      osName === "windows" ? trimmed.endsWith(".bat") : trimmed.endsWith(".sh");
    if (!valid) return push("error", `Invalid file type for ${osName}.`);
    if (favoriteBatches.includes(trimmed))
      return push("system", `Already in favorites: ${trimmed}`);
    const updated = [trimmed, ...favoriteBatches];
    setFavoriteBatches(updated);
    localStorage.setItem("favoriteBatches", JSON.stringify(updated));
    push("system", `Added to favorites: ${trimmed}`);
  };

  return (
    <div className="modern-terminal">
      {/* HEADER */}
      <div className="terminal-top">
        <div className="left">
          <FaTerminal /> <span>{activeGame || "No Active Game"}</span>
        </div>
        <div className="right">
          <FaCircle className={status === "RUNNING" ? "green" : "red"} />
          <span>{status}</span>
          <span className="os-display">OS: {osName}</span>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="terminal-controls">
        <button
          onClick={() => controlServer("start")}
          disabled={!activeGame || !batchPath}
        >
          <FaPlay /> Start
        </button>
        <button
          onClick={() => controlServer("stop")}
          disabled={!activeGame || !batchPath}
        >
          <FaStop /> Stop
        </button>
        <button
          onClick={() => controlServer("restart")}
          disabled={!activeGame || !batchPath}
        >
          <FaRedo /> Restart
        </button>
        <button onClick={openBatchSelector}>
          <FaFile /> Change Batch
        </button>
        <button
          onClick={() => setAutoScroll((prev) => !prev)}
          className={autoScroll ? "active-auto" : ""}
        >
          <FaArrowsAltV /> Auto-Scroll
        </button>
        <button
          onClick={() => {
            setMessages([]);
            if (activeGame)
              localStorage.removeItem(`terminalLogs_${activeGame}`);
            push("system", "Terminal cleared.");
          }}
        >
          🗑️ Clear
        </button>
      </div>

      {/* COMMAND INPUT */}
      <CommandInput
        value={input}
        onChange={setInput}
        onEnter={executeCommand}
        disabled={!activeGame || !batchPath}
        savedCommands={savedCommands}
      />

      {/* LOG AREA */}
      <div className="terminal-log">
        {messages.map((m) => (
          <div key={m.id} className={`log ${m.type}`}>
            <span className="time">[{m.time}]</span> {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* BATCH MODAL */}
      {showBatchSelector && (
        <BatchSelector
          osName={osName}
          favoriteBatches={favoriteBatches}
          batchPath={batchPath}
          onSelectBatch={(path) => {
            setBatchPath(path);
            localStorage.setItem(`batchPath_${activeGame}`, path);
            push("system", `Batch selected: ${path}`);
            setShowBatchSelector(false);
          }}
          onAddFavorite={handleAddFavorite}
          onClose={() => setShowBatchSelector(false)}
          push={push}
        />
      )}
    </div>
  );
}
