"use client";

import React, { useEffect, useMemo, useState } from "react";
import "./Activity.css";

/* ---------------------------
   Types
--------------------------- */
export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string; // ISO or locale str
  duration?: string;
}

interface Session {
  id: string;
  username: string;
  ip: string;
  device: string;
  startTime: number; // epoch ms
  lastTouch?: number;
}

interface SecurityInsights {
  lastLogin?: string;
  lastLogout?: string;
  loginCount: number;
  failedAttempts: number;
  ipHistory: string[];
  devices: string[];
  loginTimestamps: number[]; // for trends
}

/* ---------------------------
   Storage keys
--------------------------- */
const LOG_KEY = "modix_activity_logs";
const INSIGHT_KEY = "modix_security_insights";
const SESSIONS_KEY = "modix_sessions";
const ACHIEV_KEY = "modix_achievements";
const CURRENT_USER_KEY = "modix_user";

/* ---------------------------
   Util helpers
--------------------------- */
const nowIso = () => new Date().toISOString();
const uid = () =>
  crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 9);

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
};
const writeJson = (key: string, v: any) => {
  localStorage.setItem(key, JSON.stringify(v));
};

/* ---------------------------
   Core storage functions
--------------------------- */
const getLogs = (): ActivityLog[] => readJson<ActivityLog[]>(LOG_KEY, []);
const saveLogs = (logs: ActivityLog[]) => writeJson(LOG_KEY, logs);

const getInsights = (): Record<string, SecurityInsights> =>
  readJson<Record<string, SecurityInsights>>(INSIGHT_KEY, {});
const saveInsights = (ins: Record<string, SecurityInsights>) =>
  writeJson(INSIGHT_KEY, ins);

const getSessions = (): Session[] => readJson<Session[]>(SESSIONS_KEY, []);
const saveSessions = (s: Session[]) => writeJson(SESSIONS_KEY, s);

const getAchievements = (): Record<string, string[]> =>
  readJson<Record<string, string[]>>(ACHIEV_KEY, {});
const saveAchievements = (a: Record<string, string[]>) =>
  writeJson(ACHIEV_KEY, a);

/* ---------------------------
   Logging + recording
--------------------------- */
export const addLog = (user: string, action: string, duration?: string) => {
  const logs = getLogs();
  logs.unshift({
    id: uid(),
    user,
    action,
    timestamp: new Date().toLocaleString(),
    duration,
  });
  if (logs.length > 500) logs.length = 500;
  saveLogs(logs);
  window.dispatchEvent(new StorageEvent("storage", { key: LOG_KEY }));
};

export const recordLogin = (username: string) => {
  const sessions = getSessions();
  const device = navigator.userAgent || "unknown device";
  const ip = `192.168.0.${Math.floor(Math.random() * 220) + 2}`;
  const session: Session = {
    id: uid(),
    username,
    ip,
    device,
    startTime: Date.now(),
    lastTouch: Date.now(),
  };
  sessions.push(session);
  saveSessions(sessions);

  const ins = getInsights();
  const cur =
    ins[username] ||
    ({
      loginCount: 0,
      failedAttempts: 0,
      ipHistory: [],
      devices: [],
      loginTimestamps: [],
    } as SecurityInsights);

  cur.lastLogin = nowIso();
  cur.loginCount = (cur.loginCount || 0) + 1;
  cur.ipHistory = [ip, ...(cur.ipHistory || [])].slice(0, 10);
  cur.devices = [device, ...(cur.devices || [])].slice(0, 10);
  cur.loginTimestamps = [Date.now(), ...(cur.loginTimestamps || [])].slice(
    0,
    200
  );

  ins[username] = cur;
  saveInsights(ins);
  addLog(username, "Signed in");
  window.dispatchEvent(new StorageEvent("storage", { key: INSIGHT_KEY }));
  window.dispatchEvent(new StorageEvent("storage", { key: SESSIONS_KEY }));
};

