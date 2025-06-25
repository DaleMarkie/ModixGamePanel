"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./ThemeManager.css";

const themes = [
  {
    id: "default",
    name: "Default Theme",
    description: "Classic familiar look.",
    enabled: true,
  },
  {
    id: "dark",
    name: "Dark Theme",
    description: "Easy on the eyes, all dark.",
    enabled: false,
  },
  {
    id: "light",
    name: "Light Theme",
    description: "Clean and bright interface.",
    enabled: false,
  },
  {
    id: "neon",
    name: "Neon Glow",
    description: "Bold colors, minimal distraction.",
    enabled: false,
  },
];

const ThemeManager = () => {
  const [selectedThemeId, setSelectedThemeId] = useState("default");
  const router = useRouter();

  const selectedTheme = themes.find((t) => t.id === selectedThemeId);

  const handleApplyTheme = () => {
    alert(`Applied ${selectedTheme.name}. Implement switching logic here.`);
  };

  return (
    <div className="theme-manager-container">
      <header>
        <h1>Pick your theme</h1>
        <button className="back-button" onClick={() => router.back()}>
          ← Back
        </button>
      </header>

      <div className="theme-list">
        {themes.map((theme) => {
          const isSelected = selectedThemeId === theme.id;
          const isEnabled = theme.enabled;

          return (
            <div
              key={theme.id}
              className={`theme-item ${isSelected ? "selected" : ""} ${
                !isEnabled ? "disabled" : ""
              }`}
              onClick={() => isEnabled && setSelectedThemeId(theme.id)}
              role={isEnabled ? "button" : "presentation"}
              tabIndex={isEnabled ? 0 : -1}
              onKeyDown={(e) => {
                if (isEnabled && (e.key === "Enter" || e.key === " ")) {
                  setSelectedThemeId(theme.id);
                }
              }}
            >
              <div className="selection-bar" />
              <div className="theme-info">
                <h3>{theme.name}</h3>
                <p>{theme.description}</p>
              </div>
              {!isEnabled && <div className="coming-soon-badge">BAD</div>}
              {!isEnabled && (
                <div className="coming-soon-text">Coming Soon</div>
              )}
            </div>
          );
        })}
      </div>

      <button
        className="apply-button"
        onClick={handleApplyTheme}
        disabled={!selectedTheme?.enabled}
      >
        Apply Theme
      </button>
    </div>
  );
};

export default ThemeManager;
