"use client";

import React, { useState, useEffect } from "react";
import "./ThemeManager.css";

const THEME_KEY = "modix_dashboard_theme";

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

const gradientPresets = [
  { label: "Neon Green", gradient: "linear-gradient(135deg,#00ff99,#0077ff)" },
  {
    label: "Midnight Purple",
    gradient: "linear-gradient(135deg,#3a0ca3,#7209b7)",
  },
  { label: "Inferno", gradient: "linear-gradient(135deg,#ff512f,#dd2476)" },
  { label: "Ocean Blue", gradient: "linear-gradient(135deg,#2193b0,#6dd5ed)" },
  { label: "Cyber Pink", gradient: "linear-gradient(135deg,#ff00cc,#333399)" },
  { label: "Eclipse", gradient: "linear-gradient(135deg,#141e30,#243b55)" },
  {
    label: "Dark Emerald",
    gradient: "linear-gradient(135deg,#004d40,#00796b)",
  },
  {
    label: "Deep Space",
    gradient: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
  },
  { label: "Vampire Red", gradient: "linear-gradient(135deg,#3a0000,#800000)" },
  {
    label: "Shadow Purple",
    gradient: "linear-gradient(135deg,#2c003e,#4b0082)",
  },

  // Extra Gaming Panel Gradients
  {
    label: "Electric Blue",
    gradient: "linear-gradient(135deg,#1e3c72,#2a5298)",
  },
  { label: "Neon Sunset", gradient: "linear-gradient(135deg,#ff7e5f,#feb47b)" },
  {
    label: "Pixel Storm",
    gradient: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
  },
  { label: "Retro Wave", gradient: "linear-gradient(135deg,#ff0080,#7928ca)" },
  {
    label: "Digital Lava",
    gradient: "linear-gradient(135deg,#ff416c,#ff4b2b)",
  },
  {
    label: "Glitch Green",
    gradient: "linear-gradient(135deg,#00ff00,#00ffaa)",
  },
  { label: "Neon Violet", gradient: "linear-gradient(135deg,#8e2de2,#4a00e0)" },
  {
    label: "Cosmic Purple",
    gradient: "linear-gradient(135deg,#4b6cb7,#182848)",
  },
  { label: "Arcade Pink", gradient: "linear-gradient(135deg,#ff5f6d,#ffc371)" },
  {
    label: "Cyber Grid",
    gradient: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
  },
  { label: "Rogue Red", gradient: "linear-gradient(135deg,#ff0000,#8b0000)" },
  { label: "Dark Cyber", gradient: "linear-gradient(135deg,#232526,#414345)" },
  { label: "Synthwave", gradient: "linear-gradient(135deg,#fc466b,#3f5efb)" },
  {
    label: "Plasma Blue",
    gradient: "linear-gradient(135deg,#1a2a6c,#b21f1f,#fdbb2d)",
  },
  { label: "Night Rider", gradient: "linear-gradient(135deg,#0f0c29,#302b63)" },
  {
    label: "Techno Orange",
    gradient: "linear-gradient(135deg,#f7971e,#ffd200)",
  },
  { label: "Neon Rage", gradient: "linear-gradient(135deg,#ff416c,#ff4b2b)" },
  {
    label: "Galactic Pink",
    gradient: "linear-gradient(135deg,#ff6a00,#ee0979)",
  },
  {
    label: "Quantum Blue",
    gradient: "linear-gradient(135deg,#11998e,#38ef7d)",
  },
  { label: "Holographic", gradient: "linear-gradient(135deg,#f0f,#0ff)" },
  { label: "Vaporwave", gradient: "linear-gradient(135deg,#ff9a9e,#fad0c4)" },
  {
    label: "Electric Sunset",
    gradient: "linear-gradient(135deg,#ff5f6d,#ffc371)",
  },
  {
    label: "Cybernetic",
    gradient: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
  },
  { label: "Glitch Red", gradient: "linear-gradient(135deg,#ff0000,#ff4b2b)" },
  {
    label: "Dark Horizon",
    gradient: "linear-gradient(135deg,#141e30,#243b55)",
  },
  { label: "Neon Matrix", gradient: "linear-gradient(135deg,#00ff00,#006400)" },
  { label: "Lava Flow", gradient: "linear-gradient(135deg,#ff512f,#dd2476)" },
  { label: "Abyss", gradient: "linear-gradient(135deg,#000428,#004e92)" },
  { label: "Frozen Grid", gradient: "linear-gradient(135deg,#00d2ff,#3a7bd5)" },
];

const defaultTheme = {
  background: "",
  gradient: "",
  video: "",
  logo: "https://i.ibb.co/cMPwcn8/logo.png",
  title: "Modix Game Panel",
};

