"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { FaSteam, FaDiscord } from "react-icons/fa";
import "./serversettings.css";

interface Setting {
  name: string;
  label: string;
  type: "text" | "number" | "checkbox";
  valueType: "string" | "number" | "boolean";
  default?: any;
  description?: string;
}

interface Category {
  category: string;
  description: string;
  settings: Setting[];
}

// Games list
const GAMES = {
  "108600": {
    name: "Project Zomboid",
    logo: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg",
    steam: "https://store.steampowered.com/app/108600/Project_Zomboid/",
    discord: "https://discord.com/invite/theindiestone",
    wiki: "https://pzwiki.net/wiki/Main_Page",
  },
  "294100": {
    name: "RimWorld",
    logo: "https://shared.cloudflare.steampowered.com/store_item_assets/steam/apps/294100/header.jpg",
    steam: "https://store.steampowered.com/app/294100/RimWorld/",
    discord: "https://discord.com/invite/rimworld",
  },
  minecraft: {
    name: "Minecraft",
    logo: "https://upload.wikimedia.org/wikipedia/en/b/b6/Minecraft_2024_cover_art.png",
    steam: "https://store.steampowered.com/app/minecraft",
    discord: "https://discord.gg/minecraft",
  },
};

export default function ServerSettings() {
  const [activeGame, setActiveGame] = useState("108600");
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const active = localStorage.getItem("activeGameId") || "108600";
    setActiveGame(active);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/settings/${activeGame}`)
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeGame]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: string,
    key: string
  ) => {
    let val: any = e.target.value;
    if (type === "checkbox") val = e.target.checked;
    else if (type === "number") val = Number(val);
    setSettings((prev) => ({ ...prev, [key]: val }));
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
        setTimeout(() => setMessage(""), 3000);
        setLoading(false);
      })
      .catch(() => {
        setMessage("❌ Error saving settings.");
        setTimeout(() => setMessage(""), 3000);
        setLoading(false);
      });
  };

  const gameInfo = GAMES[activeGame];

  return (
    <div className="server-settings-new">
      <header className="server-header">
        <div className="header-left">
          <img src={gameInfo.logo} alt="Game Logo" className="game-logo" />
          <div>
            <h1>{gameInfo.name}</h1>
            <p>Edit and save your server configuration easily.</p>
          </div>
        </div>
        <div className="header-right">
          {gameInfo.steam && (
            <a href={gameInfo.steam} target="_blank" className="icon-btn">
              <FaSteam /> Steam
            </a>
          )}
          {gameInfo.discord && (
            <a href={gameInfo.discord} target="_blank" className="icon-btn">
              <FaDiscord /> Discord
            </a>
          )}
          {gameInfo.wiki && (
            <a
              href={gameInfo.wiki}
              target="_blank"
              className="icon-btn wiki-btn"
            >
              Wiki
            </a>
          )}
        </div>
      </header>

      {loading && <div className="status">Loading settings...</div>}
      {message && <div className="status message">{message}</div>}

      {!loading && (
        <div className="settings-layout">
          {Object.keys(settings).map((key) => {
            const val = settings[key];
            const type =
              typeof val === "boolean"
                ? "checkbox"
                : typeof val === "number"
                ? "number"
                : "text";
            return (
              <label key={key} className="setting-item">
                <span>{key}</span>
                <input
                  type={type}
                  value={type === "checkbox" ? undefined : val}
                  checked={type === "checkbox" ? val : undefined}
                  onChange={(e) => handleChange(e, type, key)}
                />
              </label>
            );
          })}
        </div>
      )}

      <button className="save-floating-btn" onClick={handleSave}>
        💾 Save
      </button>
    </div>
  );
}
