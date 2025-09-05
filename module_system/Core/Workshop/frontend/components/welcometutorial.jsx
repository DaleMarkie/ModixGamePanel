"use client";

import React, { useState } from "react";
import "./welcometutorial.css";

export default function WelcomeTutorial() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="welcome-overlay">
      <div className="welcome-modal">
        {/* 👤 User Profile Section */}
        <div className="welcome-profile">
          <img
            src="https://via.placeholder.com/64"
            alt="User Avatar"
            className="welcome-avatar"
          />

          <div className="welcome-info">
            <h2 className="welcome-name">test1</h2>
            <p className="welcome-username">@test1</p>
            <div className="welcome-meta">
              <span>Joined: Jan 5, 2025</span>
              <span className="status inactive">Inactive ❌</span>
            </div>
          </div>

          <button
            className="welcome-logout"
            onClick={() => alert("Logged out!")}
          >
            Log Out
          </button>
        </div>

        {/* Tutorial Heading */}
        <h1 className="welcome-title">👋 Welcome to Modix Panel</h1>
        <p className="welcome-subtitle">
          Here’s a quick guide to get you started:
        </p>

        {/* Tutorial Steps */}
        <ol className="welcome-steps">
          <li>🎮 Select your game at the top left.</li>
          <li>🔍 Search mods or paste a Workshop Collection ID.</li>
          <li>📥 Add mods to your server.ini automatically.</li>
          <li>📂 Organize mods into custom modlists.</li>
          <li>⚡ Manage updates, logs, and alerts with ease.</li>
        </ol>

        {/* Close button */}
        <button className="welcome-close" onClick={() => setIsOpen(false)}>
          Got it 👍
        </button>
      </div>
    </div>
  );
}
