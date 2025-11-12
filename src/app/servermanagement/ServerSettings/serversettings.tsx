"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { FaSteam, FaDiscord } from "react-icons/fa";
import "./serversettings.css";

interface Setting {
  name: string;
  label: string;
  type: "text" | "number" | "checkbox";
  valueType: "string" | "number" | "boolean";
  default?: string | number | boolean;
  description?: string;
}

interface Category {
  category: string;
  description: string;
  settings: Setting[];
}

// Game schemas
const GAME_SCHEMAS: Record<string, { categories: Category[]; logo: string; steam?: string; discord?: string; wiki?: string }> = {
  "108600": {
    logo: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg",
    steam: "https://store.steampowered.com/app/108600/Project_Zomboid/",
    discord: "https://discord.com/invite/theindiestone",
    wiki: "https://pzwiki.net/wiki/Main_Page",
    categories: [
      {
        category: "Server Basics",
        description: "Core Project Zomboid server settings.",
        settings: [
          { name: "PublicName", label: "Server Name", type: "text", valueType: "string", default: "PZ Server" },
          { name: "MaxPlayers", label: "Max Players", type: "number", valueType: "number", default: 10 },
          { name: "PVP", label: "Enable PvP", type: "checkbox", valueType: "boolean", default: false },
          { name: "ServerPath", label: "Server Path", type: "text", valueType: "string", default: "C:/Steam/steamapps/common/Project Zomboid Dedicated Server/servertest.ini" },
        ],
      },
      {
        category: "Gameplay",
        description: "Adjust survival difficulty and environment.",
        settings: [
          { name: "ZombieCount", label: "Zombie Count", type: "number", valueType: "number", default: 50 },
          { name: "XPMultiplier", label: "XP Multiplier", type: "number", valueType: "number", default: 1 },
        ],
      },
    ],
  },
  "294100": {
    logo: "https://shared.cloudflare.steampowered.com/store_item_assets/steam/apps/294100/header.jpg",
    steam: "https://store.steampowered.com/app/294100/RimWorld/",
    discord: "https://discord.com/invite/rimworld",
    categories: [
      {
        category: "Server Basics",
        description: "RimWorld multiplayer server settings.",
        settings: [
          { name: "ServerName", label: "Server Name", type: "text", valueType: "string", default: "RimWorld Server" },
          { name: "MaxColonies", label: "Max Colonies", type: "number", valueType: "number", default: 5 },
          { name: "Storyteller", label: "Storyteller", type: "text", valueType: "string", default: "Cassandra" },
          { name: "ServerPath", label: "Server Path", type: "text", valueType: "string", default: "C:/Steam/steamapps/common/RimWorld" },
        ],
      },
    ],
  },
  minecraft: {
    logo: "https://upload.wikimedia.org/wikipedia/en/b/b6/Minecraft_2024_cover_art.png",
    steam: "https://store.steampowered.com/app/minecraft",
    discord: "https://discord.gg/minecraft",
    categories: [
      {
        category: "Server Basics",
        description: "Minecraft server configuration.",
        settings: [
          { name: "motd", label: "Message of the Day", type: "text", valueType: "string", default: "Welcome to Minecraft!" },
          { name: "maxPlayers", label: "Max Players", type: "number", valueType: "number", default: 20 },
          { name: "allowNether", label: "Allow Nether", type: "checkbox", valueType: "boolean", default: true },
          { name: "ServerPath", label: "Server Path", type: "text", valueType: "string", default: "C:/Steam/minecraft_server/server.properties" },
        ],
      },
    ],
  },
};

