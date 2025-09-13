"use client";

import { useState, useEffect } from "react";
import "./subscriptions.css";
import { useUser } from "../../UserContext";

const VPS_API = "http://80.40.22.31:2010"; // your VPS

// Example logs for now (replace with API later)
const dummyLogs = [
  { license: "LIC123", user: "user1", action: "redeemed", timestamp: "2025-09-10T12:30:00Z" },
  { license: "LIC124", user: "user2", action: "redeemed", timestamp: "2025-09-11T09:15:00Z" },
];

const Subscriptions = () => {
  const { user } = useUser();
  const [license, setLicense] = useState("");
  const [expires, setExpires] = useState<Date | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentLicense, setCurrentLicense] = useState<any>(null);
  const [logs, setLogs] = useState(dummyLogs);

  const fetchLicense = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${VPS_API}/api/licenses?user=${user.username}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.length > 0) {
        const active = data.find((l: any) => l.status === "Active");
        if (active) {
          setCurrentLicense(active);
          setExpires(new Date(active.expiresAt));
        }
      }
    } catch (err) {
      console.error("Error fetching license:", err);
    }
  };

  useEffect(() => {
    fetchLicense();
  }, [user]);

  const handleRedeem = async () => {
    if (!license) return setMessage("Enter a license code.");
    if (!user) return setMessage("User not loaded.");

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${VPS_API}/api/licenses/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: license.toUpperCase(),
          user: user.username,
          ip: "80.40.22.31",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCurrentLicense(data.license);
        setExpires(new Date(data.license.expiresAt));
        setMessage(`License redeemed! Plan: ${data.license.plan}`);
        setLicense("");

        const newLog = {
          license: data.license.id,
          user: user.username,
          action: "redeemed",
          timestamp: new Date().toISOString(),
        };
        setLogs((prev) => [newLog, ...prev]);
      } else {
        setMessage(data.detail || "Failed to redeem license.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate remaining days for color-coded status
  const remainingDays = expires ? Math.ceil((expires.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const statusColor = remainingDays > 3 ? "green" : remainingDays > 0 ? "orange" : "red";

  return (
    <section className="card subscription-card">
      <h3>📦 Subscription</h3>

      {/* Big, obvious panel */}
      <div className="subscription-panel" style={{ borderLeft: `6px solid ${statusColor}` }}>
        {currentLicense ? (
          <>
            <div className="plan-header">
              <span className="plan-icon">💎</span>
              <h2 className="plan-name">{currentLicense.plan}</h2>
            </div>
            <p className="plan-expiration">
              Expires on: <strong>{expires?.toLocaleString()}</strong> — <strong>{remainingDays} days left</strong>
            </p>
          </>
        ) : (
          <p>No active subscription.</p>
        )}
      </div>

      <div className="redeem-section">
        <input
          type="text"
          placeholder="Enter license code"
          value={license}
          onChange={(e) => setLicense(e.target.value.toUpperCase())}
          className="license-input"
        />
        <button className="upgrade-btn" onClick={handleRedeem} disabled={loading}>
          {loading ? "Validating..." : "Redeem License"}
        </button>
      </div>

      {message && <p className="license-message">{message}</p>}

      {/* Logs Section */}
      <div className="logs-section">
        <h4>📜 Redemption Logs</h4>
        {logs.length > 0 ? (
          <div className="logs-container">
            {logs.map((log, idx) => (
              <div key={idx} className="log-entry">
                <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                <span className="log-user">{log.user}</span>
                <span className="log-action">
                  {log.action} <strong>{log.license}</strong>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-logs">No logs yet.</p>
        )}
      </div>
    </section>
  );
};

export default Subscriptions;
