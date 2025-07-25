import React, { useEffect, useState } from "react";

const Favourites = ({ toggleFavorite }) => {
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load favorites on mount
  useEffect(() => {
    setLoading(true);
    fetch("/api/mods/favorites")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load favorites");
        return res.json();
      })
      .then((data) => {
        setMods(data);
      })
      .catch((err) => {
        setError(err.message);
        setMods([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (mod) => {
    if (!mod) return;
    try {
      await toggleFavorite(mod); // expects toggleFavorite to remove from favorites
      // After removal, refresh list
      setMods((prev) => prev.filter((m) => m.id !== mod.id));
    } catch (err) {
      alert("Failed to remove favorite mod");
    }
  };

  if (loading) return <p style={{ color: "#aaa" }}>Loading favorite mods...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!mods.length) return <p style={{ color: "#aaa" }}>No favorites yet.</p>;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 20,
      }}
    >
      {mods.map((mod) => (
        <div
          key={mod.id}
          style={{
            border: "1px solid #1DB954",
            borderRadius: 8,
            padding: 10,
            backgroundColor: "#222",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {mod.image && (
            <img
              src={mod.image}
              alt={mod.name}
              style={{ maxWidth: "100%", borderRadius: 6, marginBottom: 8 }}
            />
          )}
          <h4>{mod.name || "Unnamed Mod"}</h4>
          <p>ID: {mod.id}</p>
          <p>Workshop: {mod.workshopId || "N/A"}</p>
          <button
            onClick={() => handleRemove(mod)}
            style={{
              marginTop: "auto",
              backgroundColor: "#1DB954",
              color: "#000",
              border: "none",
              borderRadius: 4,
              padding: "6px 12px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Remove Favorite
          </button>
        </div>
      ))}
    </div>
  );
};

export default Favourites;
