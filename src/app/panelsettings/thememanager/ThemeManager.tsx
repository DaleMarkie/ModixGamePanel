"use client";

import React, { useState, useEffect } from "react";
import "./ThemeManager.css";

const THEME_KEY = "modix_dashboard_theme";

// Preset backgrounds
const presets = [
  { label: "Default", url: "" },
  {
    label: "Zomboid 1",
    url: "https://cdn2.steamgriddb.com/hero_thumb/c2c7ffbead20a173f41e55773c10a930.jpg",
  },
  { label: "Zomboid 2", url: "https://i.imgur.com/3Q5qLQ0.jpg" },
  { label: "Zomboid 3", url: "https://i.imgur.com/QdFzP0a.jpg" },
  { label: "Zomboid 4", url: "https://i.imgur.com/wmJt0aK.jpg" },
];

const defaultTheme = {
  background: "",
  logo: "https://i.ibb.co/cMPwcn8/logo.png",
  title: "Modix Game Panel",
  icons: {}, // { menuLabel: "fa-icon-class" }
  menuOrder: [], // you can populate with nav labels
};

export default function ThemeManager() {
  const [theme, setTheme] = useState(defaultTheme);

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) setTheme(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
    alert("Theme saved!");
  };

  const handleReset = () => {
    localStorage.removeItem(THEME_KEY);
    setTheme(defaultTheme);
  };

  const handleIconChange = (label: string, value: string) => {
    setTheme((prev) => ({ ...prev, icons: { ...prev.icons, [label]: value } }));
  };

  const handleReorder = (label: string, direction: "up" | "down") => {
    const index = theme.menuOrder.indexOf(label);
    if (index === -1) return;
    const newOrder = [...theme.menuOrder];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newOrder.length) return;
    [newOrder[index], newOrder[swapIndex]] = [
      newOrder[swapIndex],
      newOrder[index],
    ];
    setTheme((prev) => ({ ...prev, menuOrder: newOrder }));
  };

  return (
    <main className="theme-manager-container">
      <h1 className="title">🎨 Theme Manager</h1>
      <p className="subtitle">
        Customize your Modix Dashboard: background, logo, title, icons, and menu
        order.
      </p>

      {/* Preset backgrounds */}
      <div className="preset-sidebar">
        {presets.map((p) => (
          <div
            key={p.label}
            className={`preset-box ${
              theme.background === p.url ? "selected" : ""
            }`}
            style={{ backgroundImage: p.url ? `url(${p.url})` : "none" }}
            onClick={() => setTheme({ ...theme, background: p.url })}
          >
            <span>{p.label}</span>
          </div>
        ))}
      </div>

      {/* Custom background input */}
      <div className="input-group">
        <label>Custom Background URL:</label>
        <input
          type="text"
          placeholder="Enter image URL..."
          value={theme.background}
          onChange={(e) => setTheme({ ...theme, background: e.target.value })}
        />
      </div>

      <div className="input-group">
        <label>Sidebar Logo URL:</label>
        <input
          type="text"
          placeholder="Logo URL..."
          value={theme.logo}
          onChange={(e) => setTheme({ ...theme, logo: e.target.value })}
        />
      </div>

      <div className="input-group">
        <label>Sidebar Title:</label>
        <input
          type="text"
          placeholder="Sidebar Title..."
          value={theme.title}
          onChange={(e) => setTheme({ ...theme, title: e.target.value })}
        />
      </div>

      {/* Menu icons & reorder */}
      <div className="menu-icons-section">
        <h2>Menu Icons (FontAwesome class)</h2>
        {theme.menuOrder.map((label) => (
          <div key={label} className="menu-icon-row">
            <span className="menu-label">{label}</span>
            <input
              type="text"
              placeholder="fa-icon-class"
              value={theme.icons[label] || ""}
              onChange={(e) => handleIconChange(label, e.target.value)}
            />
            <button onClick={() => handleReorder(label, "up")}>⬆️</button>
            <button onClick={() => handleReorder(label, "down")}>⬇️</button>
          </div>
        ))}
      </div>

      {/* Save / Reset */}
      <div className="action-buttons">
        <button className="save-button" onClick={handleSave}>
          💾 Save
        </button>
        <button className="reset-button" onClick={handleReset}>
          ♻️ Reset
        </button>
      </div>

      {/* Live preview */}
      <div
        className="preview-box"
        style={{
          backgroundImage: theme.background
            ? `url(${theme.background})`
            : "none",
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <img src={theme.logo} alt="Logo Preview" className="preview-logo" />
        <h3 className="preview-title">{theme.title}</h3>
      </div>
    </main>
  );
}
