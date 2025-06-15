import React, { useState, useEffect } from "react";

export default function Settings() {
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:2010/api/settings/file")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch file");
        return res.text();
      })
      .then((text) => {
        setFileContent(text);
        setLoading(false);
      })
      .catch((err) => {
        setFileContent("# ERROR LOADING FILE\n" + err.message);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setFileContent(e.target.value);
  };

  const handleSave = (e) => {
    e.preventDefault();
    fetch("http://localhost:2010/api/settings/file", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: fileContent,
    })
      .then((res) => {
        if (res.ok) {
          alert("File saved successfully.");
        } else {
          alert("Failed to save file.");
        }
      })
      .catch(() => alert("Error saving file."));
  };

  if (loading) return <div>Loading file...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Project Zomboid server.ini</h2>
      <form onSubmit={handleSave}>
        <textarea
          value={fileContent}
          onChange={handleChange}
          rows={30}
          style={{ width: "100%", fontFamily: "monospace", fontSize: 14 }}
        />
        <button type="submit" style={{ marginTop: 10 }}>
          Save Changes
        </button>
      </form>
    </div>
  );
}
