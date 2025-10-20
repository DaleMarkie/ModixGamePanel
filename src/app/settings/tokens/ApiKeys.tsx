"use client";

import React, { useState } from "react";
import { Copy, Eye, EyeOff, KeyRound, Info } from "lucide-react";
import "./ApiKeys.css";

export default function ApiKeys() {
  const [showToken, setShowToken] = useState(false);

  const mockToken = "mox_dev_3h29df8sdh2389hsdh32";

  const handleCopy = () => {
    navigator.clipboard.writeText(mockToken);
  };

  return (
    <div className="api-container">
      <header className="api-header">
        <KeyRound className="api-icon" />
        <div>
          <h1 className="api-title">API & Developer Access</h1>
          <p className="api-subtitle">
            Manage your Modix API tokens and access developer endpoints.
          </p>
        </div>
      </header>

      <section className="api-key-section">
        <div className="api-card">
          <div className="api-card-header">
            <h2>Your API Token</h2>
            <button
              className="api-generate-btn"
              onClick={() => alert("Token generation is coming soon!")}
            >
              Generate New
            </button>
          </div>

          <div className="api-token-display">
            <code className="token-text">
              {showToken ? mockToken : "••••••••••••••••••••••••••••"}
            </code>
            <div className="token-actions">
              <button
                className="icon-btn"
                onClick={() => setShowToken(!showToken)}
                title={showToken ? "Hide Token" : "Show Token"}
              >
                {showToken ? <EyeOff /> : <Eye />}
              </button>
              <button className="icon-btn" onClick={handleCopy} title="Copy">
                <Copy />
              </button>
            </div>
          </div>

          <div className="api-info-box">
            <Info size={18} />
            <span>
              Keep this token private! It grants full access to your Modix
              server via API.
            </span>
          </div>
        </div>
      </section>

      <section className="api-endpoints">
        <h2>Available Endpoints</h2>
        <div className="endpoint-list">
          <div className="endpoint-card">
            <code className="method get">GET</code>
            <span>/api/server/status</span>
            <p>Returns current Project Zomboid server status and stats.</p>
          </div>
          <div className="endpoint-card">
            <code className="method post">POST</code>
            <span>/api/server/start</span>
            <p>Starts the Project Zomboid server instance.</p>
          </div>
          <div className="endpoint-card">
            <code className="method post">POST</code>
            <span>/api/server/stop</span>
            <p>Stops the running server instance safely.</p>
          </div>
          <div className="endpoint-card">
            <code className="method get">GET</code>
            <span>/api/stats</span>
            <p>Returns system resource usage and Modix performance data.</p>
          </div>
        </div>
      </section>

      <footer className="api-footer">
        <div className="api-beta">
          🚧 <strong>Developer API in Progress:</strong> This feature will
          release in later update. <b></b>. Stay tuned!
        </div>
      </footer>
    </div>
  );
}
