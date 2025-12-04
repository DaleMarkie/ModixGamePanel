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
    </div>
  );
}