export default function ServerSettings() {
  const [activeGame, setActiveGame] = useState<string>("108600");
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");

  // Load active game from localStorage
  useEffect(() => {
    const active = localStorage.getItem("activeGameId") || "108600";
    setActiveGame(active);
  }, []);

  // Load settings for active game
  useEffect(() => {
    if (!activeGame) return;
    setLoading(true);

    const schemaData = GAME_SCHEMAS[activeGame];
    setCategories(schemaData.categories);

    // Load from backend or fallback to defaults
    fetch(`/api/settings/read/${activeGame}`)
      .then((res) => res.json())
      .then((data) => {
        const filled: Record<string, any> = {};
        schemaData.categories.forEach((cat) =>
          cat.settings.forEach((s) => {
            filled[s.name] = data[s.name] !== undefined ? data[s.name] : s.default;
          })
        );
        setSettings(filled);

        const initExpanded: Record<string, boolean> = {};
        schemaData.categories.forEach((cat) => (initExpanded[cat.category] = cat.category === "Server Basics"));
        setExpanded(initExpanded);

        setLoading(false);
      })
      .catch(() => {
        // fallback defaults
        const defaults: Record<string, any> = {};
        schemaData.categories.forEach((cat) =>
          cat.settings.forEach((s) => (defaults[s.name] = s.default))
        );
        setSettings(defaults);
        setLoading(false);
      });
  }, [activeGame]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, type: string, name: string) => {
    const val =
      type === "checkbox"
        ? e.target.checked
        : type === "number"
        ? Number(e.target.value)
        : e.target.value;
    setSettings((prev) => ({ ...prev, [name]: val }));
  };

  const toggleCategory = (catName: string) => {
    setExpanded((prev) => ({ ...prev, [catName]: !prev[catName] }));
  };

  const handleSave = () => {
    setLoading(true);
    fetch(`/api/settings/save/${activeGame}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
      .then(() => {
        setMessage("✅ Settings saved!");
        setLoading(false);
        setTimeout(() => setMessage(""), 3000);
      })
      .catch(() => {
        setMessage("❌ Error saving settings.");
        setLoading(false);
        setTimeout(() => setMessage(""), 3000);
      });
  };

  const gameInfo = GAME_SCHEMAS[activeGame];

  return (
    <div className="server-settings-new">
      <header className="server-header">
        <div className="header-left">
          <img src={gameInfo.logo} alt="Game Logo" className="game-logo" />
          <div>
            <h1>{activeGame === "108600" ? "Project Zomboid" : activeGame === "294100" ? "RimWorld" : "Minecraft"}</h1>
            <p>Edit and save your server configuration easily.</p>
          </div>
        </div>
        <div className="header-right">
          {gameInfo.steam && <a href={gameInfo.steam} target="_blank" className="icon-btn"><FaSteam /> Steam</a>}
          {gameInfo.discord && <a href={gameInfo.discord} target="_blank" className="icon-btn"><FaDiscord /> Discord</a>}
          {gameInfo.wiki && <a href={gameInfo.wiki} target="_blank" className="icon-btn wiki-btn">Wiki</a>}
        </div>
      </header>

      {loading && <div className="status">Loading settings...</div>}
      {message && <div className="status message">{message}</div>}

      {!loading && (
        <div className="settings-layout">
          <div className="right-panel">
            {categories.map((cat) => (
              <div className="card category-card" key={cat.category}>
                <div className="category-header" onClick={() => toggleCategory(cat.category)}>
                  <h2>{cat.category}</h2>
                  <span>{expanded[cat.category] ? "▾" : "▸"}</span>
                </div>
                {expanded[cat.category] && (
                  <div className="category-body">
                    {cat.description && <p className="category-desc">{cat.description}</p>}
                    {cat.settings.map((s) => (
                      <label key={s.name} className="setting-item">
                        <span>{s.label}</span>
                        {s.type === "checkbox" ? (
                          <input
                            type="checkbox"
                            checked={!!settings[s.name]}
                            onChange={(e) => handleChange(e, s.type, s.name)}
                          />
                        ) : (
                          <input
                            type={s.type}
                            value={settings[s.name] || ""}
                            onChange={(e) => handleChange(e, s.type, s.name)}
                          />
                        )}
                        {s.description && <small className="setting-desc">{s.description}</small>}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="save-floating-btn" onClick={handleSave}>💾 Save</button>
    </div>
  );
}
