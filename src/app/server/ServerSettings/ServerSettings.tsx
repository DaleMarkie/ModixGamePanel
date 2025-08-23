"use client";
import React, { useState, useMemo } from "react";
import "./ServerSettings.css";

/* =========================
   SETTINGS SCHEMAS PER GAME
   ========================= */
const settingsSchemas = {
  zomboid: {
    folder: "/home/modix/Zomboid",
    title: "⚙️ Project Zomboid Server Settings",
    defaults: {
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
    },
    categories: [
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
    ],
  },

  rimworld: {
    folder: "/home/modix/RimWorld",
    title: "⚙️ RimWorld Server Settings",
    defaults: {
      ColonyName: "My RimWorld Colony",
      MaxPlayers: 6,
      Storyteller: "Cassandra",
      Difficulty: "Strive to Survive",
      DevMode: false,
      TickRate: 60,
      AutosaveInterval: 5,
      AllowMods: true,
      MaxRaidPoints: 1000,
      EventFrequency: "Normal",
    },
    categories: [
      {
        category: "🏰 Colony Setup",
        description: "Basic RimWorld multiplayer settings.",
        settings: [
          {
            name: "ColonyName",
            label: "Colony Name",
            type: "text",
            placeholder: "My RimWorld Colony",
            tooltip: "The name of your colony.",
            valueType: "string",
          },
          {
            name: "MaxPlayers",
            label: "Max Players",
            type: "number",
            min: 1,
            max: 12,
            tooltip: "Maximum connected players.",
            valueType: "number",
          },
          {
            name: "Storyteller",
            label: "Storyteller AI",
            type: "text",
            placeholder: "Cassandra / Randy / Phoebe",
            tooltip: "AI storyteller choice.",
            valueType: "string",
          },
          {
            name: "Difficulty",
            label: "Difficulty",
            type: "text",
            placeholder: "Peaceful / Strive to Survive / Losing is Fun",
            tooltip: "Game difficulty level.",
            valueType: "string",
          },
        ],
      },
      {
        category: "🎮 Gameplay",
        description: "Gameplay balancing and player experience.",
        settings: [
          {
            name: "DevMode",
            label: "Enable Dev Mode",
            type: "checkbox",
            tooltip: "Allows developer tools and cheats.",
            valueType: "boolean",
          },
          {
            name: "MaxRaidPoints",
            label: "Max Raid Points",
            type: "number",
            min: 100,
            max: 10000,
            step: 50,
            tooltip: "Cap for raid difficulty scaling.",
            valueType: "number",
          },
          {
            name: "EventFrequency",
            label: "Event Frequency",
            type: "text",
            placeholder: "Rare / Normal / Frequent",
            tooltip: "Controls how often random events occur.",
            valueType: "string",
          },
        ],
      },
      {
        category: "🛠️ Mods & Content",
        description: "Manage mods and custom content.",
        settings: [
          {
            name: "AllowMods",
            label: "Allow Mods",
            type: "checkbox",
            tooltip: "Enable or disable mod usage.",
            valueType: "boolean",
          },
          {
            name: "ModList",
            label: "Mods (comma-separated IDs)",
            type: "text",
            placeholder: "mod1,mod2,mod3",
            tooltip: "List of enabled mods.",
            valueType: "string",
          },
        ],
      },
      {
        category: "⚡ Performance & Autosave",
        description: "Performance tuning and autosave frequency.",
        settings: [
          {
            name: "TickRate",
            label: "Tick Rate",
            type: "number",
            min: 10,
            max: 240,
            step: 10,
            tooltip: "Game simulation ticks per second.",
            valueType: "number",
          },
          {
            name: "AutosaveInterval",
            label: "Autosave Interval (minutes)",
            type: "number",
            min: 1,
            max: 60,
            tooltip: "Time between autosaves.",
            valueType: "number",
          },
        ],
      },
    ],
  },

  minecraft: {
    folder: "/home/modix/Minecraft",
    title: "⚙️ Minecraft Server Settings",
    defaults: {
      MOTD: "My Minecraft Server",
      MaxPlayers: 20,
      PVP: true,
      Difficulty: "normal",
    },
    categories: [
      {
        category: "⛏️ Server Properties",
        description: "Minecraft server.properties values.",
        settings: [
          {
            name: "MOTD",
            label: "MOTD",
            type: "text",
            placeholder: "A Minecraft Server",
            tooltip: "Message of the Day",
            valueType: "string",
          },
          {
            name: "MaxPlayers",
            label: "Max Players",
            type: "number",
            min: 1,
            max: 100,
            tooltip: "Maximum number of players.",
            valueType: "number",
          },
          {
            name: "PVP",
            label: "Enable PvP",
            type: "checkbox",
            tooltip: "Allow players to attack each other.",
            valueType: "boolean",
          },
          {
            name: "Difficulty",
            label: "Difficulty",
            type: "text",
            placeholder: "peaceful / easy / normal / hard",
            tooltip: "World difficulty level.",
            valueType: "string",
          },
        ],
      },
    ],
  },
};

/* =========================
   FOLDER INFO COMPONENT
   ========================= */
function FolderInfo({ game }) {
  const folder = settingsSchemas[game]?.folder;
  const [copied, setCopied] = useState(false);
  if (!folder) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(folder);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="zomboid-folder-info"
      role="region"
      aria-label="Game folder path"
    >
      <span role="img" aria-label="folder" className="folder-emoji">
        📁
      </span>
      <p className="folder-text" title={folder}>
        {settingsSchemas[game].title.split(" ")[1]} Server Folder:{" "}
        <code>{folder}</code>
      </p>
      <button className="copy-button" onClick={handleCopy} aria-live="polite">
        {copied ? "Copied ✅" : "Copy Path"}
      </button>
    </div>
  );
}

/* =========================
   MAIN COMPONENT
   ========================= */
export default function ServerSettingsFancy({ game }) {
  const stored =
    typeof window !== "undefined" ? localStorage.getItem("selectedGame") : null;
  const safeGame = settingsSchemas[game]
    ? game
    : settingsSchemas[stored]
    ? stored
    : "zomboid";
  const schema = settingsSchemas[safeGame];

  const [settings, setSettings] = useState(schema.defaults);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return schema.categories;
    const lower = search.toLowerCase();
    return schema.categories
      .map((cat) => {
        const filtered = cat.settings.filter(
          (s) =>
            s.label.toLowerCase().includes(lower) ||
            (s.tooltip && s.tooltip.toLowerCase().includes(lower))
        );
        return filtered.length > 0 ? { ...cat, settings: filtered } : null;
      })
      .filter(Boolean);
  }, [search, schema]);

  function toggleCategory(catName) {
    setCollapsedCategories((prev) => ({ ...prev, [catName]: !prev[catName] }));
  }

  function handleChange(e, type, name) {
    let val;
    if (type === "checkbox") val = e.target.checked;
    else if (type === "number") val = Number(e.target.value);
    else val = e.target.value;
    setSettings((prev) => ({ ...prev, [name]: val }));
  }

  function handleSave() {
    setSaving(true);
    setMessage("");
    setTimeout(() => {
      setSaving(false);
      setMessage("✅ Settings saved successfully!");
    }, 1200);
  }

  return (
    <div className="fancy-wrapper">
      <header className="fancy-header">
        <h1>{schema.title}</h1>
        <FolderInfo game={safeGame} />
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
          filteredCategories.map(
            ({ category, description, settings: sets }) => (
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
            )
          )
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
