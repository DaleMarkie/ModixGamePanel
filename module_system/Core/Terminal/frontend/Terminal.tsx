"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaPlay, FaStop, FaRedo, FaTerminal } from "react-icons/fa";

interface Log {
  id: number;
  text: string;
  type: "system" | "error" | "output";
  time: string;
}

export default function Terminal() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [status, setStatus] = useState<"RUNNING" | "STOPPED">("STOPPED");

  const wsRef = useRef<WebSocket | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // ---------------- LOG PUSH ----------------
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

  // ---------------- API CALLS ----------------
  const callAPI = async (action: "start" | "stop" | "restart") => {
    push("system", `Sending ${action}...`);

    const res = await fetch("/api/terminal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      push("error", data.error || "Request failed");
      return;
    }

    push("output", data.output || "OK");

    // safer status handling (backend doesn't always send status)
    if (action === "start") setStatus("RUNNING");
    if (action === "stop") setStatus("STOPPED");
    if (action === "restart") setStatus("RUNNING");
  };

  // ---------------- STATUS CHECK ----------------
  const refreshStatus = async () => {
    try {
      const res = await fetch("/api/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status" }),
      });

      const data = await res.json();

      if (data.running === true) setStatus("RUNNING");
      if (data.running === false) setStatus("STOPPED");
    } catch {
      setStatus("STOPPED");
    }
  };

  // ---------------- WEBSOCKET LIVE LOGS ----------------
  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket("ws://localhost:2010/ws/terminal");
      wsRef.current = ws;

      ws.onopen = () => {
        push("system", "Connected to server logs");
      };

      ws.onmessage = (event) => {
        push("output", event.data);
      };

      ws.onerror = () => {
        push("error", "WebSocket error");
      };

      ws.onclose = () => {
        push("error", "Disconnected (reconnecting...)");
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      wsRef.current?.close();
    };
  }, []);

  // ---------------- INIT STATUS ----------------
  useEffect(() => {
    refreshStatus();
  }, []);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // ---------------- UI ----------------
  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>
          <FaTerminal /> Modix Terminal
        </h2>

        <div>
          <b>Status:</b>{" "}
          <span style={{ color: status === "RUNNING" ? "lime" : "red" }}>
            {status}
          </span>
        </div>
      </div>

      {/* BUTTONS */}
      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
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
      <div
        style={{
          marginTop: 20,
          height: 400,
          overflow: "auto",
          background: "#0b0b0b",
          color: "#00ff00",
          padding: 10,
          borderRadius: 6,
        }}
      >
        {logs.map((l) => (
          <div key={l.id}>
            [{l.time}] {l.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
