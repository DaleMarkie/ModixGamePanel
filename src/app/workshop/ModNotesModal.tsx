import React, { useState, useEffect } from "react";

const ModNotesModal = ({ mod, onClose }) => {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!mod?.id) return;

    fetch(`/api/mods/notes/${mod.id}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch notes");
        return res.json();
      })
      .then(data => setNotes(data.notes || ""))
      .catch(err => console.error("Failed to load mod notes:", err));
  }, [mod]);

  const handleSave = () => {
    fetch(`/api/mods/notes/${mod.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to save notes");
        return res.json();
      })
      .then(data => {
        console.log("Notes saved:", data);
        onClose();
      })
      .catch(err => console.error("Failed to save notes:", err));
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 3000
      }}
    >
      <div
        style={{
          backgroundColor: "#1c1c1c",
          padding: 20,
          borderRadius: 10,
          width: 500,
          boxShadow: "0 0 10px black",
          color: "white"
        }}
      >
        <h2>Notes for: {mod.name}</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{
            width: "100%",
            height: 200,
            backgroundColor: "#2a2a2a",
            border: "1px solid #444",
            color: "#fff",
            padding: 10,
            borderRadius: 5,
            resize: "vertical"
          }}
        />
        <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ backgroundColor: "#555", color: "white", padding: "6px 12px", border: "none", borderRadius: 4 }}>
            Cancel
          </button>
          <button onClick={handleSave} style={{ backgroundColor: "#1DB954", color: "white", padding: "6px 12px", border: "none", borderRadius: 4 }}>
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModNotesModal;
