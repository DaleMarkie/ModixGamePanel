"use client";

import React, { useState, useEffect } from "react";
import "./ThemeManager.css";

const THEME_KEY = "modix_dashboard_theme";

// Image backgrounds
const imagePresets = [
  { label: "Default", url: "" },
  {
    label: "Zomboid 1",
    url: "https://cdn2.steamgriddb.com/hero_thumb/c2c7ffbead20a173f41e55773c10a930.jpg",
  },
  { label: "Zomboid 2", url: "https://images7.alphacoders.com/627/627909.jpg" },
  { label: "Zomboid 3", url: "https://i.imgur.com/QdFzP0a.jpg" },
  { label: "Zomboid 4", url: "https://i.imgur.com/wmJt0aK.jpg" },
];

// Gradient backgrounds
const gradientPresets = [
  {
    label: "Neon Green",
    gradient: "linear-gradient(135deg, #00ff99, #0077ff)",
  },
  {
    label: "Midnight Purple",
    gradient: "linear-gradient(135deg, #3a0ca3, #7209b7)",
  },
  { label: "Inferno", gradient: "linear-gradient(135deg, #ff512f, #dd2476)" },
  {
    label: "Ocean Blue",
    gradient: "linear-gradient(135deg, #2193b0, #6dd5ed)",
  },
  {
    label: "Dark Emerald",
    gradient: "linear-gradient(135deg, #004d40, #00796b)",
  },
  {
    label: "Cyber Pink",
    gradient: "linear-gradient(135deg, #ff00cc, #333399)",
  },
];

const defaultTheme = {
  background: "",
  gradient: "",
  logo: "https://i.ibb.co/cMPwcn8/logo.png",
  title: "Modix Game Panel",
  icons: {},
  menuOrder: [],
};

export default function ThemeManager() {
  const [theme, setTheme] = useState(defaultTheme);

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      const savedTheme = JSON.parse(saved);
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  // Apply theme on change
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (t: typeof defaultTheme) => {
    const body = document.body;
    if (t.gradient) {
      body.style.background = t.gradient;
    } else if (t.background) {
      body.style.background = `url(${t.background}) no-repeat center center fixed`;
      body.style.backgroundSize = "cover";
    } else {
      body.style.background = "";
    }
  };

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
        Customize your Modix Dashboard: background, gradients, logo, title,
        icons, and menu order.
      </p>

      {/* IMAGE PRESETS */}
      <h2 className="section-title">🖼️ Image Backgrounds</h2>
      <div className="preset-row">
        {imagePresets.map((p) => {
          const isSelected = theme.background === p.url;
          return (
            <div
              key={p.label}
              className={`preset-box ${isSelected ? "selected" : ""}`}
              style={{
                backgroundImage: p.url ? `url(${p.url})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              onClick={() =>
                setTheme({ ...theme, background: p.url, gradient: "" })
              }
            >
              <span className="preset-label">{p.label}</span>
            </div>
          );
        })}
      </div>

      {/* GRADIENT PRESETS */}
      <h2 className="section-title">🌈 Gradient Backgrounds</h2>
      <div className="preset-row">
        {gradientPresets.map((p) => {
          const isSelected = theme.gradient === p.gradient;
          return (
            <div
              key={p.label}
              className={`preset-box gradient ${isSelected ? "selected" : ""}`}
              style={{ backgroundImage: p.gradient }}
              onClick={() =>
                setTheme({ ...theme, gradient: p.gradient, background: "" })
              }
            >
              <span className="preset-label">{p.label}</span>
            </div>
          );
        })}
      </div>

      {/* Custom inputs */}
      <div className="input-group">
        <label>Custom Background URL:</label>
        <input
          type="text"
          placeholder="Enter image URL..."
          value={theme.background}
          onChange={(e) =>
            setTheme({ ...theme, background: e.target.value, gradient: "" })
          }
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

      {/* Menu icons */}
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
          background:
            theme.gradient ||
            (theme.background ? `url(${theme.background})` : "none"),
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
