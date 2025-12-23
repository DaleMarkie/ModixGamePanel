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
  FaClock,
} from "react-icons/fa";
import "./terminal.css";

import CommandInput from "./CommandInput";
import BatchSelector from "./BatchSelector";

// Scheduler modal to pick time and days
function SchedulerModal({ gameId, onClose, push }: any) {
  const [hour, setHour] = useState(3);
  const [minute, setMinute] = useState(0);
  const [days, setDays] = useState<string[]>(["mon"]);
  const allDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const toggleDay = (day: string) =>
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  const saveSchedule = async () => {
    try {
      const res = await fetch("/api/scheduler/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: gameId, hour, minute, days }),
      });
      if (!res.ok) throw new Error("Failed to add schedule");
      push(
        "system",
        `Scheduled restart at ${hour}:${minute} on ${days.join(", ")}`
      );
      onClose();
    } catch (e: any) {
      push("error", e.message);
    }
  };

  return (
    <div className="batch-modal">
      <div className="batch-modal-content">
        <h3>Schedule Server Restart</h3>
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <label>
            Hour:{" "}
            <input
              type="number"
              min={0}
              max={23}
              value={hour}
              onChange={(e) => setHour(parseInt(e.target.value))}
            />
          </label>
          <label>
            Minute:{" "}
            <input
              type="number"
              min={0}
              max={59}
              value={minute}
              onChange={(e) => setMinute(parseInt(e.target.value))}
            />
          </label>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {allDays.map((d) => (
            <button
              key={d}
              style={{
                padding: "6px",
                borderRadius: "6px",
                background: days.includes(d) ? "#22c55e" : "#26263c",
                color: "#fff",
              }}
              onClick={() => toggleDay(d)}
            >
              {d.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="batch-actions" style={{ marginTop: "12px" }}>
          <button onClick={saveSchedule}>Save</button>
          <button className="close-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [showScheduler, setShowScheduler] = useState(false);
  const [osName, setOsName] = useState("linux");

  const endRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (autoScroll) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, autoScroll]);

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
    const defaults = ["start", "stop", "restart", "status", "save", "backup"];
    setSavedCommands([...new Set([...defaults, ...saved])]);

    if (game) {
      const ws = new WebSocket(`ws://localhost:8000/api/terminal/ws/${game}`);
      wsRef.current = ws;
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          push(data.type || "output", data.text);
        } catch {
          push("error", "Bad websocket message");
        }
      };
      ws.onclose = () => push("system", "WebSocket disconnected");
      ws.onerror = () => push("error", "WebSocket error");
      return () => ws.close();
    }
  }, []);

  const push = (type: TerminalMessage["type"], text: string) => {
    setMessages((prev) => {
      const updated = [
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
          JSON.stringify(updated)
        );
      return updated;
    });
  };

  const addCustomCommand = (cmd: string) => {
    if (!cmd.trim() || savedCommands.includes(cmd)) return;
    const updated = [...savedCommands, cmd];
    setSavedCommands(updated);
    if (activeGame)
      localStorage.setItem(`commands_${activeGame}`, JSON.stringify(updated));
    push("system", `Custom command added: ${cmd}`);
  };

  const executeCommand = async (command?: string) => {
    const cmd = command ?? input;
    if (!cmd.trim()) return;
    push("command", cmd);
    setInput("");
    if (!savedCommands.includes(cmd)) addCustomCommand(cmd);

    try {
      const res = await fetch("/api/terminal/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: activeGame, command: cmd, batchPath }),
      });
      const data = await res.json();
      if (data.error) push("error", data.error);
      if (data.output) push("output", data.output);
    } catch {
      push("error", "Command failed");
    }
  };

  const controlServer = async (action: "start" | "stop" | "restart") => {
    if (!batchPath) return push("error", "No batch selected");
    push("system", `Server ${action}`);
    await executeCommand(action);
    setStatus(action === "start" ? "RUNNING" : "STOPPED");
  };

  const clearTerminal = () => {
    setMessages([]);
    if (activeGame) localStorage.removeItem(`terminalLogs_${activeGame}`);
    push("system", "Terminal cleared.");
  };

  return (
    <div className="modern-terminal">
      <div className="terminal-top">
        <div className="left">
          <FaTerminal />
          <span>{activeGame || "No Active Game"}</span>
        </div>
        <div className="right">
          <FaCircle className={status === "RUNNING" ? "green" : "red"} />
          <span>{status}</span>
          <span>OS: {osName}</span>
        </div>
      </div>

      <div className="terminal-controls">
        <button onClick={() => controlServer("start")}>
          <FaPlay /> Start
        </button>
        <button onClick={() => controlServer("stop")}>
          <FaStop /> Stop
        </button>
        <button onClick={() => controlServer("restart")}>
          <FaRedo /> Restart
        </button>
        <button onClick={() => setShowBatchSelector(true)}>
          <FaFile /> Change Batch
        </button>
        <button onClick={() => setShowScheduler(true)}>
          <FaClock /> Auto Restart
        </button>
        <button
          onClick={() => setAutoScroll((v) => !v)}
          className={autoScroll ? "active-auto" : ""}
        >
          <FaArrowsAltV /> Auto Scroll
        </button>
        <button onClick={clearTerminal}>🗑️ Clear</button>
      </div>

      <CommandInput
        value={input}
        onChange={setInput}
        onEnter={executeCommand}
        disabled={!activeGame || !batchPath}
        savedCommands={savedCommands}
        onAddCustomCommand={addCustomCommand}
      />

      <div className="terminal-log-wrapper">
        <div className="terminal-log">
          {messages.map((m) => (
            <div key={m.id} className={`log ${m.type}`}>
              <span className="time">[{m.time}]</span> {m.text}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      {showBatchSelector && (
        <BatchSelector
          osName={osName}
          favoriteBatches={favoriteBatches}
          batchPath={batchPath}
          onSelectBatch={(path) => {
            setBatchPath(path);
            if (activeGame)
              localStorage.setItem(`batchPath_${activeGame}`, path);
            push("system", `Batch selected: ${path}`);
            setShowBatchSelector(false);
          }}
          onUpdateFavorites={setFavoriteBatches}
          onClose={() => setShowBatchSelector(false)}
          push={push}
        />
      )}

      {showScheduler && activeGame && (
        <SchedulerModal
          gameId={activeGame}
          onClose={() => setShowScheduler(false)}
          push={push}
        />
      )}
    </div>
  );
}
