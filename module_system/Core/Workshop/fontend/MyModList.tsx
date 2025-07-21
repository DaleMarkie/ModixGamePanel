import React, { useEffect, useState } from "react";
import MyModListCard from "./MyModListCard";

const MyModList = () => {
  const [modFolders, setModFolders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/mymods")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch mod folders");
        return res.json();
      })
      .then((data) => {
        setModFolders(data);
        setError("");
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div style={{ color: "red", padding: "1rem" }}>❌ {error}</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#1DB954", marginBottom: "20px" }}>📁 Local Mod Folders</h2>
      <div
        style={{
          display: "grid",
          gap: "16px",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        }}
      >
        {modFolders.map((folder, idx) => (
          <MyModListCard key={idx} folderName={folder} />
        ))}
      </div>
    </div>
  );
};

export default MyModList;
