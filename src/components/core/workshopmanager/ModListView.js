import React, { useState, useMemo } from "react";
import ModCard from "./ModCard"; // Your existing mod card component

const ModListView = ({ mods }) => {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter mods based on favorites and search term
  const filteredMods = useMemo(() => {
    let filtered = mods;

    if (showFavoritesOnly) {
      filtered = filtered.filter((mod) => mod.favorite);
    }

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (mod) =>
          (mod.name && mod.name.toLowerCase().includes(lowerSearch)) ||
          (mod.modId && mod.modId.toString().includes(lowerSearch))
      );
    }

    return filtered;
  }, [mods, showFavoritesOnly, searchTerm]);

  return (
    <div style={{ padding: 20, color: "white", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* Header with Title, Favorites Toggle and Search */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 12,
        }}
      >
        <h2 style={{ fontSize: 28, margin: 0 }}>Workshop</h2>

        <input
          type="search"
          placeholder="Search mods..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flexGrow: 1,
            maxWidth: 300,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #555",
            backgroundColor: "#111",
            color: "white",
            fontSize: 16,
          }}
          aria-label="Search mods"
        />

        <button
          onClick={() => setShowFavoritesOnly((prev) => !prev)}
          style={{
            padding: "8px 18px",
            backgroundColor: showFavoritesOnly ? "#1DB954" : "#333",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "600",
            fontSize: 16,
            transition: "background-color 0.25s ease",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
          aria-pressed={showFavoritesOnly}
          title={showFavoritesOnly ? "Show all mods" : "Show favorites only"}
        >
          {showFavoritesOnly ? "Show All Mods" : "Show Favorites"}
        </button>
      </div>

      {/* Empty State */}
      {filteredMods.length === 0 ? (
        <p style={{ color: "#888", fontStyle: "italic", fontSize: 16, marginTop: 40, textAlign: "center" }}>
          {showFavoritesOnly
            ? "No favorite mods found."
            : searchTerm
            ? "No mods match your search."
            : "No mods available."}
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {filteredMods.map((mod) => (
            <ModCard
              key={mod.modId || mod.id}
              mod={mod}
              onClick={() => console.log("View mod:", mod.modId || mod.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                console.log("Right-click mod:", mod.modId || mod.id);
              }}
              onAdd={(modId) => console.log("Add to server:", modId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModListView;
