"use client";

import React, { useEffect, useState } from "react";

// Sample structure for mods
interface ModUpdate {
  modId: string;
  modName: string;
  lastWorkshopUpdate: string; // ISO timestamp
  currentVersion: string; // Optional version info
  description?: string;
}

export default function ModUpdModDebugger() {
  const [updates, setUpdates] = useState<ModUpdate[]>([]);

  useEffect(() => {
    // TODO: Replace with actual API or stored data
    const sampleUpdates: ModUpdate[] = [
      {
        modId: "123456",
        modName: "Better Zombies",
        lastWorkshopUpdate: new Date().toISOString(),
        currentVersion: "v1.2.1",
        description: "Added new zombie types"
      },
      {
        modId: "654321",
        modName: "Survivor Tools",
        lastWorkshopUpdate: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        currentVersion: "v0.9.8",
        description: "Bugfix for crafting recipes"
      }
    ];

    setUpdates(sampleUpdates);
  }, []);

  return (
    <div style={{ padding: "20px", maxHeight: "400px", overflowY: "auto" }}>
      <h2>Mod Updates</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #555", padding: "8px", textAlign: "left" }}>Mod Name</th>
            <th style={{ borderBottom: "1px solid #555", padding: "8px", textAlign: "left" }}>Last Workshop Update</th>
            <th style={{ borderBottom: "1px solid #555", padding: "8px", textAlign: "left" }}>Version</th>
            <th style={{ borderBottom: "1px solid #555", padding: "8px", textAlign: "left" }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {updates.map((mod, idx) => (
            <tr key={idx} style={{ borderBottom: "1px solid #333" }}>
              <td style={{ padding: "8px" }}>{mod.modName}</td>
              <td style={{ padding: "8px" }}>{new Date(mod.lastWorkshopUpdate).toLocaleString()}</td>
              <td style={{ padding: "8px" }}>{mod.currentVersion}</td>
              <td style={{ padding: "8px" }}>{mod.description || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {updates.length === 0 && <p>No updates found for your mods.</p>}
    </div>
  );
}
