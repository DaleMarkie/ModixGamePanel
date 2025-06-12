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
  margin: "10px 8px 0 0",
  borderRadius: 6,
  border: "none",
  fontWeight: "600",
  cursor: "pointer",
  userSelect: "none",
  minWidth: 100,
  fontSize: 16,
};

const cancelButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#555",
  color: "#eee",
};

const confirmButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#e63946",
  color: "white",
  transition: "background-color 0.3s ease",
};

const DeleteModPage = ({ mod, onClose }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Focus trap or escape key close could be added here if needed
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/mods/delete/${mod.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to delete mod");
      }

      onClose(true); // Notify parent of successful deletion
    } catch (err) {
      setError(err.message || "Error deleting mod");
      setIsDeleting(false);
    }
  };

  if (!mod) return null;

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-labelledby="deleteModTitle">
      <div style={modalStyle}>
        <button aria-label="Close delete dialog" style={closeButtonStyle} onClick={() => onClose(false)}>
          &times;
        </button>

        <h2 id="deleteModTitle" style={{ marginBottom: 16 }}>
          Delete Mod
        </h2>

        <p>
          Are you sure you want to delete <strong>{mod.name || "this mod"}</strong> (ID: {mod.id})? This action cannot be undone.
        </p>

        {error && (
          <p style={{ color: "#e63946", marginTop: 12, fontWeight: "600" }}>
            Error: {error}
          </p>
        )}

        <div style={{ marginTop: 24, textAlign: "right" }}>
          <button
            style={cancelButtonStyle}
            onClick={() => onClose(false)}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            style={confirmButtonStyle}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteModPage.propTypes = {
  mod: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired, // onClose(didDelete: boolean)
};

export default DeleteModPage;
