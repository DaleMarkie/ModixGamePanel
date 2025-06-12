import React from "react";

const StatCard = ({ title, value }) => {
  return (
    <div style={{
      padding: "12px",
      borderRadius: "8px",
      backgroundColor: "#222",
      color: "#eee",
      minWidth: "140px",
      textAlign: "center",
      boxShadow: "0 0 8px #000"
    }}>
      <h4 style={{ marginBottom: "8px", fontWeight: "bold" }}>{title}</h4>
      <p style={{ fontSize: "1.5rem" }}>{value}</p>
    </div>
  );
};

export default StatCard;
