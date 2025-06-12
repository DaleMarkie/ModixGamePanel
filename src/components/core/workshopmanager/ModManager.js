import React, { useState, useEffect } from "react";
import "./ModManager.css";

function ModManager() {
  const [mods, setMods] = useState([]);
  const [enabledMods, setEnabledMods] = useState({ WorkshopItems: [], Mods: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMods();
  }, []);

  const fetchMods = async () => {
    setLoading(true);
    try {
      const [modRes, enabledRes] = await Promise.all([
        fetch("http://localhost:2010/api/workshop-mods"),
        fetch("http://localhost:2010/api/server-mods"),
      ]);

      const modsJson = await modRes.json();
      const enabledJson = await enabledRes.json();

      if (!Array.isArray(modsJson)) throw new Error("Invalid mod format");

      const enriched = modsJson.map((mod) => {
        const workshopId = mod.workshopId || mod.id || mod.name;
        const modId = mod.modId || mod.modid || mod.name;

        const isEnabled =
          enabledJson.WorkshopItems?.includes(String(workshopId)) ||
          enabledJson.Mods?.includes(String(modId));

        return {
          ...mod,
          workshopId: String(workshopId),
          modId: String(modId),
          enabled: isEnabled,
        };
      });

      setMods(enriched);
      setEnabledMods(enabledJson);
    } catch (err) {
      console.error("Error loading mods:", err);
      setError("Failed to fetch mods.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = mods.filter((mod) =>
    mod.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mod-manager">
      <h1>🧩 Server Mod List</h1>

      <input
        className="mod-search"
        placeholder="Search by name, ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {loading && <p>Loading mods...</p>}
      {error && <p className="mod-error">{error}</p>}

      <div className="mod-grid">
        {filtered.map((mod) => (
          <div key={mod.workshopId} className={`mod-card ${mod.enabled ? "enabled" : "disabled"}`}>
            <div className="mod-thumb">
              {mod.thumbnail ? (
                <img
                  src={mod.thumbnail}
                  alt="Thumbnail"
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://via.placeholder.com/220x120?text=No+Image")
                  }
                />
              ) : (
                <div className="mod-placeholder">🧩</div>
              )}
            </div>
            <div className="mod-info">
              <h3>{mod.name}</h3>
              <p className="mod-id">Workshop ID: {mod.workshopId}</p>
              <p className="mod-id">Mod ID: {mod.modId}</p>
              <p className="mod-description">
                {mod.description || "No description"}
              </p>
              <div className="toggle-button">
                {mod.enabled ? "✅ Enabled on Server" : "❌ Not Enabled"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ModManager;
