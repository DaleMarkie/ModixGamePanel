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
    setUserSpecs({
      cpuCores: navigator.hardwareConcurrency || 0,
      ramGB: navigator.deviceMemory || 0,
      os: navigator.userAgent.toLowerCase(),
    });
  }, []);

  /* ---------------- GAMES LIST (EXPANDED) ---------------- */
  useEffect(() => {
    setGames([
      {
        id: "projectzomboid",
        name: "Project Zomboid",
        image:
          "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg",
        supported: true,
        description: "Top-tier zombie survival server hosting (Linux native).",
        steamUrl: "https://store.steampowered.com/app/108600/Project_Zomboid/",
        discordUrl: "https://discord.com/invite/theindiestone",
        minRequirements: { CPU: 2, RAM: 4, Disk: 5, OS: "Linux" },
      },

      {
        id: "rust",
        name: "Rust",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
        supported: false,
        description:
          "One of the most popular survival PvP servers (SteamCMD required).",
        steamUrl: "https://store.steampowered.com/app/252490/Rust/",
        discordUrl: "https://discord.com/invite/playrust",
        minRequirements: { CPU: 4, RAM: 8, Disk: 30, OS: "Linux" },
      },

      {
        id: "dayz",
        name: "DayZ",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg",
        supported: false,
        description: "Hardcore survival server (experimental Linux setup).",
        steamUrl: "https://store.steampowered.com/app/221100/DayZ/",
        discordUrl: "https://discord.com/invite/dayz",
        minRequirements: { CPU: 4, RAM: 8, Disk: 25, OS: "Linux" },
      },

      {
        id: "rimworld",
        name: "RimWorld",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/294100/header.jpg",
        supported: true,
        description: "Lightweight colony sim (easy Linux hosting).",
        steamUrl: "https://store.steampowered.com/app/294100/RimWorld/",
        minRequirements: { CPU: 2, RAM: 2, Disk: 2, OS: "Linux" },
      },

      /* ---------------- NEW POPULAR LINUX GAMES ---------------- */

      {
        id: "minecraft",
        name: "Minecraft (Java Server)",
        image: "https://cdn.cloudflare.steamstatic.com/steam/apps/0/header.jpg",
        supported: true,
        description:
          "Most popular sandbox server in the world (Java-based Linux native).",
        minRequirements: { CPU: 2, RAM: 4, Disk: 5, OS: "Linux" },
      },

      {
        id: "cs2",
        name: "Counter-Strike 2 Server",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
        supported: true,
        description: "Competitive FPS dedicated servers (SteamCMD supported).",
        steamUrl: "https://store.steampowered.com/app/730/CounterStrike_2/",
        minRequirements: { CPU: 4, RAM: 8, Disk: 15, OS: "Linux" },
      },

      {
        id: "valheim",
        name: "Valheim",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg",
        supported: true,
        description:
          "Viking survival co-op server (Linux dedicated server support).",
        steamUrl: "https://store.steampowered.com/app/892970/Valheim/",
        minRequirements: { CPU: 4, RAM: 8, Disk: 10, OS: "Linux" },
      },

      {
        id: "ark",
        name: "ARK: Survival Evolved",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/346110/header.jpg",
        supported: true,
        description:
          "Dinosaur survival MMO server (heavy but Linux supported).",
        steamUrl:
          "https://store.steampowered.com/app/346110/ARK_Survival_Evolved/",
        minRequirements: { CPU: 6, RAM: 16, Disk: 60, OS: "Linux" },
      },

      {
        id: "terraria",
        name: "Terraria Server",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/105600/header.jpg",
        supported: true,
        description:
          "Lightweight 2D survival sandbox server (very easy Linux host).",
        steamUrl: "https://store.steampowered.com/app/105600/Terraria/",
        minRequirements: { CPU: 1, RAM: 2, Disk: 1, OS: "Linux" },
      },

      {
        id: "dontstarve",
        name: "Don't Starve Together",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/322330/header.jpg",
        supported: true,
        description: "Co-op survival server (Linux native dedicated server).",
        steamUrl:
          "https://store.steampowered.com/app/322330/Dont_Starve_Together/",
        minRequirements: { CPU: 2, RAM: 4, Disk: 3, OS: "Linux" },
      },
    ]);
  }, []);

  const isLinux = userSpecs.os.includes("linux");

  const filteredGames = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------------- REQUIREMENT CHECK ---------------- */
  const checkRequirement = (label: string, required: number) => {
    if (label === "CPU") return userSpecs.cpuCores >= required;
    if (label === "RAM") return userSpecs.ramGB >= required;
    if (label === "OS") return isLinux;
    return true;
  };

  /* ---------------- INSTALL SCRIPT ---------------- */
  const getInstallScript = (game: Game) => {
    return `#!/bin/bash

echo "======================================"
echo "🐧 Modix Game Installer"
echo "🎮 ${game.name}"
echo "======================================"

echo "Updating system..."
sudo apt update -y && sudo apt upgrade -y

echo "Installing base tools..."
sudo apt install -y curl wget git screen unzip

echo "Installing SteamCMD..."
mkdir -p ~/steamcmd
cd ~/steamcmd
wget https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz
tar -xvzf steamcmd_linux.tar.gz

echo "Setup complete for ${game.name}"

echo ""
echo "Next step:"
echo "cd ~/steamcmd && ./steamcmd.sh"
`;
  };

  const copyScript = (game: Game) => {
    navigator.clipboard.writeText(getInstallScript(game));
    alert("🐧 Script copied");
  };

  return (
    <div className="games-page">
      <div className="games-header">
        <h1>🐧 Linux Game Server Hub</h1>

        {!isLinux && (
          <p style={{ color: "red" }}>
            ❌ Linux not detected — servers may not run correctly
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
          <div key={game.id} className="game-card">
            <img src={game.image} />

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

                <button
                  className="install-btn"
                  onClick={() => {
                    setSelectedGame(game);
                    setShowModal(true);
                  }}
                >
                  🐧 Install Server Files
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- MODAL ---------------- */}
      {showModal && selectedGame && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedGame.name}</h2>

            <p>System Check</p>

            <ul>
              {Object.entries(selectedGame.minRequirements).map(
                ([key, value]) => (
                  <li key={key}>
                    {key}: {value}{" "}
                    {checkRequirement(key, value) ? (
                      <FaCheckCircle color="limegreen" />
                    ) : (
                      <FaTimesCircle color="red" />
                    )}
                  </li>
                )
              )}
            </ul>

            <button onClick={() => setShowInstaller(true)}>
              📦 Open Installer Script
            </button>

            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* ---------------- INSTALLER ---------------- */}
      {showInstaller && selectedGame && (
        <div className="modal-backdrop" onClick={() => setShowInstaller(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>🐧 Install Script</h3>

            <textarea
              readOnly
              value={getInstallScript(selectedGame)}
              style={{
                width: "100%",
                height: "240px",
                background: "#000",
                color: "#0f0",
                padding: "10px",
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
