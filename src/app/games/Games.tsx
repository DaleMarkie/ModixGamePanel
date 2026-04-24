"use client";

import React, { useState, useEffect } from "react";
import {
  FaSteam,
  FaDiscord,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import "./Games.css";

interface Game {
  id: string;
  name: string;
  image: string;
  supported: boolean;
  description: string;
  steamUrl?: string;
  discordUrl?: string;
  minRequirements: {
    CPU: number;
    RAM: number;
    Disk: number;
    OS: string;
  };
}

export default function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [showInstaller, setShowInstaller] = useState(false);

  const [search, setSearch] = useState("");

  const [userSpecs, setUserSpecs] = useState({
    cpuCores: 0,
    ramGB: 0,
    os: "",
  });

  /* ---------------- DETECT SYSTEM ---------------- */
  useEffect(() => {
    const cpuCores = navigator.hardwareConcurrency || 0;
    const ramGB = navigator.deviceMemory || 0;
    const os = navigator.userAgent.toLowerCase();

    setUserSpecs({ cpuCores, ramGB, os });
  }, []);

  /* ---------------- GAME LIST ---------------- */
  useEffect(() => {
    const list: Game[] = [
      {
        id: "projectzomboid",
        name: "Project Zomboid",
        image:
          "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg",
        supported: true,
        description:
          "Hardcore zombie survival with Linux dedicated server support.",
        steamUrl: "https://store.steampowered.com/app/108600/Project_Zomboid/",
        discordUrl: "https://discord.com/invite/theindiestone",
        minRequirements: {
          CPU: 2,
          RAM: 4,
          Disk: 5,
          OS: "Linux",
        },
      },
      {
        id: "rust",
        name: "Rust",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
        supported: false,
        description:
          "Survival PvP with base building (Linux support via Wine/SteamCMD).",
        steamUrl: "https://store.steampowered.com/app/252490/Rust/",
        discordUrl: "https://discord.com/invite/playrust",
        minRequirements: {
          CPU: 4,
          RAM: 8,
          Disk: 25,
          OS: "Linux",
        },
      },
      {
        id: "dayz",
        name: "DayZ",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg",
        supported: false,
        description: "Open-world survival server setup (experimental Linux).",
        steamUrl: "https://store.steampowered.com/app/221100/DayZ/",
        discordUrl: "https://discord.com/invite/dayz",
        minRequirements: {
          CPU: 4,
          RAM: 8,
          Disk: 20,
          OS: "Linux",
        },
      },
    ];

    setGames(list);
  }, []);

  const isLinux = userSpecs.os.includes("linux");

  const filteredGames = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------------- REQUIREMENT CHECK ---------------- */
  const checkRequirement = (label: string, required: number | string) => {
    switch (label) {
      case "CPU":
        return userSpecs.cpuCores >= (required as number);
      case "RAM":
        return userSpecs.ramGB >= (required as number);
      case "OS":
        return isLinux;
      default:
        return true;
    }
  };

  /* ---------------- MODALS ---------------- */
  const openModal = (game: Game) => {
    setSelectedGame(game);
    setShowModal(true);
  };

  /* ---------------- INSTALL SCRIPT ---------------- */
  const getInstallScript = (game: Game) => {
    return `#!/bin/bash
echo "🐧 Installing ${game.name} Linux Server Stack..."

sudo apt update && sudo apt upgrade -y

# Core dependencies
sudo apt install -y curl wget git unzip lib32gcc-s1 lib32stdc++6

# SteamCMD
mkdir -p ~/steamcmd
cd ~/steamcmd
wget https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz
tar -xvzf steamcmd_linux.tar.gz

# Wine (Windows compatibility layer)
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install -y wine64 wine32

# Game-specific packages
${game.id === "projectzomboid" ? "sudo apt install -y openjdk-17-jre" : ""}

echo "✅ ${game.name} setup complete"
`;
  };

  const copyScript = (game: Game) => {
    navigator.clipboard.writeText(getInstallScript(game));
    alert("🐧 Install script copied");
  };

  return (
    <div className="games-page">
      <div className="games-header">
        <h1>🐧 Linux Game Server Hub</h1>

        {!isLinux && (
          <p style={{ color: "red" }}>
            ❌ Linux not detected — installation recommended only on Linux
          </p>
        )}

        <input
          className="search-input"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ---------------- GRID ---------------- */}
      <div className="games-grid">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className={`game-card ${!game.supported ? "disabled" : ""}`}
          >
            <div className="game-thumb">
              <img src={game.image} />

              <div className="overlay">
                <span className="planned-badge">
                  {game.supported ? "Linux Ready" : "🚧 Experimental"}
                </span>
              </div>
            </div>

            <div className="game-details">
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

                {/* INSTALL ONLY */}
                <button className="install-btn" onClick={() => openModal(game)}>
                  🐧 Install Setup
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- REQUIREMENTS MODAL ---------------- */}
      {showModal && selectedGame && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedGame.name}</h3>

            <p>System Requirements Check</p>

            <ul>
              {Object.entries(selectedGame.minRequirements).map(
                ([key, value]) => {
                  const ok = checkRequirement(key, value);

                  return (
                    <li key={key}>
                      {key}: {value}
                      {ok ? (
                        <FaCheckCircle color="limegreen" />
                      ) : (
                        <FaTimesCircle color="red" />
                      )}
                    </li>
                  );
                }
              )}
            </ul>

            <button onClick={() => setShowInstaller(true)}>
              🐧 Open Linux Installer
            </button>

            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* ---------------- INSTALLER MODAL ---------------- */}
      {showInstaller && selectedGame && (
        <div className="modal-backdrop" onClick={() => setShowInstaller(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>🐧 Linux Installer Script</h3>

            <p>Copy and run in terminal:</p>

            <textarea
              readOnly
              value={getInstallScript(selectedGame)}
              style={{
                width: "100%",
                height: "220px",
                background: "#111",
                color: "#0f0",
                fontSize: "0.75rem",
                borderRadius: "8px",
                padding: "0.5rem",
              }}
            />

            <button onClick={() => copyScript(selectedGame)}>
              📋 Copy Script
            </button>

            <button onClick={() => setShowInstaller(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
