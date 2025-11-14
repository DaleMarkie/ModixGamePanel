"use client";

import React, { useState } from "react";
import "./Security.css";

export default function Security() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions] = useState([
    {
      id: 1,
      device: "Chrome on Windows",
      location: "UK",
      lastActive: "2 mins ago",
    },
    {
      id: 2,
      device: "Firefox on Android",
      location: "UK",
      lastActive: "Yesterday",
    },
  ]);
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <section className="security-page">
      <h2 className="security-title">🔒 Account Security</h2>

      <div className="security-section">
        <h3>Password Settings</h3>
        <div className="password-box">
          <label>Change Password</label>
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="Enter new password..."
          />
          <button
            className="toggle-btn"
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            {passwordVisible ? "Hide" : "Show"}
          </button>
          <button className="save-btn">Update Password</button>
        </div>
      </div>

      <div className="security-section">
        <h3>Two-Factor Authentication (2FA)</h3>
        <p>
          Add an extra layer of security by requiring a verification code when
          signing in.
        </p>
        <button
          className={`twofactor-btn ${twoFactorEnabled ? "enabled" : ""}`}
          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
        >
          {twoFactorEnabled ? "✅ 2FA Enabled" : "Enable 2FA"}
        </button>
      </div>

      <div className="security-section">
        <h3>Active Sessions</h3>
        <ul className="sessions-list">
          {sessions.map((s) => (
            <li key={s.id}>
              <div>
                <strong>{s.device}</strong> — {s.location}
              </div>
              <div className="session-meta">
                <span>{s.lastActive}</span>
                <button className="terminate-btn">Terminate</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="security-section danger-zone">
        <h3>Danger Zone</h3>
        <p>
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <button className="delete-btn">Delete Account</button>
      </div>
    </section>
  );
}
