"use client";
import React from "react";
import { FaPlay, FaStop, FaRedo, FaFile, FaArrowsAltV } from "react-icons/fa";

interface TerminalControlsProps {
  status: "RUNNING" | "STOPPED";
  autoScroll: boolean;
  controlServer: (action: "start" | "stop" | "restart") => void;
  toggleAutoScroll: () => void;
  clearTerminal: () => void;
  openBatchSelector: () => void;
  canControl: boolean;
}

export default function TerminalControls({
  status,
  autoScroll,
  controlServer,
  toggleAutoScroll,
  clearTerminal,
  openBatchSelector,
  canControl,
}: TerminalControlsProps) {
  return (
    <div className="terminal-controls">
      <button onClick={() => controlServer("start")} disabled={!canControl}>
        <FaPlay /> Start
      </button>
      <button onClick={() => controlServer("stop")} disabled={!canControl}>
        <FaStop /> Stop
      </button>
      <button onClick={() => controlServer("restart")} disabled={!canControl}>
        <FaRedo /> Restart
      </button>
      <button onClick={openBatchSelector}>
        <FaFile /> Change Batch
      </button>
      <button
        onClick={toggleAutoScroll}
        className={autoScroll ? "active-auto" : ""}
      >
        <FaArrowsAltV /> Auto-Scroll
      </button>
      <button onClick={clearTerminal}>🗑️ Clear</button>
    </div>
  );
}
