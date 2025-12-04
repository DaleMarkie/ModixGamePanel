// module_system/Core/Workshop/frontend/components/GameActionButtons.jsx
import React from "react";
import "./GameActionButtons.css"; // optional, for custom styling

export default function GameActionButtons({
  onModAlerts,
  onModUpdates,
  onModLogs,
}) {
  return (
    <div className="game-action-buttons">
      <button className="action-button" onClick={onModAlerts}>
        Mod Alerts
      </button>
      <button className="action-button" onClick={onModUpdates}>
        Mod Updates
      </button>
      <button className="action-button" onClick={onModLogs}>
        Mod Logs
      </button>
    </div>
  );
}
