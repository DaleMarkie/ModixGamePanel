"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FiPlay,
  FiStopCircle,
  FiRefreshCw,
  FiTerminal,
  FiActivity,
} from "react-icons/fi";

type Status = "RUNNING" | "STOPPED";

type LogType = "system" | "output" | "error";

interface Log {
  id: string;
  type: LogType;
  text: string;
  time: string;
}

export default function Terminal() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [status, setStatus] = useState<Status>("STOPPED");
  const endRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (type: LogType, text: string) => {
    setLogs((p) => [
      ...p,
      {
        id: crypto.randomUUID(),
        type,
        text,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/terminal/ws");
    wsRef.current = ws;

    ws.onopen = () => addLog("system", "Connected");
    ws.onmessage = (e) => addLog("output", String(e.data));
    ws.onerror = () => addLog("error", "WebSocket error");
    ws.onclose = () => addLog("system", "Disconnected");

    return () => ws.close();
  }, []);

  const call = async (action: "start" | "stop" | "restart") => {
    addLog("system", `Sending ${action}...`);

    try {
      const res = await fetch(`http://localhost:8000/terminal/${action}`, {
        method: "POST",
      });

      const data = await res.json().catch(() => ({}));

      addLog("output", data.status || `${action} sent`);

      setStatus(action === "stop" ? "STOPPED" : "RUNNING");
    } catch {
      addLog("error", "Request failed");
    }
  };

  return (
    <div style={styles.shell}>
      {/* TOP BAR */}
      <div style={styles.top}>
        <div style={styles.title}>
          <FiTerminal /> Modix Terminal
        </div>

        <div style={styles.status}>
          <FiActivity
            style={{
              color: status === "RUNNING" ? "#00ff88" : "#ff4444",
            }}
          />
          {status}
        </div>
      </div>

      {/* BUTTONS */}
      <div style={styles.bar}>
        <button
          style={{ ...styles.btn, background: "#1f8b4c" }}
          onClick={() => call("start")}
        >
          <FiPlay /> Start
        </button>

        <button
          style={{ ...styles.btn, background: "#b02b2b" }}
          onClick={() => call("stop")}
        >
          <FiStopCircle /> Stop
        </button>

        <button
          style={{ ...styles.btn, background: "#b08a2b" }}
          onClick={() => call("restart")}
        >
          <FiRefreshCw /> Restart
        </button>
      </div>

      {/* LOGS */}
      <div style={styles.body}>
        {logs.length === 0 && (
          <div style={{ opacity: 0.5 }}>No logs yet...</div>
        )}

        {logs.map((l) => (
          <div key={l.id} style={{ marginBottom: 4 }}>
            <span style={{ opacity: 0.5 }}>[{l.time}]</span>{" "}
            <span>{l.text}</span>
          </div>
        ))}

        <div ref={endRef} />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#0b0b12",
    color: "#eaeaea",
    fontFamily: "monospace",
  },

  top: {
    display: "flex",
    justifyContent: "space-between",
    padding: 12,
    borderBottom: "1px solid #222",
  },

  title: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  status: {
    display: "flex",
    gap: 6,
    alignItems: "center",
  },

  bar: {
    display: "flex",
    gap: 10,
    padding: 10,
    borderBottom: "1px solid #1f1f1f",
  },

  btn: {
    padding: "8px 12px",
    border: "none",
    color: "white",
    cursor: "pointer",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },

  body: {
    flex: 1,
    padding: 10,
    overflowY: "auto",
  },
};
