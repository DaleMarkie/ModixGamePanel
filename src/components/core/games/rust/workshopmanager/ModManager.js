import React, { useState, useEffect } from "react";

function ModManager() {
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch mods from backend
  const fetchMods = async () => {
    setLoading(true);
    setError("");
    setSelectedIndex(null);
    try {
      const res = await fetch("http://localhost:2010/api/workshop-mods");
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Invalid response format");

      const sorted = data
        .map((mod) => ({
          id: mod.modId || mod.id || mod.name,
          name: mod.title || mod.name || "Unknown Mod",
          path: mod.path || "",
          description: mod.description || "",
          thumbnail: mod.thumbnail || "",
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setMods(sorted);
    } catch (err) {
      console.error("Error fetching mods:", err);
      setError(err.message || "Unknown error");
      setMods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMods();
  }, []);

  // Filter mods by search query (case insensitive)
  const filteredMods = mods.filter((mod) =>
    mod.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If current selected index is out of filtered mods range, clear selection
  useEffect(() => {
    if (selectedIndex !== null && (selectedIndex < 0 || selectedIndex >= filteredMods.length)) {
      setSelectedIndex(null);
    }
  }, [filteredMods, selectedIndex]);

  const selectedMod = selectedIndex !== null ? filteredMods[selectedIndex] : null;

  // Handle keyboard selection for accessibility
  const handleKeyDown = (e, index) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedIndex(index);
    }
  };

  return (
    <div
      style={{
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: 20,
        backgroundColor: "#222",
        maxWidth: 900,
        margin: "auto",
        borderRadius: 8,
        boxShadow: "0 0 10px #000",
      }}
    >
      <h2 style={{ marginBottom: 15 }}>🧩 Mod Managerdd</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="🔍 Search mods..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 6,
          border: "1px solid #444",
          backgroundColor: "#111",
          color: "white",
          fontSize: 14,
          outline: "none",
          boxShadow: "inset 0 0 5px #000",
          marginBottom: 15,
        }}
        aria-label="Search mods"
      />

      {/* Loading / Error */}
      {loading && <div>Loading mods...</div>}
      {error && (
        <div style={{ color: "red", marginBottom: 10 }} role="alert">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {filteredMods.length === 0 ? (
            <div>No mods found.</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 15,
              }}
            >
              {filteredMods.map((mod, i) => (
                <div
                  key={mod.id || mod.name + i}
                  onClick={() => setSelectedIndex(i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  style={{
                    backgroundColor: i === selectedIndex ? "#336699" : "#333",
                    borderRadius: 8,
                    padding: 12,
                    cursor: "pointer",
                    boxShadow: i === selectedIndex ? "0 0 8px #3399ff" : "none",
                    userSelect: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    outline: "none",
                  }}
                  title={`Mod: ${mod.name}`}
                  tabIndex={0}
                  role="button"
                  aria-pressed={i === selectedIndex}
                >
                  {/* Thumbnail or fallback */}
                  {mod.thumbnail ? (
                    <img
                      src={mod.thumbnail}
                      alt={`${mod.name} thumbnail`}
                      style={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 6,
                        marginBottom: 10,
                        backgroundColor: "#222",
                      }}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/220x120?text=No+Image";
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: 120,
                        borderRadius: 6,
                        backgroundColor: "#444",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 10,
                        fontSize: 40,
                        color: "#777",
                        userSelect: "none",
                      }}
                    >
                      🧩
                    </div>
                  )}

                  {/* Mod Name */}
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      textAlign: "center",
                      marginBottom: 6,
                      overflowWrap: "break-word",
                    }}
                  >
                    {mod.name}
                  </div>

                  {/* Mod ID */}
                  {mod.id && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#bbb",
                        marginBottom: 6,
                        wordBreak: "break-word",
                        textAlign: "center",
                      }}
                    >
                      ID: {mod.id}
                    </div>
                  )}

                  {/* Description */}
                  {mod.description && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "#ccc",
                        flexGrow: 1,
                        textAlign: "center",
                        overflow: "hidden",
                        maxHeight: 60,
                        lineHeight: "1.2em",
                      }}
                    >
                      {mod.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Selected Mod Details (Optional - add if you want to show details separately) */}
      {selectedMod && (
        <div
          style={{
            marginTop: 20,
            padding: 15,
            backgroundColor: "#1a1a1a",
            borderRadius: 8,
            boxShadow: "0 0 10px #000",
          }}
          aria-live="polite"
        >
          <h3>{selectedMod.name}</h3>
          {selectedMod.thumbnail && (
            <img
              src={selectedMod.thumbnail}
              alt={`${selectedMod.name} thumbnail`}
              style={{ maxWidth: "100%", borderRadius: 6, marginBottom: 10 }}
              onError={(e) => {
                e.currentTarget.src =
                  "https://via.placeholder.com/400x200?text=No+Image";
              }}
            />
          )}
          <p>{selectedMod.description || "No description available."}</p>
          <p>
            <strong>Path:</strong> {selectedMod.path || "N/A"}
          </p>
          <p>
            <strong>ID:</strong> {selectedMod.id || "N/A"}
          </p>
        </div>
      )}
    </div>
  );
}

export default ModManager;
