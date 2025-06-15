import React, { useState } from "react";

const modalOverlayStyle = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 3000,
};

const modalContentStyle = {
  backgroundColor: "#222",
  color: "white",
  padding: 24,
  borderRadius: 8,
  minWidth: 320,
  maxWidth: 480,
  boxShadow: "0 0 10px #1DB954",
  position: "relative",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const closeButtonStyle = {
  position: "absolute",
  top: 12,
  right: 12,
  background: "transparent",
  border: "none",
  color: "white",
  fontSize: 24,
  cursor: "pointer",
};

const buttonStyle = {
  marginTop: 20,
  padding: "8px 16px",
  backgroundColor: "#1DB954",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  color: "white",
  fontWeight: "600",
  fontSize: 16,
};

function UpdateMod({ mod, onClose }) {
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  if (!mod) return null;

  const handleUpdateClick = () => {
    setUpdating(true);
    setMessage("");
    setTimeout(() => {
      setUpdating(false);
      setMessage(`Mod "${mod.name}" updated successfully!`);
    }, 1500);
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
        <button aria-label="Close modal" style={closeButtonStyle} onClick={onClose}>
          &times;
        </button>
        <h2>Update Mod</h2>
        <p><strong>Name:</strong> {mod.name}</p>
        <p><strong>ID:</strong> {mod.id}</p>
        <button
          style={buttonStyle}
          onClick={handleUpdateClick}
          disabled={updating}
        >
          {updating ? "Updating..." : "Update Now"}
        </button>
        {message && <p style={{ marginTop: 16, color: "#1DB954" }}>{message}</p>}
      </div>
    </div>
  );
}

export default UpdateMod;
