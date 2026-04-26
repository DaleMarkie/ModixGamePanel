"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaSteam, FaDiscord } from "react-icons/fa";
import "./Games.css";

interface GameVersion {
  name: string;
  idSuffix: string;
  notes?: string;
}

interface Game {
  id: string;
  name: string;
  image: string;
  supported: boolean;
  description: string;
  steamUrl?: string;
  discordUrl?: string;
  cpu: number;
  ram: number;
  disk: number;
  tags: string[];
  versions?: GameVersion[];
}

/* ---------------- GAME LIBRARY ---------------- */
const GAMES: Game[] = [
  {
    id: "projectzomboid",
    name: "Project Zomboid",
    image:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg",
    supported: true,
    description: "Hardcore zombie survival dedicated server",
    steamUrl: "https://store.steampowered.com/app/108600/Project_Zomboid/",
    discordUrl: "https://discord.com/invite/theindiestone",
    cpu: 2,
    ram: 4,
    disk: 6,
    tags: ["survival", "zombies"],
  },
  {
    id: "rust",
    name: "Rust",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
    supported: true,
    description: "PvP survival sandbox",
    steamUrl: "https://store.steampowered.com/app/252490/Rust/",
    discordUrl: "https://discord.com/invite/playrust",
    cpu: 6,
    ram: 10,
    disk: 30,
    tags: ["pvp", "survival"],
  },
  {
    id: "dayz",
    name: "DayZ",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg",
    supported: true,
    description: "Open world survival server",
    steamUrl: "https://store.steampowered.com/app/221100/DayZ/",
    discordUrl: "https://discord.com/invite/dayz",
    cpu: 6,
    ram: 12,
    disk: 25,
    tags: ["survival", "openworld"],
  },

  /* ---------------- MINECRAFT ---------------- */
  {
    id: "minecraft",
    name: "Minecraft Bundle",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/322330/header.jpg",
    supported: true,
    description: "Multi-version Minecraft server bundle system",
    cpu: 2,
    ram: 4,
    disk: 5,
    tags: ["sandbox", "building", "modded"],
    versions: [
      { name: "Vanilla Java", idSuffix: "vanilla" },
      { name: "Paper / Spigot", idSuffix: "paper" },
      { name: "Forge Modded", idSuffix: "forge" },
      { name: "Fabric Modded", idSuffix: "fabric" },
      { name: "Bedrock Dedicated", idSuffix: "bedrock" },
    ],
  },

  /* ---------------- OTHER CORE ---------------- */
  {
    id: "theisle",
    name: "The Isle",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/376210/header.jpg",
    supported: true,
    description: "Dinosaur survival sandbox server",
    cpu: 4,
    ram: 8,
    disk: 20,
    tags: ["dino", "survival", "sandbox"],
  },
  {
    id: "valheim",
    name: "Valheim",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg",
    supported: true,
    description: "Viking survival server",
    cpu: 4,
    ram: 8,
    disk: 10,
    tags: ["viking", "coop"],
  },
  {
    id: "7d2d",
    name: "7 Days to Die",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/251570/header.jpg",
    supported: true,
    description: "Zombie voxel survival server",
    cpu: 4,
    ram: 10,
    disk: 15,
    tags: ["zombies", "sandbox"],
  },
  {
    id: "gmod",
    name: "Garry’s Mod",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/4000/header.jpg",
    supported: true,
    description: "Sandbox physics server",
    cpu: 2,
    ram: 4,
    disk: 8,
    tags: ["sandbox"],
  },
  {
    id: "cs2",
    name: "Counter-Strike 2",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
    supported: true,
    description: "Competitive FPS server",
    cpu: 4,
    ram: 6,
    disk: 20,
    tags: ["fps"],
  },
  {
    id: "terraria",
    name: "Terraria",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/105600/header.jpg",
    supported: true,
    description: "2D adventure server",
    cpu: 1,
    ram: 2,
    disk: 1,
    tags: ["2d"],
  },
  {
    id: "palworld",
    name: "Palworld",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1623730/header.jpg",
    supported: true,
    description: "Creature survival multiplayer",
    cpu: 6,
    ram: 12,
    disk: 20,
    tags: ["survival", "creatures"],
  },
  {
    id: "rimworld",
    name: "RimWorld",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/294100/header.jpg",
    supported: true,
    description: "Colony simulation & storytelling server environment",
    cpu: 2,
    ram: 4,
    disk: 5,
    tags: ["simulation", "colony", "management"],
  },

  /* ---------------- NEW HEAVY HITTERS ---------------- */
  {
    id: "arkse",
    name: "ARK: Survival Evolved",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/346110/header.jpg",
    supported: true,
    description: "Dinosaur survival MMO server",
    cpu: 6,
    ram: 12,
    disk: 40,
    tags: ["dinosaurs", "survival", "mmo"],
  },
  {
    id: "sonsoftheforest",
    name: "Sons of the Forest",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1326470/header.jpg",
    supported: true,
    description: "Horror survival multiplayer server",
    cpu: 6,
    ram: 12,
    disk: 25,
    tags: ["horror", "survival"],
  },
  {
    id: "enshrouded",
    name: "Enshrouded",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1203620/header.jpg",
    supported: true,
    description: "Co-op survival RPG server",
    cpu: 6,
    ram: 12,
    disk: 20,
    tags: ["rpg", "survival", "coop"],
  },
  {
    id: "spaceengineers",
    name: "Space Engineers",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/244850/header.jpg",
    supported: true,
    description: "Space sandbox engineering server",
    cpu: 4,
    ram: 10,
    disk: 20,
    tags: ["space", "sandbox", "engineering"],
  },
  {
    id: "factorio",
    name: "Factorio",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/427520/header.jpg",
    supported: true,
    description: "Factory automation server",
    cpu: 2,
    ram: 4,
    disk: 2,
    tags: ["automation", "factory"],
  },
  {
    id: "scum",
    name: "SCUM",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/513710/header.jpg",
    supported: true,
    description: "Hardcore survival simulator server",
    cpu: 6,
    ram: 12,
    disk: 30,
    tags: ["survival", "hardcore"],
  },
  {
    id: "starbound",
    name: "Starbound",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/211820/header.jpg",
    supported: true,
    description: "2D space exploration server",
    cpu: 2,
    ram: 4,
    disk: 5,
    tags: ["space", "2d"],
  },
  {
    id: "l4d2",
    name: "Left 4 Dead 2",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/550/header.jpg",
    supported: true,
    description: "Co-op zombie shooter server",
    cpu: 2,
    ram: 4,
    disk: 15,
    tags: ["zombies", "coop"],
  },
  {
    id: "insurgency",
    name: "Insurgency: Sandstorm",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/581320/header.jpg",
    supported: true,
    description: "Tactical FPS server",
    cpu: 4,
    ram: 8,
    disk: 25,
    tags: ["fps", "tactical"],
  },
];

