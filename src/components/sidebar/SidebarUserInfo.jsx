
import React, { useState, useEffect } from "react";
import { FaLaptop, FaServer, FaUser } from "react-icons/fa";
import { useUser } from "../../app/UserContext";
import { useContainer } from "../../app/ContainerContext";


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

  if (loading) return null;
  if (!authenticated || !user) return null;

  return (
    <section aria-label="Server Information" className="server-info-section">
      <div
        className="server-info-item"
        title={`Host: ${hostname || ''}`}
        aria-label={`Host: ${hostname || ''}`}
      >
        <span className="server-info-icon"><FaLaptop size={12} /></span>
        <span className="server-info-label">Host:</span>
        <span className="server-info-value">{hostname || ''}</span>
      </div>
      <div
        className="server-info-item"
        title={`Container: ${selectedContainer || ''}`}
        aria-label={`Container: ${selectedContainer || ''}`}
      >
        <span className="server-info-icon"><FaServer size={12} /></span>
        <span className="server-info-label">Container:</span>
        <select
          className="server-info-value"
          value={selectedContainer || ''}
          onChange={e => setSelectedContainer(e.target.value)}
          style={{ background: "#222", color: "#eee", border: "none", borderRadius: 4, padding: "2px 6px" }}
          disabled={availableContainers.length === 0}
        >
          {availableContainers.length === 0 ? (
            <option value="">No containers</option>
          ) : (
            availableContainers.map(c => (
              <option key={c} value={c}>{c}</option>
            ))
          )}
        </select>
      </div>
      <div
        className="server-info-item"
        title={`User: ${user.username || ''}`}
        aria-label={`User: ${user.username || ''}`}
      >
        <span className="server-info-icon"><FaUser size={12} /></span>
        <span className="server-info-label">User:</span>
        <span className="server-info-value">{user.username || ''}</span>
      </div>
    </section>
  );
}

export default SidebarUserInfo;