export default function ThemeManager() {
  const [theme, setTheme] = useState(defaultTheme);
  const [draft, setDraft] = useState(defaultTheme);
  const [tab, setTab] = useState("gradients");
  const [showConfirm, setShowConfirm] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setTheme(parsed);
      setDraft(parsed);
      applyTheme(parsed);
    } else applyTheme(defaultTheme);
  }, []);

  const applyTheme = (t: typeof defaultTheme) => {
    const body = document.body;
    body.style.background = "";
    if (t.video) {
      let videoEl = document.getElementById("bg-video") as HTMLVideoElement;
      if (!videoEl) {
        videoEl = document.createElement("video");
        videoEl.id = "bg-video";
        videoEl.autoplay = true;
        videoEl.loop = true;
        videoEl.muted = true;
        videoEl.style.position = "fixed";
        videoEl.style.top = "0";
        videoEl.style.left = "0";
        videoEl.style.width = "100%";
        videoEl.style.height = "100%";
        videoEl.style.objectFit = "cover";
        videoEl.style.zIndex = "-1";
        document.body.appendChild(videoEl);
      }
      videoEl.src = t.video;
      videoEl.play();
    } else if (t.gradient) {
      body.style.background = t.gradient;
    } else if (t.background) {
      body.style.background = `url(${t.background}) center/cover fixed no-repeat`;
    }

    document.documentElement.style.setProperty(
      "--sidebar-logo",
      `url(${t.logo})`
    );
  };

  const handleSave = () => {
    setTheme(draft);
    localStorage.setItem(THEME_KEY, JSON.stringify(draft));
    applyTheme(draft);
    setSavedMessage("✅ Theme saved successfully!");
    setTimeout(() => setSavedMessage(""), 2000);
  };

  const handleReset = () => {
    setTheme(defaultTheme);
    setDraft(defaultTheme);
    localStorage.removeItem(THEME_KEY);
    applyTheme(defaultTheme);
    setShowConfirm(false);
  };

  const handlePreview = (preset: any) => {
    const body = document.body;
    body.style.background = "";
    if (preset.url)
      body.style.background = `url(${preset.url}) center/cover fixed`;
    else if (preset.gradient) body.style.background = preset.gradient;
  };

  const handleMouseLeave = () => applyTheme(theme);

  return (
    <main className="theme-manager-container glass-panel">
      <h1 className="title">🎨 Theme Manager</h1>
      <p className="subtitle">
        Customize your dashboard background, logo, and title. Click “Save
        Changes” when ready.
      </p>

      {/* Tabs */}
      <div className="tab-bar">
        <button
          className={tab === "images" ? "active" : ""}
          onClick={() => setTab("images")}
        >
          🖼️ Images
        </button>
        <button
          className={tab === "gradients" ? "active" : ""}
          onClick={() => setTab("gradients")}
        >
          🌈 Gradients
        </button>
        <button
          className={tab === "custom" ? "active" : ""}
          onClick={() => setTab("custom")}
        >
          ⚙️ Custom
        </button>
      </div>

      {/* Image tab */}
      {tab === "images" && (
        <div className="preset-row">
          {imagePresets.map((p) => (
            <div
              key={p.label}
              className={`preset-box ${
                draft.background === p.url ? "selected" : ""
              }`}
              style={{
                backgroundImage: `url(${p.url})`,
                backgroundSize: "cover",
              }}
              onClick={() =>
                setDraft({
                  ...draft,
                  background: p.url,
                  gradient: "",
                  video: "",
                })
              }
              onMouseEnter={() => handlePreview(p)}
              onMouseLeave={handleMouseLeave}
            >
              <span className="preset-label">{p.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Gradient tab */}
      {tab === "gradients" && (
        <div className="preset-row">
          {gradientPresets.map((p) => (
            <div
              key={p.label}
              className={`preset-box gradient ${
                draft.gradient === p.gradient ? "selected" : ""
              }`}
              style={{ backgroundImage: p.gradient }}
              onClick={() =>
                setDraft({
                  ...draft,
                  gradient: p.gradient,
                  background: "",
                  video: "",
                })
              }
              onMouseEnter={() => handlePreview(p)}
              onMouseLeave={handleMouseLeave}
            >
              <span className="preset-label">{p.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Custom tab */}
      {tab === "custom" && (
        <>
          <div className="input-group">
            <label>Custom Background URL / Video (.mp4)</label>
            <input
              type="text"
              placeholder="Enter image or video URL..."
              value={draft.background || draft.video}
              onChange={(e) => {
                const val = e.target.value;
                if (val.endsWith(".mp4"))
                  setDraft({
                    ...draft,
                    video: val,
                    background: "",
                    gradient: "",
                  });
                else
                  setDraft({
                    ...draft,
                    background: val,
                    gradient: "",
                    video: "",
                  });
              }}
            />
          </div>
          <div className="input-group">
            <label>Sidebar Logo URL</label>
            <input
              type="text"
              placeholder="Enter logo URL..."
              value={draft.logo}
              onChange={(e) => setDraft({ ...draft, logo: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label>Sidebar Title</label>
            <input
              type="text"
              placeholder="Enter title..."
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div className="action-buttons">
            <button className="save-button" onClick={handleSave}>
              💾 Save Custom
            </button>
          </div>
        </>
      )}

      {/* Main actions */}
      <div className="action-buttons">
        <button className="save-button" onClick={handleSave}>
          💾 Save Changes
        </button>
        <button className="reset-button" onClick={() => setShowConfirm(true)}>
          ♻️ Reset Theme
        </button>
      </div>

      {savedMessage && <div className="save-message">{savedMessage}</div>}

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="confirm-modal">
          <div className="modal-content">
            <h3>Reset Theme?</h3>
            <p>This will restore default colors, background, and logo.</p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
