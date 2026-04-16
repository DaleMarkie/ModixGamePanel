import { useEffect, useRef, useState } from "react";

export default function TerminalPage() {
  const [logs, setLogs] = useState([]);
  const wsRef = useRef(null);
  const logEndRef = useRef(null);

  // -------------------------
  // AUTO SCROLL
  // -------------------------
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // -------------------------
  // CONNECT WEBSOCKET
  // -------------------------
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/terminal/ws");
    wsRef.current = ws;

    ws.onopen = () => {
      setLogs((prev) => [...prev, "[CONNECTED TO SERVER]"]);
    };

    ws.onmessage = (event) => {
      setLogs((prev) => [...prev, event.data]);
    };

    ws.onclose = () => {
      setLogs((prev) => [...prev, "[DISCONNECTED]"]);
    };

    ws.onerror = () => {
      setLogs((prev) => [...prev, "[WS ERROR]"]);
    };

    return () => ws.close();
  }, []);

  // -------------------------
  // SERVER ACTIONS
  // -------------------------
  const call = async (path) => {
    try {
      await fetch(`http://localhost:8000/terminal/${path}`, {
        method: "POST",
      });
    } catch (err) {
      setLogs((prev) => [...prev, "[REQUEST FAILED]"]);
    }
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <div style={{ display: "flex", height: "100vh", background: "#0b0b0b" }}>
      
      {/* SIDEBAR */}
      <div
        style={{
          width: 200,
          padding: 10,
          borderRight: "1px solid #222",
          color: "#fff",
        }}
      >
        <h3>Server</h3>

        <button onClick={() => call("start")}>Start</button>
        <button onClick={() => call("stop")}>Stop</button>
        <button onClick={() => call("restart")}>Restart</button>
      </div>

      {/* TERMINAL */}
      <div
        style={{
          flex: 1,
          padding: 10,
          color: "#00ff88",
          fontFamily: "monospace",
          overflowY: "auto",
        }}
      >
        {logs.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}