"use client";

import { useState } from "react";
import "./welcome-popup.css";

interface WelcomePopupProps {
  username: string;
  logs?: { date: string; event: string }[];
  onClose: () => void;
}

const WelcomePopup = ({ username, logs = [], onClose }: WelcomePopupProps) => {
  return (
    <div className="welcome-popup-overlay">
      <div className="welcome-popup-card">
        <header className="welcome-popup-header">
          <h2>Welcome, {username}!</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </header>

        <section className="welcome-popup-body">
          <p>Here's what's new since your last visit:</p>
          {logs.length ? (
            <ul className="welcome-logs">
              {logs.map((log, idx) => (
                <li key={idx}>
                  <span className="log-date">
                    {new Date(log.date).toLocaleString()}
                  </span>{" "}
                  - <span className="log-event">{log.event}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-logs">No recent updates.</p>
          )}
        </section>

        <footer className="welcome-popup-footer">
          <button className="close-footer-btn" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};

export default WelcomePopup;
