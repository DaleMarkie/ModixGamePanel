"use client";
import React, { useState, useEffect } from "react";
import "./Activity.css";

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

// Realistic server activity logs (keep your CSS unchanged)
const dummyLogs: ActivityLog[] = [
  {
    id: "1",
    user: "Alice",
    action: "Viewed Dashboard page",
    timestamp: "2025-09-12 14:32",
  },
  {
    id: "2",
    user: "Bob",
    action: "Added mod 'SuperZombies v2' to servertest.ini",
    timestamp: "2025-09-12 13:50",
  },
  {
    id: "3",
    user: "Charlie",
    action: "Removed mod 'BetterLoot v1.3' from servertest.ini",
    timestamp: "2025-09-11 18:10",
  },
  {
    id: "4",
    user: "Alice",
    action: "Edited server.ini: MaxPlayers changed from 10 to 12",
    timestamp: "2025-09-11 17:55",
  },
  {
    id: "5",
    user: "Admin",
    action: "Viewed Mods page",
    timestamp: "2025-09-11 17:30",
  },
];

export default function Activity() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    // Replace this with API call later
    setLogs(dummyLogs);
  }, []);

  return (
    <section className="card activity-card">
      <h3>📜 Activity Logs</h3>
      <div className="logs-container">
        {logs.length > 0 ? (
          <ul>
            {logs.map((log) => (
              <li key={log.id}>
                <span className="log-time">[{log.timestamp}]</span>{" "}
                <span className="log-user">{log.user}</span> — {log.action}
              </li>
            ))}
          </ul>
        ) : (
          <p>No activity recorded.</p>
        )}
      </div>
    </section>
  );
}