export const recordLogout = (username: string) => {
  let sessions = getSessions();
  const userSessions = sessions.filter((s) => s.username === username);
  if (userSessions.length > 0) {
    const last = userSessions[userSessions.length - 1];
    sessions = sessions.filter((s) => s.id !== last.id);
    saveSessions(sessions);
  }

  const ins = getInsights();
  ins[username] = {
    ...(ins[username] || ({} as SecurityInsights)),
    lastLogout: nowIso(),
  };
  saveInsights(ins);

  let duration = undefined;
  if (userSessions.length > 0) {
    const last = userSessions[userSessions.length - 1];
    const seconds = Math.floor((Date.now() - last.startTime) / 1000);
    duration =
      seconds > 60
        ? `${Math.floor(seconds / 60)}m ${seconds % 60}s`
        : `${seconds}s`;
  }

  addLog(username, "Signed out", duration);
  window.dispatchEvent(new StorageEvent("storage", { key: INSIGHT_KEY }));
  window.dispatchEvent(new StorageEvent("storage", { key: SESSIONS_KEY }));
};

export const recordFailedLogin = (username: string) => {
  const ins = getInsights();
  const cur =
    ins[username] ||
    ({
      loginCount: 0,
      failedAttempts: 0,
      ipHistory: [],
      devices: [],
      loginTimestamps: [],
    } as SecurityInsights);

  cur.failedAttempts = (cur.failedAttempts || 0) + 1;
  const ip = `10.0.0.${Math.floor(Math.random() * 200) + 2}`;
  cur.ipHistory = [ip, ...(cur.ipHistory || [])].slice(0, 10);
  ins[username] = cur;
  saveInsights(ins);
  addLog(username, "Failed login attempt");
  window.dispatchEvent(new StorageEvent("storage", { key: INSIGHT_KEY }));
};

/* ---------------------------
   Admin actions
--------------------------- */
export const forceLogoutSession = (sessionId: string) => {
  let sessions = getSessions();
  const found = sessions.find((s) => s.id === sessionId);
  if (!found) return;
  sessions = sessions.filter((s) => s.id !== sessionId);
  saveSessions(sessions);
  addLog(found.username, `Session ${sessionId} force-logged out by Admin`);
  window.dispatchEvent(new StorageEvent("storage", { key: SESSIONS_KEY }));
};

export const revokeAllUserSessions = (username: string) => {
  let sessions = getSessions();
  sessions = sessions.filter((s) => s.username !== username);
  saveSessions(sessions);
  addLog(username, `All sessions revoked for ${username}`);
  window.dispatchEvent(new StorageEvent("storage", { key: SESSIONS_KEY }));
};

/* ---------------------------
   Achievements
--------------------------- */
const maybeAwardAchievements = (username: string) => {
  const ach = getAchievements();
  const userAch = new Set(ach[username] || []);
  const ins = getInsights()[username];

  if (ins) {
    if (ins.loginCount >= 1 && !userAch.has("First login"))
      userAch.add("First login");
    if (ins.loginCount >= 50 && !userAch.has("50 logins"))
      userAch.add("50 logins");
    if ((ins.loginTimestamps || []).length >= 10 && !userAch.has("Active user"))
      userAch.add("Active user");
  }

  ach[username] = Array.from(userAch);
  saveAchievements(ach);
  window.dispatchEvent(new StorageEvent("storage", { key: ACHIEV_KEY }));
};

