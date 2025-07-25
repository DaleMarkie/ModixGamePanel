import React from "react";

const overlayStyle = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 3000,
};

const popupStyle = {
  backgroundColor: "#222",
  padding: 20,
  borderRadius: 8,
  color: "white",
  minWidth: 300,
  maxWidth: "90vw",
};

export default function OpenFolderPopup({ mod, onClose }) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={popupStyle} onClick={e => e.stopPropagation()}>
        <h2>Open Folder</h2>
        <p>Folder path for mod:</p>
        <code>{`/mods/${mod.id}`}</code>
        <p>(You can add actual folder browser here.)</p>
        <button onClick={onClose} style={{ marginTop: 20 }}>
          Close
        </button>
      </div>
    </div>
  );
}
