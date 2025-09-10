export default function GameActionButtons({
  onModAlerts,
  onConflictChecker, // <-- add this
  onModUpdates,
  onModLogs,
  onLoadOrder,
}) {
  return (
    <div style={{ display: "flex", gap: "5px", marginLeft: "auto" }}>
      <button onClick={onModAlerts}>⚠️ Alerts</button>
      <button onClick={onConflictChecker}>🧪 Conflict Checker</button>
      <button onClick={onModLogs}>🧹 Clean Mods</button>
      <button onClick={onModUpdates}>🐞 Debugger</button>
      <button onClick={onModLogs}>🌐 Steam Parser</button>
      <button onClick={onModLogs}>🛠️ Mod Creation</button>
      <button onClick={onModLogs}>🧩 INI Error Tracker</button>
      <button onClick={onLoadOrder}>⚡ Load Order</button>
      <button onClick={onModLogs}>📜 Logs</button>
    </div>
  );
}
