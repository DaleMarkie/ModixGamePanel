import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  zIndex: 3000,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  userSelect: "none",
};

const modalStyle = {
  backgroundColor: "#222",
  borderRadius: 10,
  padding: 24,
  width: 400,
  maxWidth: "90vw",
  color: "white",
  boxShadow: "0 4px 15px rgba(0,0,0,0.8)",
  position: "relative",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const closeButtonStyle = {
  position: "absolute",
  top: 10,
  right: 10,
  background: "transparent",
  border: "none",
  color: "white",
  fontSize: 24,
  fontWeight: "bold",
  cursor: "pointer",
  userSelect: "none",
};

const buttonStyle = {
  padding: "10px 18px",
  marginTop: 20,
  borderRadius: 6,
  border: "none",
  fontWeight: "600",
  cursor: "pointer",
  userSelect: "none",
  minWidth: 100,
  fontSize: 16,
  backgroundColor: "#1DB954",
  color: "white",
  transition: "background-color 0.3s ease",
};

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #444",
  backgroundColor: "#111",
  color: "white",
  fontSize: 16,
  boxSizing: "border-box",
};

const labelStyle = {
  marginTop: 12,
  marginBottom: 6,
  fontWeight: "600",
};

const AddToServer = ({ mod, onClose, onAdded }) => {
  const [serverName, setServerName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleAdd = async () => {
    if (!serverName.trim()) {
      setError("Please enter a server name.");
      return;
    }
    setIsAdding(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/mods/add-to-server`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modId: mod.id, serverName }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to add mod to server");
      }

      setSuccessMsg(`Mod "${mod.name}" added to server "${serverName}" successfully.`);
      onAdded?.(mod, serverName);

      // Optionally auto-close after delay:
      setTimeout(() => onClose(true), 1500);
    } catch (err) {
      setError(err.message || "Error adding mod to server");
      setIsAdding(false);
    }
  };

  if (!mod) return null;

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-labelledby="addToServerTitle">
      <div style={modalStyle}>
        <button aria-label="Close add to server dialog" style={closeButtonStyle} onClick={() => onClose(false)}>
          &times;
        </button>

        <h2 id="addToServerTitle" style={{ marginBottom: 16 }}>
          Add Mod to Server
        </h2>

        <p>
          Add <strong>{mod.name || "this mod"}</strong> (ID: {mod.id}) to a server by specifying the server name below.
        </p>

        <label htmlFor="serverNameInput" style={labelStyle}>Server Name:</label>
        <input
          id="serverNameInput"
          type="text"
          placeholder="Enter server name"
          style={inputStyle}
          value={serverName}
          onChange={(e) => setServerName(e.target.value)}
          disabled={isAdding}
        />

        {error && (
          <p style={{ color: "#e63946", marginTop: 12, fontWeight: "600" }}>
            Error: {error}
          </p>
        )}

        {successMsg && (
          <p style={{ color: "#1DB954", marginTop: 12, fontWeight: "600" }}>
            {successMsg}
          </p>
        )}

        <button
          style={buttonStyle}
          onClick={handleAdd}
          disabled={isAdding}
          aria-disabled={isAdding}
        >
          {isAdding ? "Adding..." : "Add to Server"}
        </button>
      </div>
    </div>
  );
};

AddToServer.propTypes = {
  mod: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired, // onClose(didAdd: boolean)
  onAdded: PropTypes.func, // optional callback on success
};

export default AddToServer;
