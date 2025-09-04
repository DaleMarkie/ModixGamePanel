"use client";

import React, { useEffect, useState } from "react";

// Sample data structure
interface ModLog {
  modId: string;
  modName: string;
  filePath: string;
  lastEdited: string; // ISO date string
  changeType: string; // e.g., "Updated", "Deleted", "Added"
  description?: string;
}

export default function ModLogs() {
  const [logs, setLogs] = useState<ModLog[]>([]);

  useEffect(() => {
    // TODO: Replace this with actual file system or server data
    const sampleLogs: ModLog[] = [
      {
        modId: "123456",
        modName: "Better Zombies",
        filePath: "mods/BetterZombies/main.lua",
        lastEdited: new Date().toISOString(),
        changeType: "Updated",
        description: "Fixed zombie spawn issue"
      },
      {
        modId: "654321",
        modName: "Survivor Tools",
        filePath: "mods/SurvivorTools/config.json",
        lastEdited: new Date(Date.now() - 3600 * 1000).toISOString(),
        changeType: "Updated",
        description: "Added new tool recipes"
      }
    ];

    setLogs(sampleLogs);
  }, []);

  return (
    <div style={{ padding: "20px", maxHeight: "400px", overflowY: "auto" }}>
      <h2>Mod Logs</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #555", padding: "8px", textAlign: "left" }}>Mod Name</th>
            <th style={{ borderBottom: "1px solid #555", padding: "8px", textAlign: "left" }}>File Path</th>
            <th style={{ borderBottom: "1px solid #555", padding: "8px", textAlign: "left" }}>Change</th>
            <th style={{ borderBottom: "1px solid #555", padding: "8px", textAlign: "left" }}>Last Edited</th>
            <th style={{ borderBottom: "1px solid #555", padding: "8px", textAlign: "left" }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => (
            <tr key={idx} style={{ borderBottom: "1px solid #333" }}>
              <td style={{ padding: "8px" }}>{log.modName}</td>
              <td style={{ padding: "8px" }}>{log.filePath}</td>
              <td style={{ padding: "8px" }}>{log.changeType}</td>
              <td style={{ padding: "8px" }}>{new Date(log.lastEdited).toLocaleString()}</td>
              <td style={{ padding: "8px" }}>{log.description || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {logs.length === 0 && <p>No mod changes detected.</p>}
    </div>
  );
}
