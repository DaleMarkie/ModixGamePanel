"use client";

import React, { useEffect, useState } from "react";
import "./ModAlerts.css";
interface ModAlert {
  id: string;
  modName: string;
  message: string;
  type: "info" | "warning" | "error";
  timestamp: string; // ISO string
  link?: string;
}

const alertColors: Record<ModAlert["type"], string> = {
  info: "#2f86eb",
  warning: "#f5a623",
  error: "#e53935",
};

export default function ModAlerts() {
  const [alerts, setAlerts] = useState<ModAlert[]>([]);

  useEffect(() => {
    // TODO: Replace this with dynamic alerts from Workshop or server
    const sampleAlerts: ModAlert[] = [
      {
        id: "1",
        modName: "Better Zombies",
        message: "This mod conflicts with 'Zombie Enhancer'.",
        type: "warning",
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        modName: "Survivor Tools",
        message: "New update available (v0.9.8).",
        type: "info",
        timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
        link: "https://steamcommunity.com/sharedfiles/filedetails/?id=654321",
      },
      {
        id: "3",
        modName: "Apocalypse Sounds",
        message: "Mod failed to load due to missing dependency.",
        type: "error",
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
    ];

    setAlerts(sampleAlerts);
  }, []);

  return (
    <div style={{ padding: "20px", maxHeight: "400px", overflowY: "auto" }}>
      <h2>Mod Alerts</h2>
      {alerts.length === 0 ? (
        <p>No alerts currently.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {alerts.map((alert) => (
            <li
              key={alert.id}
              style={{
                backgroundColor: alertColors[alert.type] + "20",
                borderLeft: `5px solid ${alertColors[alert.type]}`,
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "5px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{alert.modName}</strong>
                <small>{new Date(alert.timestamp).toLocaleString()}</small>
              </div>
              <p style={{ margin: "5px 0" }}>
                {alert.message}{" "}
                {alert.link && (
                  <a
                    href={alert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: alertColors[alert.type], textDecoration: "underline" }}
                  >
                    Details
                  </a>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
