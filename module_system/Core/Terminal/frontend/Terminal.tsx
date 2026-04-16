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
  const [showBatchSelector, setShowBatchSelector] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  useEffect(() => {
    const game = localStorage.getItem("activeGameId");
    setActiveGame(game);

    const savedBatch = localStorage.getItem(`batchPath_${game}`);
    if (savedBatch) setBatchPath(savedBatch);

    const fav = JSON.parse(localStorage.getItem("favoriteBatches") || "[]");
    setFavoriteBatches(fav);
  }, []);

  const push = (type: TerminalMessage["type"], text: string) => {
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

  const controlServer = async (action: "start" | "stop" | "restart") => {
    if (!batchPath) return push("error", "No batch selected");

    push("system", `Server ${action}`);

    const res = await fetch("/api/terminal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, batchPath }),
    });

    const data = await res.json();

    if (data.error) return push("error", data.error);
    if (data.output) push("output", data.output);

    if (action === "start") setStatus("RUNNING");
    if (action === "stop") setStatus("STOPPED");
    if (action === "restart") setStatus("RUNNING");
  };

  const executeCommand = async (cmd?: string) => {
    const command = cmd ?? input;
    if (!command.trim()) return;

    push("command", command);
    setInput("");

    const res = await fetch("/api/terminal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "command", command }),
    });

    const data = await res.json();

    if (data.error) push("error", data.error);
    if (data.output) push("output", data.output);
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

        {/* ✅ THIS IS YOUR MISSING BUTTON */}
        <button onClick={() => setShowBatchSelector(true)}>
          <FaFile /> Batch
        </button>

        <button onClick={() => setAutoScroll((v) => !v)}>
          <FaArrowsAltV /> Scroll
        </button>
      </div>

      <div className="terminal-log">
        {messages.map((m) => (
          <div key={m.id} className={`log ${m.type}`}>
            [{m.time}] {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <CommandInput
        value={input}
        onChange={setInput}
        onEnter={executeCommand}
        disabled={!batchPath}
      />

      {showBatchSelector && (
        <BatchSelector
          favoriteBatches={favoriteBatches}
          batchPath={batchPath}
          onSelectBatch={(p: string) => {
            setBatchPath(p);
            localStorage.setItem(`batchPath_${activeGame}`, p);
            setShowBatchSelector(false);
            push("system", `Batch selected: ${p}`);
          }}
          onUpdateFavorites={setFavoriteBatches}
          onClose={() => setShowBatchSelector(false)}
          push={push}
        />
      )}
    </div>
  );
}
