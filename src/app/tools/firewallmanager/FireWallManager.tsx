import React, { useState, useEffect } from "react";
import "./FireWallManager.css";

type FirewallRule = {
  id: number;
  action: "allow" | "deny";
  protocol: "tcp" | "udp" | "icmp" | "all";
  port: string;
  ipRange: string;
  description?: string;
};

type FirewallLog = {
  timestamp: string;
  ip: string;
  action: "blocked" | "allowed";
  port: number;
  protocol: string;
};

export default function Firewall() {
  const [rules, setRules] = useState<FirewallRule[]>([]);
  const [logs, setLogs] = useState<FirewallLog[]>([]);
  const [autoBlock, setAutoBlock] = useState(false);
  const [geoBlockList, setGeoBlockList] = useState<string[]>(["CN", "RU"]);
  const [newRule, setNewRule] = useState<Omit<FirewallRule, "id">>({
    action: "deny",
    protocol: "tcp",
    port: "",
    ipRange: "any", // consider changing to "0.0.0.0/0" or ""
    description: "",
  });

  const API_BASE = "http://localhost:8000/api/firewall";

  useEffect(() => {
    async function loadData() {
      try {
        const [rulesRes, logsRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE}/rules`),
          fetch(`${API_BASE}/logs`),
          fetch(`${API_BASE}/settings`).catch(() => null), // settings optional
        ]);

        if (!rulesRes.ok) throw new Error("Failed to fetch rules");
        if (!logsRes.ok) throw new Error("Failed to fetch logs");

        const rulesData = await rulesRes.json();
        const logsData = await logsRes.json();

        setRules(rulesData);
        setLogs(logsData);

        if (settingsRes && settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (typeof settingsData.autoBlock === "boolean")
            setAutoBlock(settingsData.autoBlock);
          if (Array.isArray(settingsData.geoBlocks))
            setGeoBlockList(settingsData.geoBlocks);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  async function toggleAutoBlock(enabled: boolean) {
    setAutoBlock(enabled);
    try {
      const res = await fetch(`${API_BASE}/auto-block`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Failed to update auto block");
    } catch (e) {
      console.error(e);
    }
  }

  async function updateGeoBlocks(newList: string[]) {
    setGeoBlockList(newList);
    try {
      const res = await fetch(`${API_BASE}/geo-blocks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geoBlocks: newList }),
      });
      if (!res.ok) throw new Error("Failed to update geo blocks");
    } catch (e) {
      console.error(e);
    }
  }

  async function addRule() {
    if (!newRule.port) return alert("Port is required");

    try {
      const res = await fetch(`${API_BASE}/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRule),
      });
      if (!res.ok) throw new Error("Failed to add rule");

      const createdRule: FirewallRule = await res.json();
      setRules((prev) => [...prev, createdRule]);
      setNewRule({
        action: "deny",
        protocol: "tcp",
        port: "",
        ipRange: "any",
        description: "",
      });
    } catch (e: any) {
      alert(`Error adding rule: ${e.message}`);
    }
  }

  async function removeRule(id: number) {
    try {
      const res = await fetch(`${API_BASE}/rules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete rule");
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (e: any) {
      alert(`Error deleting rule: ${e.message}`);
    }
  }

  function removeGeoBlock(code: string) {
    const updated = geoBlockList.filter((c) => c !== code);
    updateGeoBlocks(updated);
  }

  function addGeoBlock(code: string) {
    if (!geoBlockList.includes(code)) {
      updateGeoBlocks([...geoBlockList, code]);
    }
  }

  return (
    <div className="firewall-container" aria-label="Firewall Manager">
      <h1 className="firewall-title">Firewall</h1>

      <section className="toggle-section">
        <label htmlFor="autoBlock">Automatic Block</label>
        <input
          type="checkbox"
          id="autoBlock"
          checked={autoBlock}
          onChange={(e) => toggleAutoBlock(e.target.checked)}
        />
      </section>

      <section className="section-card" aria-label="GeoIP Blocking">
        <h2 className="section-title">GeoIP Block</h2>
        <div className="geoip-buttons">
          {geoBlockList.map((code) => (
            <button
              key={code}
              className="geoip-button remove"
              onClick={() => removeGeoBlock(code)}
              title={`Remove Geo Block for ${code}`}
              aria-label={`Remove Geo Block for ${code}`}
            >
              {code} &times;
            </button>
          ))}
          <button
            className="geoip-button add"
            onClick={() => {
              const newCode = prompt(
                "Enter country code (e.g. US, CN):"
              )?.toUpperCase();
              if (newCode && newCode.length === 2) addGeoBlock(newCode);
            }}
            aria-label="Add GeoIP Block"
          >
            + Add
          </button>
        </div>
      </section>

      <section className="section-card" aria-label="Firewall Rules">
        <h2 className="section-title">Rules</h2>
        <table className="firewall-table" role="grid">
          <thead>
            <tr>
              <th>Action</th>
              <th>Protocol</th>
              <th>Port</th>
              <th>IP Range</th>
              <th>Description</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(
              ({ id, action, protocol, port, ipRange, description }) => (
                <tr key={id}>
                  <td>
                    <span
                      className={
                        action === "allow" ? "status-allow" : "status-deny"
                      }
                    >
                      {action.toUpperCase()}
                    </span>
                  </td>
                  <td>{protocol.toUpperCase()}</td>
                  <td>{port}</td>
                  <td>{ipRange}</td>
                  <td>{description}</td>
                  <td>
                    <button
                      className="action-delete"
                      aria-label={`Delete rule ${description ?? id}`}
                      onClick={() => removeRule(id)}
                      title="Delete Rule"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              )
            )}
            <tr>
              <td>
                <select
                  className="input-select"
                  value={newRule.action}
                  onChange={(e) =>
                    setNewRule((r) => ({
                      ...r,
                      action: e.target.value as FirewallRule["action"],
                    }))
                  }
                >
                  <option value="allow">Allow</option>
                  <option value="deny">Deny</option>
                </select>
              </td>
              <td>
                <select
                  className="input-select"
                  value={newRule.protocol}
                  onChange={(e) =>
                    setNewRule((r) => ({
                      ...r,
                      protocol: e.target.value as FirewallRule["protocol"],
                    }))
                  }
                >
                  <option value="tcp">TCP</option>
                  <option value="udp">UDP</option>
                  <option value="icmp">ICMP</option>
                  <option value="all">All</option>
                </select>
              </td>
              <td>
                <input
                  className="input-text"
                  type="text"
                  value={newRule.port}
                  onChange={(e) =>
                    setNewRule((r) => ({ ...r, port: e.target.value }))
                  }
                  placeholder="Port or range"
                />
              </td>
              <td>
                <input
                  className="input-text"
                  type="text"
                  value={newRule.ipRange}
                  onChange={(e) =>
                    setNewRule((r) => ({ ...r, ipRange: e.target.value }))
                  }
                  placeholder="IP Range"
                />
              </td>
              <td>
                <input
                  className="input-text"
                  type="text"
                  value={newRule.description}
                  onChange={(e) =>
                    setNewRule((r) => ({ ...r, description: e.target.value }))
                  }
                  placeholder="Description"
                />
              </td>
              <td>
                <button
                  className="button-add"
                  onClick={addRule}
                  aria-label="Add firewall rule"
                  title="Add firewall rule"
                >
                  +
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="section-card" aria-label="Firewall Logs">
        <h2 className="section-title">Firewall Logs</h2>
        <div
          className="logs-container"
          tabIndex={0}
          aria-live="polite"
          aria-atomic="true"
        >
          <table className="logs-table" role="grid">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>IP</th>
                <th>Action</th>
                <th>Port</th>
                <th>Protocol</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(({ timestamp, ip, action, port, protocol }, i) => (
                <tr key={`${timestamp}-${ip}-${i}`}>
                  <td>{new Date(timestamp).toLocaleString()}</td>
                  <td>{ip}</td>
                  <td
                    className={
                      action === "blocked" ? "log-blocked" : "log-allowed"
                    }
                  >
                    {action}
                  </td>
                  <td>{port}</td>
                  <td>{protocol.toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
