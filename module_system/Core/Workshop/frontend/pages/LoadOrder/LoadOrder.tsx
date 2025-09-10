"use client";

import React, { useEffect, useState } from "react";

interface LoadOrderEntry {
  modId: string;
  modName: string;
  loadIndex: number;
}

export default function LoadOrder() {
  const [loadOrder, setLoadOrder] = useState<LoadOrderEntry[]>([]);

  useEffect(() => {
    // TODO: Replace with actual data from server or filesystem
    const sampleLoadOrder: LoadOrderEntry[] = [
      { modId: "123456", modName: "Better Zombies", loadIndex: 1 },
      { modId: "654321", modName: "Survivor Tools", loadIndex: 2 },
      { modId: "111222", modName: "Extra Weapons", loadIndex: 3 },
    ];
    setLoadOrder(sampleLoadOrder);
  }, []);

  return (
    <div style={{ padding: "20px", maxHeight: "400px", overflowY: "auto" }}>
      <h2>Load Order</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{
                borderBottom: "1px solid #555",
                padding: "8px",
                textAlign: "left",
              }}
            >
              #
            </th>
            <th
              style={{
                borderBottom: "1px solid #555",
                padding: "8px",
                textAlign: "left",
              }}
            >
              Mod Name
            </th>
            <th
              style={{
                borderBottom: "1px solid #555",
                padding: "8px",
                textAlign: "left",
              }}
            >
              Mod ID
            </th>
          </tr>
        </thead>
        <tbody>
          {loadOrder.map((mod) => (
            <tr key={mod.modId} style={{ borderBottom: "1px solid #333" }}>
              <td style={{ padding: "8px" }}>{mod.loadIndex}</td>
              <td style={{ padding: "8px" }}>{mod.modName}</td>
              <td style={{ padding: "8px" }}>{mod.modId}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {loadOrder.length === 0 && <p>No mods in load order.</p>}
    </div>
  );
}
