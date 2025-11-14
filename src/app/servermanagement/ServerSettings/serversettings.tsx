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

// Games list
const GAMES: Record<string, any> = {
  "108600": {
    name: "Project Zomboid",
    logo: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg",
    steam: "https://store.steampowered.com/app/108600/Project_Zomboid/",
    discord: "https://discord.com/invite/theindiestone",
  },
  "221100": {
    name: "DayZ",
    logo: "https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg",
    steam: "https://store.steampowered.com/app/221100/DayZ/",
    discord: "https://discord.com/invite/dayz",
  },
  "294100": {
    name: "RimWorld",
    logo: "https://wallpapercave.com/wp/wp3935722.png",
    steam: "https://store.steampowered.com/app/294100/RimWorld/",
    discord: "https://discord.com/invite/rimworld",
  },
  "8230": {
    name: "7 Days to Die",
    logo: "https://cdn.akamai.steamstatic.com/steam/apps/251570/header.jpg",
    steam: "https://store.steampowered.com/app/251570/7_Days_to_Die/",
    discord: "https://discord.com/invite/7daystodie",
  },
  "548430": {
    name: "Squad",
    logo: "https://cdn.cloudflare.steamstatic.com/steam/apps/393380/header.jpg",
    steam: "https://store.steampowered.com/app/393380/Squad/",
    discord: "https://discord.com/invite/join-squad",
  },
  "346110": {
    name: "The Isle",
    logo: "https://cdn.cloudflare.steamstatic.com/steam/apps/346110/header.jpg",
    steam: "https://store.steampowered.com/app/346110/The_Isle/",
    discord: "https://discord.com/invite/theisle",
  },
  "304930": {
    name: "Space Engineers",
    logo: "https://cdn.cloudflare.steamstatic.com/steam/apps/244850/header.jpg",
    steam: "https://store.steampowered.com/app/244850/Space_Engineers/",
    discord: "https://discord.com/invite/spaceengineers",
  },
  "252490": {
    name: "Rust",
    logo: "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
    steam: "https://store.steampowered.com/app/252490/Rust/",
    discord: "https://discord.com/invite/playrust",
  },
  minecraft: {
    name: "Minecraft",
    logo: "https://upload.wikimedia.org/wikipedia/en/b/b6/Minecraft_2024_cover_art.png",
    steam: "",
    discord: "https://discord.gg/minecraft",
  },
  "892970": {
    name: "Valheim",
    logo: "https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg",
    steam: "https://store.steampowered.com/app/892970/Valheim/",
    discord: "https://discord.com/invite/valheim",
  },
  "107410": {
    name: "Arma 3",
    logo: "https://cdn.cloudflare.steamstatic.com/steam/apps/107410/header.jpg",
    steam: "https://store.steampowered.com/app/107410/Arma_3/",
    discord: "https://discord.com/invite/arma",
  },
  "346110": {
    name: "ARK: Survival Evolved",
    logo: "https://cdn.cloudflare.steamstatic.com/steam/apps/346110/header.jpg",
    steam: "https://store.steampowered.com/app/346110/ARK_Survival_Evolved/",
    discord: "https://discord.com/invite/ark",
  },
  "440900": {
    name: "Conan Exiles",
    logo: "https://cdn.cloudflare.steamstatic.com/steam/apps/440900/header.jpg",
    steam: "https://store.steampowered.com/app/440900/Conan_Exiles/",
    discord: "https://discord.com/invite/conanexiles",
  },
  "530870": {
    name: "Empyrion: Galactic Survival",
    logo: "https://cdn.cloudflare.steamstatic.com/steam/apps/530870/header.jpg",
    steam:
      "https://store.steampowered.com/app/530870/Empyrion_Galactic_Survival/",
    discord: "https://discord.com/invite/empyrion",
  },
  "513710": {
    name: "SCUM",
    logo: "https://cdn.cloudflare.steamstatic.com/steam/apps/513710/header.jpg",
    steam: "https://store.steampowered.com/app/513710/SCUM/",
    discord: "https://discord.com/invite/scum",
  },
  "333930": {
    name: "Eco",
    logo: "https://cdn.cloudflare.steamstatic.com/steam/apps/333930/header.jpg",
    steam: "https://store.steampowered.com/app/333930/Eco/",
    discord: "https://discord.com/invite/eco",
  },
  "275850": {
    name: "Satisfactory",
    logo: "https://cdn.cloudflare.steamstatic.com/steam/apps/526870/header.jpg",
    steam: "https://store.steampowered.com/app/526870/Satisfactory/",
    discord: "https://discord.com/invite/satisfactory",
  },
  "275850": {
    name: "No Man's Sky",
    logo: "https://cdn.cloudflare.steamstatic.com/steam/apps/275850/header.jpg",
    steam: "https://store.steampowered.com/app/275850/No_Mans_Sky/",
    discord: "https://discord.com/invite/nomanssky",
  },
  "1909850": {
    name: "Arma Reforger",
    logo: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1874880/capsule_616x353.jpg?t=1762168272",
    steam: "https://store.steampowered.com/app/1909850/Arma_Reforger/",
    discord: "https://discord.gg/arma",
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

  const gameInfo = GAMES[activeGame] || {
    name: "Unknown Game",
    logo: "https://via.placeholder.com/150x80?text=No+Logo",
    steam: "",
    discord: "",
  };

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
