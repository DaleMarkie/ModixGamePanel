import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GameManager.css";

const themes = [
  { id: "dark", name: "Dark Theme", description: "A sleek dark mode for comfortable night use." },
  { id: "light", name: "Light Theme", description: "Bright and clean look for daylight hours." },
  { id: "neon", name: "Neon Glow", description: "Vibrant neon colors with high contrast." },
];

const GameManager = () => {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const navigate = useNavigate();

  const handleApplyTheme = () => {
    if (selectedTheme) {
      alert(`Applied ${selectedTheme.name}! (You can implement actual theme switching logic here)`);
      // TODO: Add real theme switch logic here
    }
  };

  return (
    <div className="theme-manager-container">
      <header>
        <h1>🎨 Theme Manager</h1>
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      </header>

      <div className="themes-list">
        {themes.map(theme => (
          <div
            key={theme.id}
            className={`theme-card ${selectedTheme?.id === theme.id ? "selected" : ""}`}
            onClick={() => setSelectedTheme(theme)}
          >
            <h3>{theme.name}</h3>
            <p>{theme.description}</p>
          </div>
        ))}
      </div>

      <button
        className="apply-button"
        onClick={handleApplyTheme}
        disabled={!selectedTheme}
      >
        Apply Theme
      </button>
    </div>
  );
};

export default GameManager;
