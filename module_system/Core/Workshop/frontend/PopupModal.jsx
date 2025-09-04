import React from "react";

export default function PopupModal({ children, onClose }) {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "#1f3a1f",
        padding: "20px",
        borderRadius: "10px",
        width: "400px",
        color: "#fff",
        position: "relative"
      }}>
        <button onClick={onClose} style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "red",
          border: "none",
          color: "#fff",
          padding: "5px 10px",
          borderRadius: "5px",
          cursor: "pointer"
        }}>✖</button>
        {children}
      </div>
    </div>
  );
}
