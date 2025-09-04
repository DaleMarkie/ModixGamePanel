import React from "react";

export default function GameActionButtons({ onModAlerts, onModUpdates, onModLogs }) {
  return (
    <div style={{ display: "flex", gap: "5px", marginLeft: "auto" }}>
      <button onClick={onModAlerts}>Mod Alerts</button>
      <button onClick={onModUpdates}>Mod Updates</button>
      <button onClick={onModLogs}>Mod Logs</button>
    </div>
  );
}
