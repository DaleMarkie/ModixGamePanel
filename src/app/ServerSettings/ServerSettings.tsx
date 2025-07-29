"use client";
import React, { useState, useMemo } from "react";
import "./ServerSettings.css";

const ZOMBOID_FOLDER_PATH = "/home/modix/Zomboid"; // Change this to your actual path

const allSettings = [
  {
    category: "🛡️ Server Info",
    description: "Basic server info and connection settings.",
    settings: [
      {
        name: "PublicName",
        label: "Server Name",
        type: "text",
        placeholder: "My awesome PZ server",
        tooltip: "The name that shows in server lists.",
        valueType: "string",
      },
      {
        name: "MaxPlayers",
        label: "Max Players",
        type: "number",
        min: 1,
        max: 64,
        tooltip: "Maximum allowed players on the server.",
        valueType: "number",
      },
      {
        name: "Password",
        label: "Password",
        type: "text",
        placeholder: "Leave empty for no password",
        tooltip: "Password players need to connect, optional.",
        valueType: "string",
      },
      {
        name: "PVP",
        label: "Enable PvP",
        type: "checkbox",
        tooltip: "Allow players to attack each other.",
        valueType: "boolean",
      },
    ],
  },
  {
    category: "🧟‍♂️ Zombies & Gameplay",
    description: "Customize zombies and gameplay mechanics.",
    settings: [
      {
        name: "ZombieCount",
        label: "Zombie Count (%)",
        type: "number",
        min: 0,
        max: 100,
        tooltip: "Percent of default zombie spawn rate.",
        valueType: "number",
      },
      {
        name: "XPMultiplier",
        label: "XP Multiplier",
        type: "number",
        min: 0.1,
        max: 10,
        step: 0.1,
        tooltip: "Speed multiplier for XP gain.",
        valueType: "number",
      },
      {
        name: "DayLength",
        label: "Day Length (hours)",
        type: "number",
        min: 0.25,
        max: 4,
        step: 0.25,
        tooltip: "Duration of an in-game day.",
        valueType: "number",
      },
    ],
  },
  {
    category: "🌍 World & Visuals",
    description: "World generation and visual settings.",
    settings: [
      {
        name: "StartMonth",
        label: "Start Month",
        type: "number",
        min: 1,
        max: 12,
        tooltip: "Month the game world starts in.",
        valueType: "number",
      },
      {
        name: "StartYear",
        label: "Start Year",
        type: "number",
        min: 2020,
        max: 2100,
        tooltip: "Year the game world starts in.",
        valueType: "number",
      },
      {
        name: "Enable3rdPerson",
        label: "Enable 3rd Person View",
        type: "checkbox",
        tooltip: "Allow players to use 3rd person camera.",
        valueType: "boolean",
      },
    ],
  },
];

// Default values to initialize the form
const defaultValues = {
  PublicName: "My PZ Server",
  MaxPlayers: 8,
  Password: "",
  PVP: false,
  ZombieCount: 50,
  XPMultiplier: 1,
  DayLength: 1,
  StartMonth: 3,
  StartYear: 2025,
  Enable3rdPerson: false,
};

function ZomboidFolderInfo() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ZOMBOID_FOLDER_PATH);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="zomboid-folder-info" role="region" aria-label="Zomboid folder path">
      <span role="img" aria-label="folder" className="folder-emoji">
        📁
      </span>
      <p className="folder-text" title={ZOMBOID_FOLDER_PATH}>
        Project Zomboid Server Folder: <code>{ZOMBOID_FOLDER_PATH}</code>
      </p>
      <button className="copy-button" onClick={handleCopy} aria-live="polite">
        {copied ? "Copied ✅" : "Copy Path"}
      </button>
    </div>
  );
}

export default function ServerSettingsFancy() {
  const [settings, setSettings] = React.useState(defaultValues);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [collapsedCategories, setCollapsedCategories] = React.useState({});

  // Filter settings by search term
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return allSettings;

    const lower = search.toLowerCase();
    return allSettings
      .map((cat) => {
        const filteredSettings = cat.settings.filter(
          (s) =>
            s.label.toLowerCase().includes(lower) ||
            (s.tooltip && s.tooltip.toLowerCase().includes(lower))
        );
        if (filteredSettings.length > 0) {
          return { ...cat, settings: filteredSettings };
        }
        return null;
      })
      .filter(Boolean);
  }, [search]);

  function toggleCategory(catName) {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  }

  function handleChange(e, type, name) {
    let val;
    if (type === "checkbox") val = e.target.checked;
    else if (type === "number") val = Number(e.target.value);
    else val = e.target.value;

    setSettings((prev) => ({
      ...prev,
      [name]: val,
    }));
  }

  function handleSave() {
    setSaving(true);
    setMessage("");
    setTimeout(() => {
      setSaving(false);
      setMessage("✅ Settings saved successfully!");
      // TODO: connect to backend API here
    }, 1200);
  }

  return (
    <div className="fancy-wrapper">
      <header className="fancy-header">
        <h1>⚙️ Project Zomboid Server Settings</h1>
        <ZomboidFolderInfo />
        <input
          type="search"
          className="search-input"
          placeholder="🔍 Search settings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          aria-label="Search server settings"
        />
      </header>

      <main className="settings-main">
        {filteredCategories.length === 0 ? (
          <p className="no-results">No settings match your search.</p>
        ) : (
          filteredCategories.map(({ category, description, settings: sets }) => (
            <section key={category} className="category-section">
              <button
                className="category-header"
                onClick={() => toggleCategory(category)}
                aria-expanded={!collapsedCategories[category]}
                aria-controls={`cat-panel-${category}`}
              >
                <span>{category}</span>
                <svg
                  className={`arrow-icon ${
                    collapsedCategories[category] ? "collapsed" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <p className="category-desc">{description}</p>

              <div
                className={`category-content ${
                  collapsedCategories[category] ? "collapsed" : ""
                }`}
                id={`cat-panel-${category}`}
              >
                {sets.map(({ name, label, type, tooltip, ...rest }) => (
                  <label
                    key={name}
                    className={`setting-item setting-${type}`}
                    title={tooltip || ""}
                  >
                    <span className="setting-label">{label}</span>

                    {type === "checkbox" ? (
                      <input
                        type="checkbox"
                        name={name}
                        checked={!!settings[name]}
                        onChange={(e) => handleChange(e, type, name)}
                      />
                    ) : (
                      <input
                        type={type}
                        name={name}
                        value={settings[name]}
                        onChange={(e) => handleChange(e, type, name)}
                        {...rest}
                      />
                    )}
                  </label>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <footer className="save-footer">
        <button
          className="save-button"
          onClick={handleSave}
          disabled={saving}
          aria-busy={saving}
        >
          {saving ? "Saving..." : "💾 Save Settings"}
        </button>
        {message && <p className="save-message">{message}</p>}
      </footer>
    </div>
  );
}
