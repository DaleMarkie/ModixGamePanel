"use client";

import React, { useState, useEffect } from "react";
import "./Activity.css";

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  duration?: string;
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

export const addLog = (user: string, action: string, duration?: string) => {
  const logs = getActivityLogs();
  const newLog: ActivityLog = {
    id: crypto.randomUUID(),
    user,
    action,
    timestamp: new Date().toLocaleString(),
    duration,
  };
  logs.unshift(newLog);
  saveActivityLogs(logs);
};

// ---------------------------
// Page View / Login / Logout
// ---------------------------
export const recordPageView = (username: string, page: string) => {
  addLog(username, `Viewed page: ${page}`);
};

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

// ---------------------------
// Activity Component
// ---------------------------
export default function Activity() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [filterUser, setFilterUser] = useState<string>("All");

  useEffect(() => {
    setLogs(getActivityLogs());

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ACTIVITY_LOG_KEY) setLogs(getActivityLogs());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const getUserStats = (username: string) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const userLogs = logs.filter((log) => log.user === username);
    const loginsPastWeek = userLogs.filter(
      (log) => log.action === "Signed in" && new Date(log.timestamp) >= weekAgo
    ).length;

    const pageCounts: Record<string, number> = {};
    userLogs.forEach((log) => {
      if (log.action.startsWith("Viewed page: ")) {
        const page = log.action.replace("Viewed page: ", "");
        pageCounts[page] = (pageCounts[page] || 0) + 1;
      }
    });

    let mostVisitedPage = "N/A";
    if (Object.keys(pageCounts).length > 0) {
      mostVisitedPage = Object.entries(pageCounts).sort(
        (a, b) => b[1] - a[1]
      )[0][0];
    }

    return { loginsPastWeek, mostVisitedPage };
  };

  const users = Array.from(new Set(logs.map((log) => log.user)));

  const displayedLogs =
    filterUser === "All" ? logs : logs.filter((log) => log.user === filterUser);

  return (
    <section className="card activity-card">
      <h3>📜 Activity Logs</h3>

      {/* Filter */}
      {users.length > 1 && (
        <div className="filter-user">
          <label>Filter by user: </label>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
          >
            <option value="All">All</option>
            {users.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Logs */}
      <div className="logs-container">
        {displayedLogs.length > 0 ? (
          <ul>
            {displayedLogs.map((log) => (
              <li key={log.id}>
                <span className="log-time">[{log.timestamp}]</span>{" "}
                <span
                  className="log-user clickable"
                  onClick={() =>
                    setSelectedUser(selectedUser === log.user ? null : log.user)
                  }
                >
                  {log.user}
                </span>{" "}
                — <span className="log-action">{log.action}</span>
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

      {/* Stats Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>📊 {selectedUser} Stats (Past 7 Days)</h4>
            {logs.length > 0 ? (
              (() => {
                const stats = getUserStats(selectedUser);
                return (
                  <>
                    <p>Logins: {stats.loginsPastWeek}</p>
                    <p>Most Visited Page: {stats.mostVisitedPage}</p>
                  </>
                );
              })()
            ) : (
              <p>No stats available.</p>
            )}
            <button
              className="modal-close"
              onClick={() => setSelectedUser(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
