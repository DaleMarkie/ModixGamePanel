"use client";

import React, { useEffect, useState } from "react";
import { FaPuzzlePiece, FaEdit } from "react-icons/fa";
import "./ModManager.css";
import { getServerUrl } from "@/app/config";

interface ModInfo {
  id: string;
  name: string;
  description: string;
  folder: string;
  enabled: boolean;
}

export default function ModManagerPage() {
  const [mods, setMods] = useState<ModInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch mods from backend API
  useEffect(() => {
    const fetchMods = async () => {
      try {
        const res = await fetch(`${getServerUrl()}/api/mods`);
        if (!res.ok) throw new Error("Failed to load mods.");
        const data = await res.json();
        setMods(data.mods || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchMods();
  }, []);

  const toggleMod = async (mod: ModInfo) => {
    try {
      const res = await fetch(`${getServerUrl()}/api/mods/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modId: mod.id }),
      });
      const data = await res.json();
      if (data.success) {
        setMods((prev) =>
          prev.map((m) =>
            m.id === mod.id ? { ...m, enabled: !mod.enabled } : m
          )
        );
      } else {
        throw new Error(data.message || "Failed to toggle mod.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error toggling mod");
    }
  };

  const editMod = (mod: ModInfo) => {
    // For now, just open the folder in system file explorer
    window.open(`file://${mod.folder}`);
  };

  if (loading)
    return (
      <div className="mod-manager-page">
        <h1>📦 Mod Manager</h1>
        <p>Loading mods...</p>
      </div>
    );

  if (error)
    return (
      <div className="mod-manager-page">
        <h1>📦 Mod Manager</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );

  return (
    <div className="mod-manager-page">
      <h1 className="text-4xl font-bold mb-6 flex items-center gap-2">
        <FaPuzzlePiece /> Mod Manager
      </h1>

      <div className="mods-grid">
        {mods.map((mod) => (
          <div
            key={mod.id}
            className={`mod-card ${mod.enabled ? "enabled" : "disabled"}`}
          >
            <h3 className="text-xl font-semibold">{mod.name}</h3>
            <p className="text-gray-300 text-sm">{mod.description}</p>
            <div className="mod-card-actions">
              <button
                className={`toggle-btn ${
                  mod.enabled ? "bg-red-500" : "bg-green-500"
                }`}
                onClick={() => toggleMod(mod)}
              >
                {mod.enabled ? "Disable" : "Enable"}
              </button>
              <button
                className="edit-btn bg-blue-500"
                onClick={() => editMod(mod)}
              >
                <FaEdit /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
