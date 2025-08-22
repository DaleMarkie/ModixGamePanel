import React, { useEffect, useState } from "react";
import ModActionButtons from "./ModActionButtons";
import TopActionButtons from "./TopActionButtons";
import * as modService from "./modService";
import "./ModManager.css";

const API_BASE = "http://localhost:2010/api";

const ModManager: React.FC = () => {
  const [mods, setMods] = useState<modService.ModInfo[]>([]);
  const [allMods, setAllMods] = useState<modService.ModInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // detect which game user selected from Games.jsx
  const selectedGame = localStorage.getItem("selectedGame") || "projectzomboid";

  const loadMods = async () => {
    setLoading(true);
    setError(null);
    try {
      const list =
        selectedGame === "rimworld"
          ? await modService.fetchRimWorldMods()
          : await modService.fetchMods(); // PZ default
      setMods(list);
      setAllMods(list);
    } catch (err) {
      setError((err as Error).message);
      setMods([]);
      setAllMods([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOrder = async () => {
    try {
      const list =
        selectedGame === "rimworld"
          ? await modService.loadRWOrder()
          : await modService.loadPZOrder();
      setMods(list);
      setAllMods(list);
    } catch (err) {
      console.error(err);
    }
  };

  const selectModDir = async () => {
    const newDir = prompt(
      `Enter your ${
        selectedGame === "rimworld" ? "RimWorld" : "Project Zomboid"
      } Workshop Mods folder path:`
    );
    if (!newDir) return;

    try {
      const res = await fetch(`${API_BASE}/mods/set-dir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: newDir, game: selectedGame }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      await loadMods();
    } catch (err) {
      console.error(err);
      alert("Failed to set mod directory.");
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setMods(allMods);
    } else {
      setMods(
        allMods.filter((m) =>
          m.name.toLowerCase().includes(value.toLowerCase())
        )
      );
    }
  };

  useEffect(() => {
    loadMods();
  }, [selectedGame]);

  const enabledMods = mods.filter((m) => m.enabled);
  const disabledMods = mods.filter((m) => !m.enabled);

  return (
    <div className="modmanager-container">
      <div className="header-panel">
        <div className="header-top">
          <div className="header-left">
            <TopActionButtons
              onRefresh={loadMods}
              onLoadOrder={loadOrder}
              onSelectModDir={selectModDir}
            />
          </div>
          <div className="header-center">
            <h1>
              {selectedGame === "rimworld"
                ? "RimWorld Workshop Mods"
                : "Project Zomboid Workshop Mods"}
            </h1>
          </div>
          <div className="header-right">
            <input
              type="text"
              placeholder="Search mods..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="header-bottom">
          <div className="stat total">Total: {mods.length}</div>
          <div className="stat enabled">Enabled: {enabledMods.length}</div>
          <div className="stat disabled">Disabled: {disabledMods.length}</div>
        </div>
      </div>

      {error && (
        <div className="error-box">
          <h3>⚠ Could not load mods</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{error}</pre>
        </div>
      )}

      {loading ? (
        <p className="loading">Loading mods...</p>
      ) : mods.length === 0 ? (
        <p className="no-mods">No mods found.</p>
      ) : (
        <>
          {enabledMods.length > 0 && (
            <>
              <h2>✅ Enabled Mods</h2>
              <div className="mod-list">
                {enabledMods.map((mod) => (
                  <ModRow key={mod.id} mod={mod} refreshMods={loadMods} />
                ))}
              </div>
            </>
          )}
          {disabledMods.length > 0 && (
            <>
              <h2>❌ Disabled Mods</h2>
              <div className="mod-list">
                {disabledMods.map((mod) => (
                  <ModRow key={mod.id} mod={mod} refreshMods={loadMods} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

interface ModRowProps {
  mod: modService.ModInfo;
  refreshMods: () => void;
}

const ModRow: React.FC<ModRowProps> = ({ mod, refreshMods }) => {
  const posterSrc = mod.poster?.startsWith("/api")
    ? `http://localhost:2010${mod.poster}`
    : mod.poster || undefined;

  return (
    <div className={`mod-row ${mod.enabled ? "enabled" : "disabled"}`}>
      <div className="mod-image">
        {posterSrc ? (
          <img src={posterSrc} alt={mod.name} />
        ) : (
          <div className="mod-noimage">No Image</div>
        )}
      </div>
      <div className="mod-details">
        <h2>{mod.name}</h2>
        <p>
          <strong>ID:</strong> {mod.id}
        </p>
        <p className="mod-path">{mod.path}</p>
      </div>

      <ModActionButtons
        modId={mod.id}
        modPath={mod.path}
        enabled={mod.enabled}
        onUpdate={refreshMods}
      />
    </div>
  );
};

export default ModManager;
