"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaPlay, FaStop, FaRedo, FaCircle } from "react-icons/fa";

import "./terminal.css";

interface TerminalMessage {
  id: number;
  type: "system" | "output" | "error";
  text: string;
  time: string;
}

export default function Terminal() {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [status, setStatus] = useState<"RUNNING" | "STOPPED">("STOPPED");

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const push = (type: TerminalMessage["type"], text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type,
        text,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const controlServer = async (action: "start" | "stop" | "restart") => {
    push("system", `Server ${action}`);

    const res = await fetch(`/api/server/${action}`, {
      method: "POST",
    });

    const data = await res.json();

    if (data.error) {
      push("error", data.error);
      return;
    }

    if (data.output) {
      push("output", data.output);
    }

    setStatus(action === "stop" ? "STOPPED" : "RUNNING");
  };

  return (
    <div className="modern-terminal">
      <div className="terminal-top">
        <div className="left">
          <span>Project Zomboid Server</span>
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
      </div>

      <div className="terminal-log">
        {messages.map((m) => (
          <div key={m.id} className={`log ${m.type}`}>
            [{m.time}] {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