/* ---------------- COMPONENT ---------------- */
export default function Games() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedVersion, setSelectedVersion] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showInstaller, setShowInstaller] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 150);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    return GAMES.filter((g) =>
      (g.name + g.tags.join(" "))
        .toLowerCase()
        .includes(debounced.toLowerCase())
    );
  }, [debounced]);

  const openGame = useCallback((game: Game) => {
    setSelectedGame(game);
    setSelectedVersion("");
    setShowModal(true);
  }, []);

  const installScript = useMemo(() => {
    if (!selectedGame) return "";

    const versionSuffix = selectedVersion ? `-${selectedVersion}` : "";

    return `#!/bin/bash
set -e

GAME="${selectedGame.name}${versionSuffix}"
DIR="$HOME/game-servers/${selectedGame.id}${versionSuffix}"

echo "Installing $GAME..."
mkdir -p "$DIR"

echo "Installing dependencies..."
sudo apt update && sudo apt install -y curl wget tmux screen

echo "Done: $DIR"
`;
  }, [selectedGame, selectedVersion]);

  const copy = () => navigator.clipboard.writeText(installScript);

  return (
    <div className="games-page">
      <div className="games-header">
        <h1>🐧 Linux Game Server Hub</h1>

        <input
          className="search-input"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="games-grid">
        {filtered.map((game) => (
          <div key={game.id} className="game-card">
            <img src={game.image} />

            <div className="game-info">
              <h3>{game.name}</h3>
              <p>{game.description}</p>

              <div className="tags">
                {game.tags.map((t) => (
                  <span key={t}>#{t}</span>
                ))}
              </div>

              <button onClick={() => openGame(game)}>Install Server</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedGame && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedGame.name}</h2>

            {selectedGame.versions && (
              <div>
                <p>Select Version:</p>
                <select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                >
                  <option value="">Default</option>
                  {selectedGame.versions.map((v) => (
                    <option key={v.idSuffix} value={v.idSuffix}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button onClick={() => setShowInstaller(true)}>
              Open Installer
            </button>

            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}

      {showInstaller && (
        <div className="modal-backdrop" onClick={() => setShowInstaller(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Installer Script</h2>

            <textarea className="script-box" readOnly value={installScript} />

            <button onClick={copy}>Copy Script</button>
            <button onClick={() => setShowInstaller(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
