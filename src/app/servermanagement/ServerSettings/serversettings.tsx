"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { FaSteam, FaDiscord, FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./serversettings.css";

interface Game {
  id: string;
  name: string;
  logo: string;
  steam?: string;
  discord?: string;
}

interface SectionSettings {
  [key: string]: string | number | boolean;
}

interface SettingsData {
  [section: string]: SectionSettings;
}

const GAMES: Game[] = [
  {
    id: "108600",
    name: "Project Zomboid",
    logo: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg",
    steam: "https://store.steampowered.com/app/108600/Project_Zomboid/",
    discord: "https://discord.com/invite/theindiestone",
  },
  {
    id: "346110",
    name: "ARK: Survival Evolved",
    logo: "https://cdn.cloudflare.steamstatic.com/steam/apps/346110/header.jpg",
    steam: "https://store.steampowered.com/app/346110/ARK_Survival_Evolved/",
    discord: "https://discord.com/invite/ark",
  },
  {
    id: "440900",
    name: "Conan Exiles",
    logo: "https://cdn.cloudflare.steamstatic.com/steam/apps/440900/header.jpg",
    steam: "https://store.steampowered.com/app/440900/Conan_Exiles/",
    discord: "https://discord.com/invite/conanexiles",
  },
  {
    id: "221100",
    name: "DayZ",
    logo: "https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg",
    steam: "https://store.steampowered.com/app/221100/DayZ/",
    discord: "https://discord.com/invite/dayz",
  },
  {
    id: "minecraft",
    name: "Minecraft",
    logo: "https://upload.wikimedia.org/wikipedia/en/b/b6/Minecraft_2024_cover_art.png",
    discord: "https://discord.gg/minecraft",
  },
];

export default function ServerSettings() {
  const [activeGame, setActiveGame] = useState<string>("108600");
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Load active game from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("activeGameId") || "108600";
    setActiveGame(stored);
  }, []);

  // Load settings for active game
  useEffect(() => {
    setLoading(true);
    fetch(`/api/settings/${activeGame}`)
      .then((res) => res.json())
      .then((data: SettingsData) => {
        setSettings(data);
        const sections = Object.keys(data).reduce(
          (acc, s) => ({ ...acc, [s]: true }),
          {}
        );
        setOpenSections(sections);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeGame]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    section: string,
    key: string
  ) => {
    let val: any = e.target.value;
    if (e.target.type === "checkbox") val = e.target.checked;
    else if (e.target.type === "number") val = Number(val);

    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: val },
    }));
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

  const gameInfo = GAMES.find((g) => g.id === activeGame) || {
    name: "Unknown Game",
    logo: "https://via.placeholder.com/150x80?text=No+Logo",
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="server-settings-container">
      <header className="server-header">
        <img src={gameInfo.logo} alt="Game Logo" className="game-logo" />
        <div className="header-info">
          <h1>{gameInfo.name}</h1>
          <p>Edit and save your server configuration easily.</p>
          <div className="header-links">
            {gameInfo.steam && (
              <a href={gameInfo.steam} target="_blank">
                <FaSteam /> Steam
              </a>
            )}
            {gameInfo.discord && (
              <a href={gameInfo.discord} target="_blank">
                <FaDiscord /> Discord
              </a>
            )}
          </div>
        </div>
      </header>

      {loading && <div className="status loading">Loading settings...</div>}
      {message && <div className="status message">{message}</div>}

      {!loading &&
        Object.entries(settings).map(([section, values]) => (
          <div key={section} className="settings-section">
            <div
              className="section-header"
              onClick={() => toggleSection(section)}
            >
              <h2>{section}</h2>
              {openSections[section] ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {openSections[section] && (
              <div className="section-body">
                {Object.entries(values).map(([key, val]) => {
                  const type =
                    typeof val === "boolean"
                      ? "checkbox"
                      : typeof val === "number"
                      ? "number"
                      : "text";
                  return (
                    <div key={key} className="setting-item">
                      <label>{key}</label>
                      {type === "checkbox" ? (
                        <input
                          type="checkbox"
                          checked={val as boolean}
                          onChange={(e) => handleChange(e, section, key)}
                        />
                      ) : (
                        <input
                          type={type}
                          value={val as string | number}
                          onChange={(e) => handleChange(e, section, key)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

      <button className="save-btn" onClick={handleSave}>
        💾 Save Settings
      </button>
    </div>
  );
}
