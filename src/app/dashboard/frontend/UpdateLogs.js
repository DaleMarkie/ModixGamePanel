import React from "react";

const UpdateLogs = ({ logs }) => {
  return (
    <section style={{
      marginTop: "30px",
      backgroundColor: "#111",
      padding: "15px",
      borderRadius: "8px",
      color: "#ccc",
      maxHeight: "150px",
      overflowY: "auto"
    }}>
      <h3>Update Logs</h3>
      <ul>
        {logs.map((log, idx) => (
          <li key={idx} style={{ marginBottom: "6px" }}>{log}</li>
        ))}
      </ul>
    </section>
  );
};

export default UpdateLogs;
