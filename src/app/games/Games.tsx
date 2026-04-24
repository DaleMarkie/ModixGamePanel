"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaSteam, FaDiscord } from "react-icons/fa";
import "./Games.css";

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
}

const GAMES: Game[] = [
  {
    id: "projectzomboid",
    name: "Project Zomboid",
    image:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg",
    supported: true,
    description: "Hardcore zombie survival dedicated Linux server",
    steamUrl: "https://store.steampowered.com/app/108600/Project_Zomboid/",
    discordUrl: "https://discord.com/invite/theindiestone",
    cpu: 2,
    ram: 4,
    disk: 5,
  },
  {
    id: "rust",
    name: "Rust",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
    supported: false,
    description: "PvP survival sandbox (SteamCMD / Wine required)",
    steamUrl: "https://store.steampowered.com/app/252490/Rust/",
    discordUrl: "https://discord.com/invite/playrust",
    cpu: 4,
    ram: 8,
    disk: 25,
  },
  {
    id: "dayz",
    name: "DayZ",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg",
    supported: false,
    description: "Open world survival server hosting",
    steamUrl: "https://store.steampowered.com/app/221100/DayZ/",
    discordUrl: "https://discord.com/invite/dayz",
    cpu: 4,
    ram: 8,
    disk: 20,
  },
  {
    id: "rimworld",
    name: "RimWorld",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/294100/header.jpg",
    supported: true,
    description: "Colony simulation strategy game (Linux native)",
    steamUrl: "https://store.steampowered.com/app/294100/RimWorld/",
    cpu: 2,
    ram: 2,
    disk: 1,
  },
];

export default function Games() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showInstaller, setShowInstaller] = useState(false);

  const [userSpecs, setUserSpecs] = useState({
    cpu: 0,
    ram: 0,
    os: "",
  });

  /* ---------------- SYSTEM DETECT ---------------- */
  useEffect(() => {
    setUserSpecs({
      cpu: navigator.hardwareConcurrency || 0,
      ram: navigator.deviceMemory || 0,
      os: navigator.userAgent.toLowerCase(),
    });
  }, []);

  const isLinux = userSpecs.os.includes("linux");

  /* ---------------- DEBOUNCE SEARCH ---------------- */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 150);
    return () => clearTimeout(t);
  }, [search]);

  /* ---------------- FILTERED GAMES ---------------- */
  const filteredGames = useMemo(() => {
    return GAMES.filter((g) =>
      g.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [debouncedSearch]);

  /* ---------------- REQUIREMENT CHECK ---------------- */
  const meetsReq = useCallback(
    (game: Game) => {
      return userSpecs.cpu >= game.cpu && userSpecs.ram >= game.ram && isLinux;
    },
    [userSpecs, isLinux]
  );

  /* ---------------- MODAL OPEN ---------------- */
  const openGame = useCallback((game: Game) => {
    setSelectedGame(game);
    setShowModal(true);
  }, []);

  /* ---------------- INSTALL SCRIPT (CLEAN USER FRIENDLY) ---------------- */
  const installScript = useMemo(() => {
    if (!selectedGame) return "";

    return `#!/bin/bash
echo "======================================"
echo "🐧 Installing ${selectedGame.name} Server"
echo "======================================"

# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install core tools
sudo apt install -y curl wget git unzip

# 3. SteamCMD setup
mkdir -p ~/steamcmd
cd ~/steamcmd
wget https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz
tar -xvzf steamcmd_linux.tar.gz

# 4. Dependencies
sudo apt install -y lib32gcc-s1 lib32stdc++6

${
  selectedGame.id === "projectzomboid"
    ? "sudo apt install -y openjdk-17-jre"
    : ""
}

echo ""
echo "======================================"
echo "✅ INSTALL COMPLETE"
echo "Run your server using your panel or scripts"
echo "======================================"
`;
  }, [selectedGame]);

  const copyScript = () => {
    navigator.clipboard.writeText(installScript);
  };

  return (
    <div className="games-page">
      <div className="games-header">
        <h1>🐧 Linux Game Server Hub</h1>

        {!isLinux && (
          <p className="warn">
            ❌ Linux not detected (installing not recommended)
          </p>
        )}

        <input
          className="search-input"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* GRID */}
      <div className="games-grid">
        {filteredGames.map((game) => (
          <div key={game.id} className="game-card">
            <img
              src={game.image}
              loading="lazy"
              className="game-img"
              alt={game.name}
            />

            <div className="game-info">
              <h3>{game.name}</h3>
              <p>{game.description}</p>

              <div className="game-buttons">
                {game.steamUrl && (
                  <a href={game.steamUrl} target="_blank">
                    <FaSteam /> Steam
                  </a>
                )}
                {game.discordUrl && (
                  <a href={game.discordUrl} target="_blank">
                    <FaDiscord /> Discord
                  </a>
                )}
              </div>

              <button className="install-btn" onClick={() => openGame(game)}>
                🐧 Install Setup
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* REQUIREMENTS MODAL */}
      {showModal && selectedGame && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedGame.name}</h2>

            <p>System Check</p>

            <ul>
              <li>CPU: {selectedGame.cpu} cores</li>
              <li>RAM: {selectedGame.ram} GB</li>
              <li>Disk: {selectedGame.disk} GB</li>
              <li>Linux: {isLinux ? "✔" : "❌"}</li>
            </ul>

            <p>
              Status:{" "}
              {meetsReq(selectedGame)
                ? "✔ Ready to install"
                : "❌ Not recommended"}
            </p>

            <button onClick={() => setShowInstaller(true)}>
              🐧 Open Installer
            </button>

            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* INSTALLER MODAL */}
      {showInstaller && selectedGame && (
        <div className="modal-backdrop" onClick={() => setShowInstaller(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>🐧 Linux Installer</h2>

            <p>Copy and paste into terminal:</p>

            <textarea readOnly value={installScript} className="script-box" />

            <button onClick={copyScript}>📋 Copy Script</button>
            <button onClick={() => setShowInstaller(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
