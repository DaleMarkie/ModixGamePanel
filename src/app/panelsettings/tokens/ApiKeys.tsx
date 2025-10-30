"use client";

import React, { useState, useEffect } from "react";
import { Copy, Eye, EyeOff, KeyRound, Info } from "lucide-react";
import axios from "axios";
import "./ApiKeys.css";

interface ApiToken {
  token: string;
  createdAt: string;
}

export default function ApiKeys() {
  const [showToken, setShowToken] = useState(false);
  const [apiToken, setApiToken] = useState<ApiToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch the current API token from backend
  const fetchToken = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/api-keys/current"); // backend endpoint
      setApiToken(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch API token");
    } finally {
      setLoading(false);
    }
  };

  // Generate new token
  const generateToken = async () => {
    try {
      const res = await axios.post("/api/api-keys/generate");
      setApiToken(res.data);
      setShowToken(true);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate token");
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (apiToken?.token) {
      navigator.clipboard.writeText(apiToken.token);
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

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
            <button className="api-generate-btn" onClick={generateToken}>
              {loading ? "Loading..." : "Generate New"}
            </button>
          </div>

          <div className="api-token-display">
            <code className="token-text">
              {apiToken
                ? showToken
                  ? apiToken.token
                  : "••••••••••••••••••••••••••••"
                : loading
                ? "Fetching..."
                : "No token"}
            </code>
            <div className="token-actions">
              {apiToken && (
                <>
                  <button
                    className="icon-btn"
                    onClick={() => setShowToken(!showToken)}
                    title={showToken ? "Hide Token" : "Show Token"}
                  >
                    {showToken ? <EyeOff /> : <Eye />}
                  </button>
                  <button
                    className="icon-btn"
                    onClick={handleCopy}
                    title="Copy"
                  >
                    <Copy />
                  </button>
                </>
              )}
            </div>
          </div>

          {error && <div className="api-error">{error}</div>}

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
          release in a later update. Stay tuned!
        </div>
      </footer>
    </div>
  );
}
