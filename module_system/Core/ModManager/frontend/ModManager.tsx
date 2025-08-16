import React, { useEffect, useState } from "react";
import { FaCog, FaFolderOpen, FaTrash, FaSyncAlt } from "react-icons/fa";
import "./ModManager.css";

const API_BASE = "http://localhost:2010/api";

interface ModInfo {
  id: string;
  name: string;
  path: string;
  poster: string | null;
  enabled: boolean;
}

const ModManager: React.FC = () => {
  const [mods, setMods] = useState<ModInfo[]>([]);
  const [allMods, setAllMods] = useState<ModInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMods();
  }, []);

  const fetchMods = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/mods`);
      if (!res.ok) throw new Error("Failed to fetch mods");
      const data = await res.json();
      setMods(data.mods || []);
      setAllMods(data.mods || []);
    } catch (err) {
      setError((err as Error).message);
      setMods([]);
      setAllMods([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPZOrder = async () => {
    try {
      const res = await fetch(`${API_BASE}/mods/order`);
      if (!res.ok) throw new Error("Failed to load mod order");
      const data = await res.json();
      setMods(data.mods || []);
      setAllMods(data.mods || []);
    } catch (err) {
      console.error("Failed to load Project Zomboid order:", err);
    }
  };

  const loadBypassMods = () => {
    const dummy = [
      {
        id: "0000000000",
        name: "Example Mod (Bypass)",
        path: "/path/to/example/mod",
        poster: null,
        enabled: false,
      },
      {
        id: "1111111111",
        name: "Another Fake Mod",
        path: "/another/path/mod",
        poster: null,
        enabled: true,
      },
      {
        id: "2222222222",
        name: "Yet Another Mod",
        path: "/path/to/mod3",
        poster: null,
        enabled: true,
      },
    ];
    setMods(dummy);
    setAllMods(dummy);
    setError(null);
  };

  const toggleMod = async (id: string) => {
    setMods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
    setAllMods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );

    try {
      const mod = mods.find((m) => m.id === id);
      if (!mod) return;
      await fetch(`${API_BASE}/mods/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !mod.enabled }),
      });
    } catch (err) {
      console.error("Failed to toggle mod:", err);
    }
  };

  const openMod = async (path: string) => {
    try {
      await fetch(`${API_BASE}/mods/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
    } catch (err) {
      console.error("Failed to open mod:", err);
    }
  };

  const deleteMod = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this mod?")) return;
    try {
      await fetch(`${API_BASE}/mods/${id}`, { method: "DELETE" });
      setMods((prev) => prev.filter((m) => m.id !== id));
      setAllMods((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to delete mod:", err);
    }
  };

  const openModSettings = (id: string) => {
    alert(`Open settings for mod: ${id}`);
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

  if (loading) return <p className="loading">Loading mods...</p>;

  const enabledMods = mods.filter((m) => m.enabled);
  const disabledMods = mods.filter((m) => !m.enabled);

  return (
    <div className="modmanager-container">
      {/* Top Toolbar */}
      <div className="top-actions">
        <div className="toolbar-left">
          <button onClick={fetchMods} title="Refresh Mods">
            <FaSyncAlt /> Refresh
          </button>
          <button onClick={loadPZOrder} title="Load Project Zomboid Order">
            <FaSyncAlt /> Load Order
          </button>
          {error && (
            <button onClick={loadBypassMods} title="Load Example Mods">
              ⚡ Load Dummy Mods
            </button>
          )}
        </div>

        <div className="toolbar-center">
          <h1>Workshop Mods</h1>
        </div>

        <div className="toolbar-right">
          <input
            type="text"
            placeholder="Search mods..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="error-box">
          <h3>⚠ Could not load mods</h3>
          <p>
            This can happen if your Project Zomboid Workshop folder is missing
            or the API is offline.
          </p>
        </div>
      )}

      {mods.length === 0 ? (
        <p className="no-mods">No mods found.</p>
      ) : (
        <>
          {enabledMods.length > 0 && (
            <>
              <h2>✅ Enabled Mods</h2>
              <div className="mod-list">
                {enabledMods.map((mod) => (
                  <ModRow
                    key={mod.id}
                    mod={mod}
                    toggleMod={toggleMod}
                    openSettings={openModSettings}
                    openMod={openMod}
                    deleteMod={deleteMod}
                  />
                ))}
              </div>
            </>
          )}

          {disabledMods.length > 0 && (
            <>
              <h2>❌ Disabled Mods</h2>
              <div className="mod-list">
                {disabledMods.map((mod) => (
                  <ModRow
                    key={mod.id}
                    mod={mod}
                    toggleMod={toggleMod}
                    openSettings={openModSettings}
                    openMod={openMod}
                    deleteMod={deleteMod}
                  />
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
  mod: ModInfo;
  toggleMod: (id: string) => void;
  openSettings: (id: string) => void;
  openMod: (path: string) => void;
  deleteMod: (id: string) => void;
}

const ModRow: React.FC<ModRowProps> = ({
  mod,
  toggleMod,
  openSettings,
  openMod,
  deleteMod,
}) => {
  return (
    <div className={`mod-row ${mod.enabled ? "enabled" : "disabled"}`}>
      <div className="mod-image">
        {mod.poster ? (
          <img src={`${API_BASE}/mods/${mod.id}/poster`} alt={mod.name} />
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
      <div className="mod-actions">
        <label className="switch">
          <input
            type="checkbox"
            checked={mod.enabled}
            onChange={() => toggleMod(mod.id)}
          />
          <span className="slider"></span>
        </label>
        <button className="settings-btn" onClick={() => openSettings(mod.id)}>
          <FaCog />
        </button>
        <button className="open-btn" onClick={() => openMod(mod.path)}>
          <FaFolderOpen />
        </button>
        <button className="delete-btn" onClick={() => deleteMod(mod.id)}>
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default ModManager;
