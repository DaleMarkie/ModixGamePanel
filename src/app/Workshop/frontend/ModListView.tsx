import React, { useState, useMemo } from "react";
import ModCard from "./ModCard"; // Your existing mod card component
import { FaSearch } from "react-icons/fa";

interface ModListViewProps {
  mods: Array<any>;
}

const ModListView: React.FC<ModListViewProps> = ({ mods }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter mods based on search term
  const filteredMods = useMemo(() => {
    if (!searchTerm.trim()) return mods;

    const lowerSearch = searchTerm.toLowerCase();
    return mods.filter(
      (mod) =>
        (mod.title && mod.title.toLowerCase().includes(lowerSearch)) ||
        (mod.modId && mod.modId.toString().includes(lowerSearch))
    );
  }, [mods, searchTerm]);

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#eee",
        minHeight: "100vh",
        backgroundColor: "#121212",
      }}
    >
      {/* Header with Search */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          gap: 12,
        }}
      >
        <h2
          style={{
            fontSize: 30,
            fontWeight: 700,
            margin: 0,
            color: "#1DB954",
          }}
        >
          Workshop
        </h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            maxWidth: 350,
            backgroundColor: "#1e1e1e",
            padding: "6px 12px",
            borderRadius: 10,
            border: "1px solid #333",
            transition: "all 0.2s",
          }}
        >
          <FaSearch style={{ marginRight: 8, color: "#888" }} />
          <input
            type="search"
            placeholder="Search mods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flexGrow: 1,
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
              color: "#eee",
              fontSize: 16,
            }}
            aria-label="Search mods"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredMods.length === 0 ? (
        <p
          style={{
            color: "#888",
            fontStyle: "italic",
            fontSize: 16,
            marginTop: 40,
            textAlign: "center",
          }}
        >
          {searchTerm
            ? "🔍 No mods match your search."
            : "📦 No mods available."}
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {filteredMods.map((mod) => (
            <ModCard
              key={mod.modId || mod.id}
              mod={mod}
              inList={false}
              isInstalled={false}
              onClick={() => console.log("View mod:", mod.modId || mod.id)}
              onToggleInList={() =>
                console.log("Toggle mod in list:", mod.modId || mod.id)
              }
              onAddToServer={() =>
                console.log("Add to server:", mod.modId || mod.id)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModListView;
