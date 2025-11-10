"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import "./ServerSettings.css";

interface Setting {
  name: string;
  label: string;
  type: "text" | "number" | "checkbox";
  valueType: "string" | "number" | "boolean";
}

interface Category {
  category: string;
  description: string;
  settings: Setting[];
}

// Default Steam Dedicated Server paths
const defaultPaths: Record<string, string> = {
  "108600": "C:/Steam/steamapps/common/Project Zomboid Dedicated Server",
  "294100": "C:/Steam/steamapps/common/RimWorld",
  minecraft: "C:/Steam/minecraft_server",
};

export default function ServerSettings() {
  const [game, setGame] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<
    Record<string, string | number | boolean>
  >({});
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const schemas: Record<string, Category[]> = {
    "108600": [
      {
        category: "Server Basics",
        description: "Core Project Zomboid server settings.",
        settings: [
          {
            name: "PublicName",
            label: "Server Name",
            type: "text",
            valueType: "string",
          },
          {
            name: "MaxPlayers",
            label: "Max Players",
            type: "number",
            valueType: "number",
          },
          {
            name: "PVP",
            label: "Enable PvP",
            type: "checkbox",
            valueType: "boolean",
          },
        ],
      },
      {
        category: "Gameplay",
        description: "Adjust survival difficulty and environment.",
        settings: [
          {
            name: "ZombieCount",
            label: "Zombie Count",
            type: "number",
            valueType: "number",
          },
          {
            name: "XPMultiplier",
            label: "XP Multiplier",
            type: "number",
            valueType: "number",
          },
        ],
      },
    ],
    "294100": [
      {
        category: "Server Basics",
        description: "RimWorld multiplayer server settings.",
        settings: [
          {
            name: "ServerName",
            label: "Server Name",
            type: "text",
            valueType: "string",
          },
          {
            name: "MaxColonies",
            label: "Max Colonies",
            type: "number",
            valueType: "number",
          },
          {
            name: "Storyteller",
            label: "Storyteller",
            type: "text",
            valueType: "string",
          },
        ],
      },
    ],
    minecraft: [
      {
        category: "Server Basics",
        description: "Minecraft server configuration.",
        settings: [
          {
            name: "motd",
            label: "Message of the Day",
            type: "text",
            valueType: "string",
          },
          {
            name: "maxPlayers",
            label: "Max Players",
            type: "number",
            valueType: "number",
          },
          {
            name: "allowNether",
            label: "Allow Nether",
            type: "checkbox",
            valueType: "boolean",
          },
        ],
      },
    ],
  };

  // Load active game from localStorage
  useEffect(() => {
    const active = localStorage.getItem("activeGameId") || "";
    setGame(active);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "activeGameId")
        setGame(localStorage.getItem("activeGameId") || "");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Load settings for active game
  useEffect(() => {
    if (!game) return;
    setLoading(true);
    const schema = schemas[game];
    if (!schema) {
      setCategories([]);
      setSettings({});
      setLoading(false);
      return;
    }
    setCategories(schema);

    // Load saved settings or defaults
    const saved = localStorage.getItem(`settings_${game}`);
    if (saved) setSettings(JSON.parse(saved));
    else {
      const init: Record<string, any> = {};
      schema.forEach((cat) =>
        cat.settings.forEach((s) => {
          if (s.type === "text") init[s.name] = "";
          else if (s.type === "number") init[s.name] = 1;
          else if (s.type === "checkbox") init[s.name] = false;
        })
      );
      init["serverPath"] = defaultPaths[game] || "";
      setSettings(init);
    }
    setLoading(false);
  }, [game]);

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
    if (!game) return;
    localStorage.setItem(`settings_${game}`, JSON.stringify(settings));
    setMessage("✅ Settings saved!");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="server-settings-wrapper">
      <header>
        <h1>
          ⚙️{" "}
          {game === "108600"
            ? "Project Zomboid"
            : game === "294100"
            ? "RimWorld"
            : game || "No Game Selected"}{" "}
          Server Settings
        </h1>
        <p>Editing settings for the currently selected game.</p>
      </header>

      {loading && <p className="status">Loading settings...</p>}
      {message && <p className="status message">{message}</p>}
      {!loading && !game && (
        <p className="status">No game selected. Please select a game first.</p>
      )}

      {!loading && game && (
        <main>
          <section className="server-path-card">
            <h2>Server Path</h2>
            <input
              type="text"
              value={settings["serverPath"] || ""}
              onChange={(e) => handleChange(e, "text", "serverPath")}
              placeholder="Server installation path"
            />
          </section>

          {categories.map((cat) => (
            <section className="category-card" key={cat.category}>
              <h2>{cat.category}</h2>
              {cat.description && (
                <p className="category-desc">{cat.description}</p>
              )}
              {cat.settings.map((s) => (
                <label key={s.name} className="setting-item">
                  {s.label}:
                  {s.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={!!settings[s.name]}
                      onChange={(e) => handleChange(e, s.type, s.name)}
                    />
                  ) : (
                    <input
                      type={s.type}
                      value={settings[s.name] as string | number}
                      onChange={(e) => handleChange(e, s.type, s.name)}
                    />
                  )}
                </label>
              ))}
            </section>
          ))}
        </main>
      )}

      <footer>
        <button onClick={handleSave} disabled={!game}>
          💾 Save Settings
        </button>
      </footer>
    </div>
  );
}
