import React from "react";

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 5000,
};

const modalBoxStyle = {
  backgroundColor: "#222",
  padding: 24,
  borderRadius: 12,
  width: 320,
  color: "white",
  boxShadow: "0 0 15px #1DB954",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const buttonStyle = {
  marginTop: 20,
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  backgroundColor: "#1DB954",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
};

export default function AddToServerModal({ mod, onClose }) {
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Add Mod to Server</h2>
        <p>
          You are about to add the mod:
          <br />
          <strong>{mod.title}</strong>
          <br />
          (Mod ID: {mod.modId})
        </p>
        <p>This is just a sample box. Implement your actual add logic here.</p>
        <button style={buttonStyle} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
