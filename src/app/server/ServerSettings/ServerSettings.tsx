"use client";
import React, { useState, useMemo, ChangeEvent } from "react";
import "./ServerSettings.css";

/* =========================
   TYPES
   ========================= */
type ValueType = "string" | "number" | "boolean";

interface Setting {
  name: string;
  label: string;
  type: "text" | "number" | "checkbox";
  tooltip?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  valueType: ValueType;
  [key: string]: any;
}

interface Category {
  category: string;
  description?: string;
  settings: Setting[];
}

interface GameSchema {
  folder: string;
  title: string;
  defaults: Record<string, any>;
  categories: Category[];
}

type SettingsSchemas = Record<string, GameSchema>;

interface ServerSettingsProps {
  game: string;
}

/* =========================
   SETTINGS SCHEMAS PER GAME
   ========================= */
const settingsSchemas: SettingsSchemas = {
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
      // ...rest of zomboid categories
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
      // ...rimworld categories
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
      // ...minecraft categories
    ],
  },
};

/* =========================
   FOLDER INFO COMPONENT
   ========================= */
function FolderInfo({ game }: { game: string }) {
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
export default function ServerSettingsFancy({ game }: ServerSettingsProps) {
  const stored =
    typeof window !== "undefined" ? localStorage.getItem("selectedGame") : null;
  const safeGame = settingsSchemas[game]
    ? game
    : stored && settingsSchemas[stored]
    ? stored
    : "zomboid";
  const schema = settingsSchemas[safeGame];

  const [settings, setSettings] = useState<Record<string, any>>(
    schema.defaults
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<
    Record<string, boolean>
  >({});

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
      .filter(Boolean) as Category[];
  }, [search, schema]);

  const toggleCategory = (catName: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [catName]: !prev[catName] }));
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: string,
    name: string
  ) => {
    let val: string | number | boolean;
    if (type === "checkbox") val = e.target.checked;
    else if (type === "number") val = Number(e.target.value);
    else val = e.target.value;
    setSettings((prev) => ({ ...prev, [name]: val }));
  };

  const handleSave = () => {
    setSaving(true);
    setMessage("");
    setTimeout(() => {
      setSaving(false);
      setMessage("✅ Settings saved successfully!");
    }, 1200);
  };

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
