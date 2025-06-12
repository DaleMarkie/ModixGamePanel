import React, { useState } from "react";
import ModModal from "./ModModal"; // Make sure this is your updated modal
import "./ActiveModsList.css"; // Optional external CSS if you separate styles

export default function ActiveModsList() {
  const [mods, setMods] = useState([]);
  const [selectedMod, setSelectedMod] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const modIds = parseModsFromIni(reader.result);
      const fetchedMods = await Promise.all(
        modIds.map(async (id) => {
          try {
            const res = await fetch(`/api/mods/${id}`);
            if (!res.ok) throw new Error("Not found");
            const data = await res.json();
            return data;
          } catch {
            return { workshopId: id, title: `Mod ${id}`, description: "No info found" };
          }
        })
      );
      setMods(fetchedMods);
    };
    reader.readAsText(file);
  };

  return (
    <div style={pageStyle}>
      <h1 style={{ color: "#1DB954" }}>Active Mods</h1>
      <input
        type="file"
        accept=".ini"
        onChange={handleFileChange}
        style={{ marginBottom: 20 }}
      />
      <div style={modGridStyle}>
        {mods.map((mod) => (
          <div
            key={mod.workshopId}
            onClick={() => setSelectedMod(mod)}
            style={modCardStyle}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1b1b1b")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#222")}
          >
            <h2 style={{ fontSize: 20 }}>{mod.title || mod.workshopId}</h2>
            <div style={badgeStyle}>🟢 Active</div>
          </div>
        ))}
      </div>

      {selectedMod && (
        <ModModal mod={selectedMod} onClose={() => setSelectedMod(null)} />
      )}
    </div>
  );
}

// ---------------------
// Utils
// ---------------------
const parseModsFromIni = (text) => {
  const line = text.split(/\r?\n/).find((l) => l.startsWith("WorkshopItems="));
  if (!line) return [];
  return line
    .split("=")[1]
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
};

// ---------------------
// Styles
// ---------------------
const pageStyle = {
  padding: 20,
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  backgroundColor: "#121212",
  color: "#eee",
  minHeight: "100vh",
};

const modGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: 16,
  marginTop: 20,
};

const modCardStyle = {
  backgroundColor: "#222",
  padding: 16,
  borderRadius: 12,
  cursor: "pointer",
  boxShadow: "0 6px 14px rgba(0,0,0,0.5)",
  userSelect: "none",
};

const badgeStyle = {
  backgroundColor: "#1DB954",
  color: "#111",
  fontWeight: "bold",
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: "14px",
  fontSize: "14px",
  marginTop: 8,
};
