"use client";
import React, { useState, useEffect } from "react";
import "./Activity.css";

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  duration?: string; // For logout events
}

const ACTIVITY_LOG_KEY = "modix_activity_logs";
const SESSION_KEY = "modix_active_session";

// ---------------------------
// Helpers
// ---------------------------
const getActivityLogs = (): ActivityLog[] => {
  const data = localStorage.getItem(ACTIVITY_LOG_KEY);
  return data ? JSON.parse(data) : [];
};

const saveActivityLogs = (logs: ActivityLog[]) => {
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs));
};

const addLog = (user: string, action: string, duration?: string) => {
  const logs = getActivityLogs();
  const newLog: ActivityLog = {
    id: crypto.randomUUID(),
    user,
    action,
    timestamp: new Date().toLocaleString(),
    duration,
  };
  logs.unshift(newLog); // newest first
  saveActivityLogs(logs);
};

// ---------------------------
// Main Component
// ---------------------------
export default function Activity() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    setLogs(getActivityLogs());

    // Watch for login/logout events from anywhere in app
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ACTIVITY_LOG_KEY) setLogs(getActivityLogs());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
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
                <span className="log-user">{log.user}</span> —{" "}
                <span className="log-action">{log.action}</span>
                {log.duration && (
                  <span className="log-duration">
                    {" "}
                    (Session: {log.duration})
                  </span>
                )}
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

// ---------------------------
// Utility for Login System
// ---------------------------
// Call these inside your login/logout code
export const recordLogin = (username: string) => {
  addLog(username, "Signed in");
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ username, startTime: Date.now() })
  );
};

export const recordLogout = (username: string) => {
  const session = localStorage.getItem(SESSION_KEY);
  let duration = "Unknown";

  if (session) {
    const { startTime } = JSON.parse(session);
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    duration = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }

  addLog(username, "Signed out", duration);
  localStorage.removeItem(SESSION_KEY);
};
