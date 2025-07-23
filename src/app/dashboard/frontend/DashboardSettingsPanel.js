import React, { useState } from "react";

export default function DashboardSettingsPanel() {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    serverName: "My Zomboid Server",
    maxPlayers: 10,
    pvpEnabled: true,
    password: "",
  });

  // Update settings state on input change
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // Save handler (for now, just logs and closes modal)
  function handleSave() {
    console.log("Saved settings:", settings);
    setShowSettings(false);
  }

  return (
    <div style={{ padding: "20px", color: "#eee", fontFamily: "Arial, sans-serif", backgroundColor: "#111", minHeight: "100vh" }}>
      <h1>Project Zomboid Server Panel</h1>
      <button
        onClick={() => setShowSettings(true)}
        style={{
          backgroundColor: "#333",
          color: "#eee",
          border: "none",
          padding: "10px 16px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Panel Settings
      </button>

      {showSettings && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100vw", height: "100vh",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
          onClick={() => setShowSettings(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: "#222",
              padding: "25px 30px",
              borderRadius: "8px",
              width: "360px",
              boxShadow: "0 0 15px #000",
              color: "#eee",
            }}
          >
            <h2 style={{ marginBottom: "20px" }}>Panel Settings</h2>

            <label style={{ display: "block", marginBottom: "15px", fontWeight: "600" }}>
              Server Name:
              <input
                type="text"
                name="serverName"
                value={settings.serverName}
                onChange={handleChange}
                style={{
                  width: "100%",
                  marginTop: "6px",
                  padding: "6px 8px",
                  borderRadius: "4px",
                  border: "1px solid #555",
                  backgroundColor: "#333",
                  color: "#eee",
                }}
              />
            </label>

            <label style={{ display: "block", marginBottom: "15px", fontWeight: "600" }}>
              Max Players:
              <input
                type="number"
                name="maxPlayers"
                value={settings.maxPlayers}
                onChange={handleChange}
                min={1}
                max={100}
                style={{
                  width: "100%",
                  marginTop: "6px",
                  padding: "6px 8px",
                  borderRadius: "4px",
                  border: "1px solid #555",
                  backgroundColor: "#333",
                  color: "#eee",
                }}
              />
            </label>

            <label style={{ display: "flex", alignItems: "center", marginBottom: "15px", fontWeight: "600" }}>
              <input
                type="checkbox"
                name="pvpEnabled"
                checked={settings.pvpEnabled}
                onChange={handleChange}
                style={{ marginRight: "10px" }}
              />
              Enable PvP
            </label>

            <label style={{ display: "block", marginBottom: "25px", fontWeight: "600" }}>
              Password:
              <input
                type="password"
                name="password"
                value={settings.password}
                onChange={handleChange}
                style={{
                  width: "100%",
                  marginTop: "6px",
                  padding: "6px 8px",
                  borderRadius: "4px",
                  border: "1px solid #555",
                  backgroundColor: "#333",
                  color: "#eee",
                }}
                placeholder="Leave empty for no password"
              />
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={handleSave}
                style={{
                  backgroundColor: "#4caf50",
                  border: "none",
                  color: "white",
                  padding: "8px 14px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Save
              </button>

              <button
                onClick={() => setShowSettings(false)}
                style={{
                  backgroundColor: "#777",
                  border: "none",
                  color: "white",
                  padding: "8px 14px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
