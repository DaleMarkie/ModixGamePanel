import React from "react";
import { FaInfoCircle } from "react-icons/fa";

function SidebarUserInfo() {
  return (
    <section
      aria-label="Version Information"
      className="server-info-section"
      style={{
        padding: "8px 12px",
        background: "#1e1e1e",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <FaInfoCircle size={16} color="#4cafef" />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "12px", color: "#888" }}>Version</span>
        <span style={{ fontSize: "14px", color: "#eee", fontWeight: 500 }}>
          1.1.2
        </span>
      </div>
    </section>
  );
}

export default SidebarUserInfo;
