
import React, { useState, useEffect } from "react";
import { FaLaptop, FaServer, FaUser } from "react-icons/fa";
import { useUser } from "../../app/UserContext";
import { useContainer } from "../../app/ContainerContext";



function Spinner() {
  return (
    <span className="spinner" style={{ display: 'inline-block', width: 14, height: 14, verticalAlign: 'middle' }}>
      <svg width="14" height="14" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" fill="none" stroke="#eee" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
        </circle>
      </svg>
    </span>
  );
}

function SidebarUserInfo() {
  const { user, authenticated, loading } = useUser();
  const { selectedContainer, setSelectedContainer } = useContainer();
  const [hostname, setHostname] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hostname") || "";
    }
    return "";
  });
  const [availableContainers, setAvailableContainers] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("containers");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Always show the panel, but show spinners/placeholders if loading or not ready
  return (
    <section aria-label="Server Information" className="server-info-section">
      <div
        className="server-info-item"
        title={`Host: ${hostname || ''}`}
        aria-label={`Host: ${hostname || ''}`}
      >
        <span className="server-info-icon"><FaLaptop size={12} /></span>
        <span className="server-info-label">Host:</span>
        <span className="server-info-value">
          {loading ? <Spinner /> : (hostname || <span style={{ color: '#888' }}>N/A</span>)}
        </span>
      </div>
      <div
        className="server-info-item"
        title={`Server: ${selectedContainer || ''}`}
        aria-label={`Server: ${selectedContainer || ''}`}
      >
        <span className="server-info-icon"><FaServer size={12} /></span>
        <span className="server-info-label">Server:</span>
        {loading ? (
          <span className="server-info-value"><Spinner /></span>
        ) : (
          <select
            className="server-info-value"
            value={selectedContainer || ''}
            onChange={e => setSelectedContainer(e.target.value)}
            style={{ background: "#222", color: "#eee", border: "none", borderRadius: 4, padding: "2px 6px" }}
            disabled={availableContainers.length === 0}
          >
            {availableContainers.length === 0 ? (
              <option value="">None</option>
            ) : (
              availableContainers.map(c => (
                <option key={c} value={c}>{c}</option>
              ))
            )}
          </select>
        )}
      </div>
      <div
        className="server-info-item"
        title={`User: ${user && user.username ? user.username : ''}`}
        aria-label={`User: ${user && user.username ? user.username : ''}`}
      >
        <span className="server-info-icon"><FaUser size={12} /></span>
        <span className="server-info-label">User:</span>
        <span className="server-info-value">
          {loading ? <Spinner /> : (user && user.username ? user.username : <span style={{ color: '#888' }}>N/A</span>)}
        </span>
      </div>
    </section>
  );
}

export default SidebarUserInfo;
