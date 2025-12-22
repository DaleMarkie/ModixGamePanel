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

type MessageType = "system" | "command" | "output" | "error";

interface TerminalMessage {
  id: number;
  type: MessageType;
  text: string;
  time: string;
}

export default function Terminal() {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [input, setInput] = useState("");
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [status, setStatus] = useState<"RUNNING" | "STOPPED">("STOPPED");
  const [autoScroll, setAutoScroll] = useState(true);

  const endRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll inside terminal only */
  useEffect(() => {
    if (autoScroll) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, autoScroll]);

  /* Load active game */
  useEffect(() => {
    const game = localStorage.getItem("activeGameId");
    setActiveGame(game);

    push(
      "system",
      game
        ? `Connected to ${game} server console`
        : "No active game session selected"
    );
  }, []);

  const push = (type: MessageType, text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        type,
        text,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const sendCommand = async (cmd: string) => {
    if (!cmd.trim() || !activeGame) return;

    push("command", cmd);
    setInput("");

    try {
      const res = await fetch("/api/terminal/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: activeGame,
          command: cmd,
        }),
      });

      const data = await res.json();

      if (data.output) push("output", data.output);
      if (data.error) push("error", data.error);
    } catch {
      push("error", "Server unreachable.");
    }
  };

  const control = (action: "start" | "stop" | "restart") => {
    push("system", `Server ${action.toUpperCase()} issued`);
    setStatus(action === "start" ? "RUNNING" : "STOPPED");
    sendCommand(action);
  };

  const changeBatch = () => {
    const path = prompt("Enter new batch file path:");
    if (!path) return;
    push("system", `Batch file changed to: ${path}`);
    localStorage.setItem("batchPath", path);
  };

  return (
    <div className="modern-terminal">
      {/* HEADER */}
      <div className="terminal-top">
        <div className="left">
          <FaTerminal />
          <span>{activeGame || "No Active Game"}</span>
        </div>
        <div className="right">
          <FaCircle className={status === "RUNNING" ? "green" : "red"} />
          <span>{status}</span>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="terminal-controls">
        <button onClick={() => control("start")} disabled={!activeGame}>
          <FaPlay /> Start
        </button>
        <button onClick={() => control("stop")} disabled={!activeGame}>
          <FaStop /> Stop
        </button>
        <button onClick={() => control("restart")} disabled={!activeGame}>
          <FaRedo /> Restart
        </button>
        <button onClick={changeBatch}>
          <FaFile /> Change Batch
        </button>
        <button
          onClick={() => setAutoScroll((prev) => !prev)}
          className={autoScroll ? "active-auto" : ""}
        >
          <FaArrowsAltV /> Auto-Scroll
        </button>
      </div>

      {/* COMMAND INPUT UNDER BUTTONS */}
      <div className="terminal-input-bar">
        <span className="prompt">$</span>
        <input
          value={input}
          disabled={!activeGame}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendCommand(input)}
          placeholder="Type server command..."
        />
        <span className="cursor" />
      </div>

      {/* LOG AREA */}
      <div className="terminal-log">
        {messages.map((m) => (
          <div key={m.id} className={`log ${m.type}`}>
            <span className="time">[{m.time}]</span> {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
