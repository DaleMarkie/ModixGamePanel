"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./ThemeManager.css"; // ✅ External CSS

const themeVariablesMap = {
  default: {
    "--bg-color": "#0e0e0e",
    "--card-bg": "#1b1b1b",
    "--card-border": "#2a2a2a",
    "--highlight": "#4caf50",
    "--disabled": "#444",
    "--main-text": "#f0f0f0",
    "--muted-text": "#999",
    "--badge-bg": "#e53935",
    "--text-color": "#f0f0f0",
  },
  dark: {
    "--bg-color": "#121212",
    "--card-bg": "#1e1e1e",
    "--card-border": "#333",
    "--highlight": "#81c784",
    "--disabled": "#555",
    "--main-text": "#e0e0e0",
    "--muted-text": "#bbb",
    "--badge-bg": "#d32f2f",
    "--text-color": "#e0e0e0",
  },
  light: {
    "--bg-color": "#fafafa",
    "--card-bg": "#fff",
    "--card-border": "#ddd",
    "--highlight": "#4caf50",
    "--disabled": "#ccc",
    "--main-text": "#222",
    "--muted-text": "#666",
    "--badge-bg": "#e53935",
    "--text-color": "#222",
  },
  neon: {
    "--bg-color": "#000",
    "--card-bg": "#111",
    "--card-border": "#0ff",
    "--highlight": "#0ff",
    "--disabled": "#088",
    "--main-text": "#0ff",
    "--muted-text": "#044",
    "--badge-bg": "#f0f",
    "--text-color": "#0ff",
  },
};

const defaultCustomTheme = {
  "--bg-color": "#222222",
  "--card-bg": "#333333",
  "--card-border": "#444444",
  "--highlight": "#4caf50",
  "--disabled": "#555555",
  "--main-text": "#e0e0e0",
  "--muted-text": "#999999",
  "--badge-bg": "#e53935",
  "--text-color": "#e0e0e0",
};

const themes = [
  { id: "default", name: "Default Theme", description: "Classic look" },
  { id: "dark", name: "Dark Theme", description: "Easy on the eyes" },
  { id: "light", name: "Light Theme", description: "Clean & bright" },
  { id: "neon", name: "Neon Glow", description: "Bold & vibrant" },
];

const randomColor = () =>
  "#" +
  Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");

export default function ThemeManager() {
  const router = useRouter();
  const [selectedThemeId, setSelectedThemeId] = useState("default");
  const [customThemeVars, setCustomThemeVars] = useState(defaultCustomTheme);
  const isCustom = selectedThemeId === "custom";

  useEffect(() => {
    const stored = localStorage.getItem("selectedTheme");
    const custom = localStorage.getItem("customThemeVars");
    if (stored) setSelectedThemeId(stored);
    if (custom) setCustomThemeVars(JSON.parse(custom));
  }, []);

  useEffect(() => {
    const vars = isCustom
      ? customThemeVars
      : themeVariablesMap[selectedThemeId];
    Object.entries(vars).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });
    localStorage.setItem("selectedTheme", selectedThemeId);
    if (isCustom) {
      localStorage.setItem("customThemeVars", JSON.stringify(customThemeVars));
    }
  }, [selectedThemeId, customThemeVars, isCustom]);

  const handleColorChange = (key: string, value: string) => {
    setCustomThemeVars((prev) => ({ ...prev, [key]: value }));
  };

  const randomize = () => {
    const randomized = Object.keys(defaultCustomTheme).reduce((acc, key) => {
      acc[key] = randomColor();
      return acc;
    }, {} as Record<string, string>);
    setCustomThemeVars(randomized);
  };

  return (
    <div className="theme-wrapper">
      <div className="theme-header">
        <h1>Pick your theme</h1>
        <button onClick={() => router.back()} className="btn back-btn">
          ← Back
        </button>
      </div>

      <div className="theme-grid">
        {[
          ...themes,
          { id: "custom", name: "Custom Theme", description: "Make it yours" },
        ].map((theme) => {
          const isSelected = theme.id === selectedThemeId;
          const vars =
            theme.id === "custom"
              ? customThemeVars
              : themeVariablesMap[theme.id];
          return (
            <div
              key={theme.id}
              className={`theme-card ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedThemeId(theme.id)}
            >
              <div className="theme-preview">
                {Object.values(vars)
                  .slice(0, 5)
                  .map((color, i) => (
                    <div
                      key={i}
                      className="color-dot"
                      style={{ backgroundColor: color }}
                    />
                  ))}
              </div>
              <h3>{theme.name}</h3>
              <p>{theme.description}</p>
            </div>
          );
        })}
      </div>

      {isCustom && (
        <div className="custom-panel">
          <div className="custom-header">
            <h2>Customize Theme</h2>
            <div className="custom-actions">
              <button className="btn random-btn" onClick={randomize}>
                🎲 Randomize
              </button>
              <button
                className="btn reset-btn"
                onClick={() => setCustomThemeVars(defaultCustomTheme)}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="custom-grid">
            {Object.entries(customThemeVars).map(([key, value]) => (
              <label key={key} className="color-input">
                <span>
                  {key.replace("--", "").replace(/-/g, " ").toUpperCase()}
                </span>
                <input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
