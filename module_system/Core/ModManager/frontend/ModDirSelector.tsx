import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:2010/api";

interface ModDirSelectorProps {
  onDirChange?: (dir: string) => void;
}

const ModDirSelector: React.FC<ModDirSelectorProps> = ({ onDirChange }) => {
  const [dir, setDir] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/mods/getdir`)
      .then(res => res.json())
      .then(data => setDir(data.path || ""))
      .catch(err => console.error("Failed to fetch mod dir:", err));
  }, []);

  const saveDir = () => {
    fetch(`${API_BASE}/mods/setdir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: dir }),
    })
      .then(res => res.json())
      .then(() => {
        alert("✅ Mod directory updated!");
        if (onDirChange) onDirChange(dir);
      })
      .catch(err => console.error("Failed to save mod dir:", err));
  };

  return (
    <div className="moddir-selector">
      <input
        type="text"
        value={dir}
        onChange={(e) => setDir(e.target.value)}
        placeholder="Enter mod directory path"
      />
      <button onClick={saveDir}>Select Mod Dir</button>
    </div>
  );
};

export default ModDirSelector;
