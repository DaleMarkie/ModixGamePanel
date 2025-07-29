import React from "react";
import "./Documentation.css";

const Documentation = () => {
  return (
    <div className="documentation-container">
      <h1 className="doc-title">📘 Modix Game Panel Documentation</h1>
      <p className="doc-subtitle">
        Learn how to install, manage, and optimize your Project Zomboid server using Modix.
      </p>

      <div className="doc-section">
        <h2>🚀 Getting Started</h2>
        <ul>
          <li>📦 <strong>Install SteamCMD</strong> from the Setup SteamCMD page.</li>
          <li>🛠️ <strong>Configure your server</strong> via the Settings tab (`server.ini`, `SandboxVars.lua`).</li>
          <li>🧪 <strong>Launch your server</strong> from the Terminal tab (Start, Stop, Restart).</li>
        </ul>
      </div>

      <div className="doc-section">
        <h2>⚙️ Panel Features</h2>
        <ul>
          <li>📡 Real-time terminal with SSE-based log streaming</li>
          <li>🧩 Mod Manager with Workshop support & tagging system</li>
          <li>📁 Server Settings Editor for all INI & SandboxVars</li>
          <li>🔔 Custom Discord-style Webhook Notifications</li>
          <li>🧰 File Manager (coming soon)</li>
          <li>🧼 Save Backup & Restore (planned)</li>
        </ul>
      </div>

      <div className="doc-section">
        <h2>🧠 Tips & Best Practices</h2>
        <ul>
          <li>💾 Always backup before major config changes.</li>
          <li>🧼 Keep your server updated through SteamCMD regularly.</li>
          <li>🔐 Use strong admin and server passwords in `server.ini`.</li>
          <li>🎨 Customize header color & theme in Panel Settings.</li>
        </ul>
      </div>

      <div className="doc-section">
        <h2>❓ Need Help?</h2>
        <p>
          Head over to the <strong>Help</strong> section for:
        </p>
        <ul>
          <li>📖 FAQ & Troubleshooting</li>
          <li>🎟️ Submit Support Tickets</li>
          <li>💬 Join the Modix Discord Community</li>
        </ul>
      </div>
    </div>
  );
};

export default Documentation;