/* ---------------------------
   UI: Sparklines
--------------------------- */
function Sparkline({ points = [] }: { points: number[] }) {
  if (!points || points.length === 0) return <svg className="sparkline" />;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 120;
  const h = 28;
  const len = points.length;
  const step = w / Math.max(len - 1, 1);
  const norm = (v: number) =>
    max === min ? h / 2 : h - ((v - min) / (max - min)) * h;
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${norm(p)}`)
    .join(" ");
  return (
    <svg className="sparkline" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path
        d={d}
        fill="none"
        stroke="#2e7d32"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------------------------
   Main Component
--------------------------- */
export default function ActivityAdvanced({
  activeUser,
}: {
  activeUser?: string;
}) {
  const [logs, setLogs] = useState<ActivityLog[]>(getLogs());
  const [insightsMap, setInsightsMap] = useState<
    Record<string, SecurityInsights>
  >(getInsights());
  const [sessions, setSessions] = useState<Session[]>(getSessions());
  const [ach, setAch] = useState<Record<string, string[]>>(getAchievements());
  const [selectedUser, setSelectedUser] = useState<string | null>(
    activeUser || null
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === LOG_KEY) setLogs(getLogs());
      if (!e.key || e.key === INSIGHT_KEY) setInsightsMap(getInsights());
      if (!e.key || e.key === SESSIONS_KEY) setSessions(getSessions());
      if (!e.key || e.key === ACHIEV_KEY) setAch(getAchievements());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSelectedUser(parsed.username || null);
        } catch {}
      }
    }
  }, [selectedUser]);

  const username =
    selectedUser ||
    activeUser ||
    JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null")?.username ||
    null;
  const insights = username ? insightsMap[username] || null : null;
  const userSessions = username
    ? sessions.filter((s) => s.username === username)
    : [];

  useEffect(() => {
    if (username) {
      maybeAwardAchievements(username);
      setAch(getAchievements());
    }
  }, [username, insightsMap]);

  const loginTrendPoints = useMemo(() => {
    if (!insights) return [];
    const days = 14;
    const now = Date.now();
    const buckets = Array(days).fill(0);
    // Safe: use empty array if loginTimestamps undefined
    (insights.loginTimestamps || []).forEach((ts) => {
      const daysAgo = Math.floor((now - ts) / 86400000);
      if (daysAgo < days) buckets[days - 1 - daysAgo] += 1;
    });
    return buckets;
  }, [insights]);

  const computeRiskScore = (): { score: number; reasons: string[] } => {
    if (!insights) return { score: 5, reasons: ["No data"] };
    let score = 20;
    const reasons: string[] = [];
    if (insights.failedAttempts) {
      score += Math.min(40, insights.failedAttempts * 6);
      if (insights.failedAttempts > 3)
        reasons.push(`${insights.failedAttempts} failed logins`);
    }
    if ((insights.devices || []).length > 3) {
      score += 10;
      reasons.push("Multiple devices");
    }
    if ((insights.ipHistory || []).length > 3) {
      score += 10;
      reasons.push("IP changes");
    }
    const hours = (insights.loginTimestamps || []).map((t) =>
      new Date(t).getHours()
    );
    const nightCount = hours.filter((h) => h >= 0 && h <= 5).length;
    if (nightCount > Math.max(1, (hours.length || 1) / 3)) {
      score += 10;
      reasons.push("Unusual login hours");
    }
    score = Math.min(100, Math.max(0, score));
    return { score, reasons };
  };

  const { score: riskScore, reasons: riskReasons } = computeRiskScore();

  const handleForceLogout = (sId: string) => {
    let s = getSessions();
    const picked = s.find((x) => x.id === sId);
    if (!picked) return;
    s = s.filter((x) => x.id !== sId);
    saveSessions(s);
    addLog(picked.username, `Session ${picked.id} force logged out by Admin`);
    setSessions(getSessions());
    window.dispatchEvent(new StorageEvent("storage", { key: SESSIONS_KEY }));
  };

  const handleRevokeAll = (uname: string) => {
    let s = getSessions();
    s = s.filter((x) => x.username !== uname);
    saveSessions(s);
    addLog(uname, `All sessions revoked by Admin`);
    setSessions(getSessions());
    window.dispatchEvent(new StorageEvent("storage", { key: SESSIONS_KEY }));
  };

  const knownUsers = useMemo(() => {
    const users = new Set<string>();
    getLogs().forEach((l) => users.add(l.user));
    Object.keys(getInsights()).forEach((u) => users.add(u));
    getSessions().forEach((s) => users.add(s.username));
    return Array.from(users).sort();
  }, [logs, insightsMap, sessions]);

  return (
    <div className="activity-advanced">
      {/* LEFT COL */}
      <div className="left-col">
        {/* Users */}
        <div className="card user-select-card">
          <h3>👥 Users</h3>
          <div className="users-list">
            <select
              value={username || ""}
              onChange={(e) => setSelectedUser(e.target.value || null)}
            >
              <option value="">-- choose a user --</option>
              {knownUsers.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            {username && (
              <div className="mini-actions">
                <button onClick={() => handleRevokeAll(username)}>
                  Revoke All Sessions
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(username)}
                >
                  Copy Username
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security */}
        <div className="card security-card">
          <h3>🔒 Security Overview</h3>
          {username && insights ? (
            <>
              <div className="security-grid">
                <div>
                  <label>Last login</label>
                  <div>{insights.lastLogin || "—"}</div>
                </div>
                <div>
                  <label>Last logout</label>
                  <div>{insights.lastLogout || "—"}</div>
                </div>
                <div>
                  <label>Total logins</label>
                  <div>{insights.loginCount || 0}</div>
                </div>
                <div>
                  <label>Failed attempts</label>
                  <div>{insights.failedAttempts || 0}</div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label>Last known IPs</label>
                  <div className="chip-row">
                    {(insights.ipHistory || []).slice(0, 5).map((ip) => (
                      <span className="chip" key={ip}>
                        {ip}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label>Devices (recent)</label>
                  <div className="chip-row">
                    {(insights.devices || []).slice(0, 4).map((d) => (
                      <span className="chip" key={d}>
                        {d.slice(0, 30)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="trend-row">
                <div className="trend">
                  <label>Login trend (last 14 days)</label>
                  <Sparkline points={loginTrendPoints} />
                </div>
                <div className="risk">
                  <label>Risk score</label>
                  <div
                    className={`risk-pill ${
                      riskScore > 60
                        ? "high"
                        : riskScore > 30
                        ? "medium"
                        : "low"
                    }`}
                  >
                    {riskScore}%
                    <div className="risk-reasons">
                      {riskReasons.join(" • ")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="achievements">
                <label>Achievements</label>
                <div className="chip-row">
                  {(getAchievements()[username] || []).map((a) => (
                    <span className="badge" key={a}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p>Select a user to view security insights.</p>
          )}
        </div>

        {/* Sessions */}
        <div className="card sessions-card">
          <h3>🔁 Active Sessions</h3>
          {username ? (
            <>
              {userSessions.length === 0 ? (
                <p>No active sessions for this user.</p>
              ) : (
                <table className="sessions-table">
                  <thead>
                    <tr>
                      <th>IP</th>
                      <th>Device</th>
                      <th>Started</th>
                      <th>Age</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userSessions.map((s) => {
                      const ageSec = Math.floor(
                        (Date.now() - s.startTime) / 1000
                      );
                      const age =
                        ageSec > 60
                          ? `${Math.floor(ageSec / 60)}m`
                          : `${ageSec}s`;
                      return (
                        <tr key={s.id}>
                          <td>{s.ip}</td>
                          <td title={s.device}>{s.device.slice(0, 40)}</td>
                          <td>{new Date(s.startTime).toLocaleString()}</td>
                          <td>{age}</td>
                          <td>
                            <button onClick={() => handleForceLogout(s.id)}>
                              Force Logout
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            <p>Select a user to view sessions.</p>
          )}
        </div>
      </div>

      {/* RIGHT COL */}
      <div className="right-col">
        {/* Logs */}
        <div className="card logs-card">
          <h3>📜 Activity Logs</h3>
          <div className="logs-list">
            <ul>
              {logs.slice(0, 100).map((l) => (
                <li key={l.id}>
                  <span className="t">{l.timestamp}</span>
                  <span className="u">{l.user}</span>{" "}
                  <span className="a">{l.action}</span>{" "}
                  {l.duration && <span className="d">({l.duration})</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quick Tools */}
        <div className="card quick-tools">
          <h3>🛠️ Quick Tools</h3>
          <div className="tools-grid">
            <button onClick={() => alert("Trigger backup!")}>
              Backup Logs
            </button>
            <button onClick={() => alert("Export CSV!")}>Export CSV</button>
            <button
              onClick={() => addLog(username || "Unknown", "Manual trigger")}
            >
              Manual Log
            </button>
            <button onClick={() => recordFailedLogin(username || "Unknown")}>
              Fake Failed Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
