import React from "react";

const MyModListCard = ({ folderName }) => {
  return (
    <div
      style={{
        backgroundColor: "#1c1c1c",
        borderRadius: "10px",
        padding: "16px",
        boxShadow: "0 0 8px rgba(0, 0, 0, 0.5)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: "default",
      }}
    >
      <h3
        style={{ fontSize: "1rem", color: "#1DB954", wordBreak: "break-all" }}
      >
        {folderName}
      </h3>
      <p style={{ fontSize: "0.8rem", color: "#aaa" }}>
        Steam Workshop Mod Folder
      </p>
    </div>
  );
};

export default MyModListCard;
