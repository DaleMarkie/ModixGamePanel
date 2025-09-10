"use client";
import React, { useEffect, useState } from "react";

interface ModAlert {
  id: string;
  modName: string;
  message: string;
  type: "error" | "warning" | "info";
  timestamp: string;
}

export default function ModAlertsPage() {
  const [alerts, setAlerts] = useState<ModAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/projectzomboid/mod-alerts");
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error("Failed to fetch mod alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const typeColors: Record<string, string> = {
    error: "bg-red-700 text-white",
    warning: "bg-yellow-600 text-black",
    info: "bg-blue-600 text-white",
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🔔 Mod Alerts</h1>
      {loading && <p>Loading alerts…</p>}
      {!loading && alerts.length === 0 && (
        <p className="text-gray-400">No mod issues detected. ✅</p>
      )}
      <div className="flex flex-col gap-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded shadow ${
              typeColors[alert.type]
            } transition-all hover:scale-[1.02]`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">{alert.modName}</span>
              <span className="text-sm opacity-70">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm">{alert.message}</p>
            {alert.id === "workshop_path_missing" && (
              <p className="mt-1 text-xs text-gray-200">
                ⚠️ Mod alerts cannot fully check mods because the Steam Workshop
                folder for Project Zomboid is missing. Make sure it exists at:{" "}
                <code className="bg-black px-1 rounded">
                  {alert.message.split(" at ")[1]}
                </code>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
